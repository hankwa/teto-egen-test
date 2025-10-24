import type { 
  FacialFeatures, 
  SurveyAnswer, 
  PersonalityType, 
  AnimalType,
  PersonalityReport,
  AnalysisResult,
  Gender,
  TraitScores,
  AnimalCompatibility,
  CompatibilityScore
} from "@shared/schema";
import { surveyQuestions, animalNames, personalityNames, animalEmojis, answerOptions } from "@shared/schema";
import { classifyAnimalType } from "./facial-analysis";
import * as webllm from "@mlc-ai/web-llm";

let engine: webllm.MLCEngine | null = null;

export function calculateTraitScores(answers: SurveyAnswer[]): TraitScores {
  const traitMapping = [
    { ids: [1, 5, 9], trait: 'extraversion' },
    { ids: [2, 6, 10], trait: 'thinking' },
    { ids: [3, 7], trait: 'judging' },
    { ids: [4, 8], trait: 'sensing' },
  ];

  const scores: Record<string, number> = {
    extraversion: 0,
    sensing: 0,
    thinking: 0,
    judging: 0,
  };

  traitMapping.forEach(({ ids, trait }) => {
    let traitScore = 0;
    ids.forEach(id => {
      const answer = answers.find(a => a.questionId === id);
      if (answer) {
        const weight = answerOptions.find(opt => opt.value === answer.answer)?.weight || 0;
        traitScore += weight;
      }
    });
    scores[trait] = Math.max(0, Math.min(100, 50 + (traitScore / ids.length) * 25));
  });

  return {
    extraversion: Math.round(scores.extraversion),
    sensing: Math.round(scores.sensing),
    thinking: Math.round(scores.thinking),
    judging: Math.round(scores.judging),
  };
}

export function calculateEmotionScore(answers: SurveyAnswer[]): number {
  let totalWeight = 0;
  let maxPossibleWeight = 0;

  answers.forEach(answer => {
    const question = surveyQuestions.find(q => q.id === answer.questionId);
    const answerWeight = answerOptions.find(opt => opt.value === answer.answer)?.weight || 0;
    
    if (question) {
      maxPossibleWeight += Math.abs(question.emotionWeight) * 2;
      totalWeight += question.emotionWeight * answerWeight;
    }
  });

  const normalizedScore = (totalWeight + maxPossibleWeight) / (2 * maxPossibleWeight);
  return Math.max(0, Math.min(1, normalizedScore));
}

export function classifyPersonalityType(emotionScore: number): PersonalityType {
  if (emotionScore >= 0.65) {
    return "egen";
  } else if (emotionScore <= 0.35) {
    return "teto";
  } else {
    return "tegen";
  }
}

async function initializeWebLLM(progressCallback?: (progress: number) => void): Promise<webllm.MLCEngine | null> {
  if (engine) return engine;

  try {
    engine = await webllm.CreateMLCEngine("TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC", {
      initProgressCallback: (report) => {
        if (progressCallback && report.progress !== undefined) {
          progressCallback(report.progress * 100);
        }
      },
    });
    return engine;
  } catch (error) {
    console.error("WebLLM initialization failed:", error);
    return null;
  }
}

export async function generatePersonalityReport(
  facialFeatures: FacialFeatures,
  surveyAnswers: SurveyAnswer[],
  gender: Gender,
  progressCallback?: (progress: number) => void
): Promise<AnalysisResult> {
  const emotionScore = calculateEmotionScore(surveyAnswers);
  const personalityType = classifyPersonalityType(emotionScore);
  const animalType = classifyAnimalType(facialFeatures);
  const traitScores = calculateTraitScores(surveyAnswers);

  const report = await generateReportWithAI(
    personalityType,
    animalType,
    emotionScore,
    facialFeatures,
    gender,
    traitScores,
    progressCallback
  );

  return {
    personalityType,
    animalType,
    emotionScore,
    facialFeatures,
    surveyAnswers,
    gender,
    report,
  };
}

