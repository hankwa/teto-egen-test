import { z } from "zod";
import { pgTable, serial, varchar, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const animalTypes = ["dog", "cat", "fox", "rabbit", "bear", "deer"] as const;
export const personalityTypes = ["teto", "egen", "tegen"] as const;
export const genderTypes = ["male", "female"] as const;

export const animalTypeSchema = z.enum(animalTypes);
export const personalityTypeSchema = z.enum(personalityTypes);
export const genderTypeSchema = z.enum(genderTypes);

export type AnimalType = z.infer<typeof animalTypeSchema>;
export type PersonalityType = z.infer<typeof personalityTypeSchema>;
export type Gender = z.infer<typeof genderTypeSchema>;

export interface FacialFeatures {
  eyebrowAngle: number;
  lipCurvature: number;
  jawlineAngle: number;
  faceWidthRatio: number;
  eyeDistance: number;
}

export interface SurveyAnswer {
  questionId: number;
  answer: "A" | "B" | "C" | "D";
}

export interface AnalysisResult {
  personalityType: PersonalityType;
  animalType: AnimalType;
  emotionScore: number;
  facialFeatures: FacialFeatures;
  surveyAnswers: SurveyAnswer[];
  gender: Gender;
  report: PersonalityReport;
}

export interface AnimalCompatibility {
  animalType: AnimalType;
  score: number;
  reason: string;
}

export interface CompatibilityScore {
  teto: number;
  tegen: number;
  egen: number;
  recommendedAnimals: AnimalCompatibility[];
}

export interface TraitScores {
  extraversion: number;
  sensing: number;
  thinking: number;
  judging: number;
}

export interface PersonalityReport {
  title: string;
  personalitySummary: string;
  physiognomyAnalysis: string;
  keywords: string[];
  datingStyle: string;
  oneLiner: string;
  compatibilityScores: CompatibilityScore;
  traitScores: TraitScores;
}

export const surveyQuestions = [
  {
    id: 1,
    question: "새로운 사람들을 만나는 것이 즐겁고 에너지가 생긴다",
    emotionWeight: 1,
  },
  {
    id: 2,
    question: "결정을 내릴 때 감정보다 논리와 분석을 우선한다",
    emotionWeight: -1,
  },
  {
    id: 3,
    question: "계획을 세우고 그 계획대로 실행하는 것을 선호한다",
    emotionWeight: -1,
  },
  {
    id: 4,
    question: "상대방의 감정과 분위기를 섬세하게 파악하는 편이다",
    emotionWeight: 1,
  },
  {
    id: 5,
    question: "여러 사람과 함께 있으면 에너지가 충전된다",
    emotionWeight: 1,
  },
  {
    id: 6,
    question: "문제 해결 시 객관적인 사실과 데이터를 중시한다",
    emotionWeight: -1,
  },
  {
    id: 7,
    question: "즉흥적인 것보다 미리 준비된 일정을 좋아한다",
    emotionWeight: -1,
  },
  {
    id: 8,
    question: "다른 사람의 기분이 상하지 않도록 신경을 많이 쓴다",
    emotionWeight: 1,
  },
  {
    id: 9,
    question: "혼자만의 시간이 많으면 외로움을 느낀다",
    emotionWeight: 1,
  },
  {
    id: 10,
    question: "토론할 때 상대방의 감정보다 논리적 타당성을 중요하게 생각한다",
    emotionWeight: -1,
  },
];

export const answerOptions = [
  { value: "A", label: "매우 그렇다", weight: 2 },
  { value: "B", label: "그렇다", weight: 1 },
  { value: "C", label: "아니다", weight: -1 },
  { value: "D", label: "매우 아니다", weight: -2 },
] as const;

export const animalEmojis: Record<AnimalType, string> = {
  dog: "🐶",
  cat: "🐱",
  fox: "🦊",
  rabbit: "🐰",
  bear: "🐻",
  deer: "🦌",
};

export const animalNames: Record<AnimalType, string> = {
  dog: "강아지상",
  cat: "고양이상",
  fox: "여우상",
  rabbit: "토끼상",
  bear: "곰상",
  deer: "사슴상",
};

export const personalityNames: Record<PersonalityType, string> = {
  teto: "테토형",
  egen: "에겐형",
  tegen: "테겐형",
};

export const genderLabels: Record<Gender, string> = {
  male: "남성",
  female: "여성",
};

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }),
  personalityType: varchar("personality_type", { length: 50 }).notNull(),
  animalType: varchar("animal_type", { length: 50 }).notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  emotionScore: integer("emotion_score").notNull(),
  facialFeatures: jsonb("facial_features").notNull(),
  surveyAnswers: jsonb("survey_answers").notNull(),
  report: jsonb("report").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = typeof testResults.$inferInsert;

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  createdAt: true,
});