async function generateReportWithAI(
  personalityType: PersonalityType,
  animalType: AnimalType,
  emotionScore: number,
  facialFeatures: FacialFeatures,
  gender: Gender,
  traitScores: TraitScores,
  progressCallback?: (progress: number) => void
): Promise<PersonalityReport> {
  const title = `당신은 ${animalEmojis[animalType]} ${animalNames[animalType]} ${personalityNames[personalityType]}입니다`;

  try {
    if (progressCallback) progressCallback(50);
    
    const llmEngine = await initializeWebLLM((progress) => {
      if (progressCallback) {
        progressCallback(50 + (progress * 0.3));
      }
    });

    if (llmEngine) {
      const prompt = createPrompt(personalityType, animalType, emotionScore, facialFeatures);
      
      if (progressCallback) progressCallback(80);
      
      const response = await llmEngine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 800,
      });

      if (progressCallback) progressCallback(90);

      const generatedText = response.choices[0]?.message?.content || "";
      return parseAIResponse(generatedText, title, personalityType, gender, traitScores);
    }
  } catch (error) {
    console.error("WebLLM generation failed, using fallback:", error);
  }

  return generateFallbackReport(personalityType, animalType, title, gender, traitScores);
}

function createPrompt(
  personalityType: PersonalityType,
  animalType: AnimalType,
  emotionScore: number,
  facialFeatures: FacialFeatures
): string {
  return `당신은 관상학자이자 심리 분석 전문가입니다. 다음 데이터를 바탕으로 사용자의 인상과 성격을 따뜻하고 서정적인 한국어로 설명해주세요.

[입력 데이터]
유형: ${personalityNames[personalityType]}
동물형: ${animalNames[animalType]}
감성지수: ${(emotionScore * 100).toFixed(0)}%
얼굴 특징: 눈썹 각도 ${facialFeatures.eyebrowAngle.toFixed(1)}°, 입꼬리 곡률 ${facialFeatures.lipCurvature.toFixed(2)}, 얼굴 폭비율 ${facialFeatures.faceWidthRatio.toFixed(2)}

[출력 형식]
1. 성격 요약 (3-5문장)
2. 관상학적 특징 (3-5문장)
3. 키워드 3개 (이모지 포함, 예: ✨ #통찰력)
4. 연애스타일 (1문장)
5. 한줄 요약

각 섹션을 명확히 구분하여 작성해주세요.`;
}

function calculateRecommendedAnimals(personalityType: PersonalityType, gender: Gender): AnimalCompatibility[] {
  const animalCompatibilityData: Record<PersonalityType, Record<AnimalType, { score: number; reason: string }>> = {
    teto: {
      dog: { score: 75, reason: "충성스럽고 신뢰할 수 있는 관계를 만들 수 있어요" },
      cat: { score: 85, reason: "서로의 독립성을 존중하며 안정적인 관계를 유지해요" },
      fox: { score: 80, reason: "영리하고 전략적인 사고로 서로를 이해합니다" },
      rabbit: { score: 65, reason: "차분함과 섬세함이 조화를 이룹니다" },
      bear: { score: 90, reason: "든든하고 믿음직한 파트너십을 형성해요" },
      deer: { score: 70, reason: "우아함과 이성적 판단이 잘 어울립니다" },
    },
    tegen: {
      dog: { score: 88, reason: "밝고 긍정적인 에너지가 완벽하게 조화를 이뤄요" },
      cat: { score: 75, reason: "균형잡힌 관계로 서로를 보완합니다" },
      fox: { score: 92, reason: "유연한 사고와 적응력이 최고의 궁합이에요" },
      rabbit: { score: 85, reason: "부드럽고 따뜻한 관계를 만들어갑니다" },
      bear: { score: 80, reason: "안정감과 활력이 조화롭게 어우러져요" },
      deer: { score: 90, reason: "우아하고 조화로운 관계를 형성해요" },
    },
    egen: {
      dog: { score: 95, reason: "따뜻한 마음과 충성심이 완벽한 조화를 이뤄요" },
      cat: { score: 70, reason: "감성을 이해하고 존중하는 관계예요" },
      fox: { score: 75, reason: "영리함과 감성이 균형을 맞춥니다" },
      rabbit: { score: 90, reason: "순수하고 따뜻한 마음이 깊이 공감해요" },
      bear: { score: 85, reason: "포근하고 안정적인 관계를 만들어요" },
      deer: { score: 88, reason: "섬세하고 우아한 감성이 어울립니다" },
    },
  };

  const compatibilityList = animalCompatibilityData[personalityType];
  const genderBonus = gender === "male" ? { dog: 5, rabbit: -3, bear: 3 } : { cat: 5, deer: 5, fox: 3 };

  const animalScores: AnimalCompatibility[] = Object.entries(compatibilityList).map(([animal, data]) => ({
    animalType: animal as AnimalType,
    score: Math.max(60, Math.min(100, data.score + (genderBonus[animal as keyof typeof genderBonus] || 0) + Math.floor(Math.random() * 6 - 3))),
    reason: data.reason,
  }));

  return animalScores.sort((a, b) => b.score - a.score).slice(0, 3);
}

function calculateCompatibilityScores(personalityType: PersonalityType, gender: Gender): CompatibilityScore {
  const baseScores: Record<PersonalityType, { teto: number; tegen: number; egen: number }> = {
    teto: { teto: 70, tegen: 85, egen: 45 },
    tegen: { teto: 85, tegen: 75, egen: 80 },
    egen: { teto: 45, tegen: 80, egen: 90 },
  };

  const genderAdjustment = gender === "male" ? { teto: -5, tegen: 0, egen: 5 } : { teto: 5, tegen: 0, egen: -5 };
  
  const scores = baseScores[personalityType];
  const recommendedAnimals = calculateRecommendedAnimals(personalityType, gender);

  return {
    teto: Math.max(10, Math.min(100, scores.teto + genderAdjustment.teto + Math.floor(Math.random() * 10 - 5))),
    tegen: Math.max(10, Math.min(100, scores.tegen + genderAdjustment.tegen + Math.floor(Math.random() * 10 - 5))),
    egen: Math.max(10, Math.min(100, scores.egen + genderAdjustment.egen + Math.floor(Math.random() * 10 - 5))),
    recommendedAnimals,
  };
}

function parseAIResponse(text: string, title: string, personalityType: PersonalityType, gender: Gender, traitScores: TraitScores): PersonalityReport {
  console.log("Parsing AI response:", text.substring(0, 200));
  
  const sections = text.split('\n\n');
  
  let personalitySummary = "";
  let physiognomyAnalysis = "";
  let keywords: string[] = [];
  let datingStyle = "";
  let oneLiner = "";

  sections.forEach((section) => {
    const cleanSection = section.trim();
    
    if (cleanSection.match(/^[0-9]\.\s*성격/i)) {
      personalitySummary = cleanSection.replace(/^[0-9]\.\s*성격\s*요약?[:：]?\s*/i, "").trim();
    } else if (cleanSection.match(/^[0-9]\.\s*관상/i) || cleanSection.match(/^[0-9]\.\s*특징/i)) {
      physiognomyAnalysis = cleanSection.replace(/^[0-9]\.\s*(관상.*특징|특징|관상)[:：]?\s*/i, "").trim();
    } else if (cleanSection.match(/^[0-9]\.\s*키워드/i)) {
      const keywordText = cleanSection.replace(/^[0-9]\.\s*키워드.*[:：]?\s*/i, "");
      keywords = keywordText.split(/[,\n]/).map(k => k.trim()).filter(k => k && k.length > 0).slice(0, 3);
    } else if (cleanSection.match(/^[0-9]\.\s*연애/i)) {
      datingStyle = cleanSection.replace(/^[0-9]\.\s*연애.*[:：]?\s*/i, "").trim();
    } else if (cleanSection.match(/^[0-9]\.\s*한줄/i)) {
      oneLiner = cleanSection.replace(/^[0-9]\.\s*한줄.*[:：]?\s*/i, "").replace(/["""]/g, "").trim();
    }
  });

  const hasInvalidContent = (str: string) => {
    const invalidPatterns = [
      /명확히 구분하여 작성/,
      /출력 형식/,
      /입력 데이터/,
      /반드시.*명확/,
      /섹션을.*구분/
    ];
    return invalidPatterns.some(pattern => pattern.test(str));
  };

  const isValidParsing = 
    personalitySummary && 
    personalitySummary.length > 20 && 
    !hasInvalidContent(personalitySummary) &&
    keywords.length >= 2 &&
    datingStyle &&
    datingStyle.length > 10 &&
    !hasInvalidContent(datingStyle);

  if (!isValidParsing) {
    console.log("AI parsing failed, using fallback report");
    return generateFallbackReport(
      personalityType,
      title.includes("강아지") ? "dog" : title.includes("고양이") ? "cat" : 
      title.includes("여우") ? "fox" : title.includes("토끼") ? "rabbit" : 
      title.includes("곰") ? "bear" : "deer",
      title,
      gender,
      traitScores
    );
  }

  const compatibilityScores = calculateCompatibilityScores(personalityType, gender);

  return {
    title,
    personalitySummary,
    physiognomyAnalysis: physiognomyAnalysis || "당신만의 독특한 매력을 지니고 있습니다.",
    keywords: keywords.length > 0 ? keywords : ["✨ 특별함", "💫 매력", "🌟 개성"],
    datingStyle,
    oneLiner: oneLiner || "당신만의 독특한 매력을 지녔습니다.",
    compatibilityScores,
    traitScores,
  };
}

function generateFallbackReport(
  personalityType: PersonalityType,
  animalType: AnimalType,
  title: string,
  gender: Gender,
  traitScores: TraitScores
): PersonalityReport {

  const personalitySummaries: Record<PersonalityType, string[]> = {
    teto: [
      "당신은 논리적이고 분석적인 사고를 가진 사람입니다. 감정보다는 이성을 우선시하며, 객관적인 판단을 내리는 것을 중요하게 생각합니다.",
      "문제 해결 능력이 뛰어나며, 복잡한 상황에서도 침착하게 대응합니다. 계획적이고 체계적인 접근을 선호합니다.",
      "다른 사람들은 당신의 냉철한 판단력과 안정적인 태도를 신뢰합니다."
    ],
    egen: [
      "당신은 따뜻하고 공감 능력이 뛰어난 사람입니다. 다른 사람의 감정을 잘 이해하고 배려하는 마음이 깊습니다.",
      "인간관계에서 정서적 교감을 중요하게 여기며, 주변 사람들에게 위로와 힘이 되어줍니다.",
      "당신의 진심 어린 관심과 따뜻한 성격은 많은 사람들에게 큰 영향을 미칩니다."
    ],
    tegen: [
      "당신은 감성과 이성의 균형을 잘 맞추는 사람입니다. 상황에 따라 논리적 판단과 감정적 공감을 적절히 활용합니다.",
      "유연한 사고방식으로 다양한 관점을 이해하며, 중재자 역할을 잘 수행합니다.",
      "이러한 균형감각은 당신을 신뢰할 수 있고 안정적인 사람으로 만들어줍니다."
    ]
  };

  const physiognomyDescriptions: Record<AnimalType, string[]> = {
    dog: [
      "친근하고 밝은 인상을 가지고 있어 첫 만남에서도 호감을 줍니다.",
      "눈빛이 순수하고 맑아 사람들에게 편안함을 느끼게 합니다.",
      "표정이 풍부하고 감정 표현이 자연스러워 진정성이 느껴집니다."
    ],
    cat: [
      "세련되고 우아한 인상으로 신비로운 매력을 풍깁니다.",
      "눈매가 또렷하고 카리스마 있어 독특한 아우라가 있습니다.",
      "절제된 표정 속에서도 강한 존재감을 드러냅니다."
    ],
    fox: [
      "영리하고 날카로운 인상으로 지적인 매력이 있습니다.",
      "눈빛이 예리하고 통찰력 있어 보이며, 섬세한 아름다움이 돋보입니다.",
      "표정에서 기민함과 영리함이 느껴져 매력적입니다."
    ],
    rabbit: [
      "부드럽고 온화한 인상으로 친근감을 줍니다.",
      "동그란 얼굴형과 순한 눈빛이 사랑스러운 매력을 만듭니다.",
      "표정이 밝고 긍정적이어서 주변을 화사하게 만듭니다."
    ],
    bear: [
      "든든하고 믿음직한 인상으로 안정감을 줍니다.",
      "얼굴에서 포용력과 너그러움이 느껴집니다.",
      "부드러운 카리스마로 주변 사람들에게 편안함을 선사합니다."
    ],
    deer: [
      "청순하고 우아한 인상으로 순수한 아름다움이 있습니다.",
      "맑고 깨끗한 눈빛이 인상적이며 고요한 매력을 지녔습니다.",
      "섬세하고 품위 있는 분위기가 자연스럽게 풍깁니다."
    ]
  };

  const keywordSets: Record<PersonalityType, Record<AnimalType, string[]>> = {
    teto: {
      dog: ["✨ 충직한분석가", "🎯 논리적사교성", "🔍 신뢰의지성"],
      cat: ["🌙 냉철한독립성", "💎 이성적우아함", "🎭 통찰력"],
      fox: ["🦊 전략적사고", "⚡ 날카로운분석", "🎯 영리한판단"],
      rabbit: ["🌸 온화한이성", "💭 차분한논리", "🎀 부드러운지혜"],
      bear: ["🏔️ 안정적판단", "🛡️ 믿음직한논리", "🌲 든든한분석"],
      deer: ["🌿 우아한이성", "✨ 맑은통찰", "🎨 세련된판단"]
    },
    egen: {
      dog: ["❤️ 따뜻한공감", "🌟 순수한열정", "🤝 진심어린배려"],
      cat: ["💫 감성적카리스마", "🎭 신비로운감수성", "🌙 섬세한직관"],
      fox: ["🎨 영리한감성", "💡 예민한공감", "✨ 세심한배려"],
      rabbit: ["🌸 사랑스런감성", "💕 순한마음", "🎀 다정한성격"],
      bear: ["🤗 포근한감성", "💝 넉넉한마음", "🌻 따스한포용"],
      deer: ["🌙 청순한감성", "✨ 순수한마음", "🎨 우아한감수성"]
    },
    tegen: {
      dog: ["⚖️ 균형잡힌성격", "🌈 유연한사고", "🎯 적응력"],
      cat: ["🎭 조화로운카리스마", "💫 균형감각", "🌙 중립적매력"],
      fox: ["🧩 융통성", "⚡ 상황판단력", "🎯 균형잡힌지혜"],
      rabbit: ["🌸 조화로운성격", "💭 온화한균형", "🎀 부드러운융통성"],
      bear: ["🏔️ 안정적균형", "🛡️ 중도적판단", "🌲 든든한조화"],
      deer: ["🌿 우아한균형", "✨ 조화로운품격", "🎨 세련된중립"]
    }
  };

  const datingStyles: Record<PersonalityType, Record<AnimalType, string>> = {
    teto: {
      dog: "충실하고 계획적인 관계형",
      cat: "독립적이고 이성적인 파트너",
      fox: "전략적이고 영리한 연인",
      rabbit: "차분하고 안정적인 사랑",
      bear: "믿음직하고 든든한 동반자",
      deer: "우아하고 절제된 로맨스"
    },
    egen: {
      dog: "열정적이고 헌신적인 연인",
      cat: "감성적이고 신비로운 사랑",
      fox: "세심하고 배려 깊은 파트너",
      rabbit: "다정하고 애정 넘치는 관계",
      bear: "포근하고 따뜻한 사랑",
      deer: "순수하고 깊은 감정 교류"
    },
    tegen: {
      dog: "균형잡힌 파트너십",
      cat: "조화로운 독립적 관계",
      fox: "유연하고 이해심 깊은 사랑",
      rabbit: "안정적이고 편안한 연애",
      bear: "든든하고 중도적인 파트너",
      deer: "우아하고 절제된 로맨스"
    }
  };

  const oneLiners: Record<PersonalityType, string[]> = {
    teto: [
      "당신의 눈빛은 차분하지만 깊은 통찰력을 담고 있습니다.",
      "당신의 미소는 절제되어 있지만 신뢰감을 줍니다.",
      "당신의 표정에서 이성적이면서도 안정적인 아우라가 느껴집니다."
    ],
    egen: [
      "당신의 미소는 따뜻하고 진심이 느껴집니다.",
      "당신의 눈빛에서 깊은 공감과 이해가 전해집니다.",
      "당신의 표정은 주변 사람들에게 위로와 힘을 줍니다."
    ],
    tegen: [
      "당신의 얼굴에서 조화와 균형의 아름다움이 느껴집니다.",
      "당신의 표정은 상황에 따라 유연하게 변화하는 매력이 있습니다.",
      "당신의 인상은 안정적이면서도 다채로운 매력을 지녔습니다."
    ]
  };

  const personalitySummary = personalitySummaries[personalityType].join(" ");
  const physiognomyAnalysis = physiognomyDescriptions[animalType].join(" ");
  const keywords = keywordSets[personalityType][animalType];
  const datingStyle = datingStyles[personalityType][animalType];
  const oneLiner = oneLiners[personalityType][Math.floor(Math.random() * oneLiners[personalityType].length)];
  const compatibilityScores = calculateCompatibilityScores(personalityType, gender);

  return {
    title,
    personalitySummary,
    physiognomyAnalysis,
    keywords,
    datingStyle,
    oneLiner,
    compatibilityScores,
    traitScores,
  };
}
