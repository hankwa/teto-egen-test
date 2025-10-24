import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Home, Twitter, History, Sparkles } from "lucide-react";
import { SiInstagram, SiFacebook } from "react-icons/si";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import type { AnalysisResult, PersonalityReport } from "@shared/schema";
import { animalEmojis, animalNames, personalityNames } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUserId } from "@/lib/userId";
import { TraitRadarChart } from "@/components/TraitRadarChart";

export default function ResultPage() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [report, setReport] = useState<PersonalityReport | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const analysisResultStr = localStorage.getItem("analysisResult");
    
    if (!analysisResultStr) {
      setLocation("/");
      return;
    }

    const analysisResult = JSON.parse(analysisResultStr);
    setResult(analysisResult);
    setReport(analysisResult.report);

    const saveResult = async () => {
      try {
        await apiRequest("/api/results", "POST", {
          userId: getUserId(),
          personalityType: analysisResult.personalityType,
          animalType: analysisResult.animalType,
          gender: analysisResult.gender,
          emotionScore: Math.round(analysisResult.emotionScore * 100),
          facialFeatures: analysisResult.facialFeatures,
          surveyAnswers: analysisResult.surveyAnswers,
          report: analysisResult.report,
        });
      } catch (error) {
        console.error("Failed to save result:", error);
      }
    };

    saveResult();
  }, [setLocation]);

  const handleDownload = async () => {
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = "teto-egen-result.png";
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "다운로드 완료",
        description: "결과 이미지가 저장되었습니다",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "다운로드 실패",
        description: "이미지 저장에 실패했습니다",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    const text = `나는 ${result ? animalNames[result.animalType] : ""} ${result ? personalityNames[result.personalityType] : ""}! 테토·에겐 성격 테스트`;
    const url = window.location.origin;

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      instagram: url,
    };

    if (platform === "instagram") {
      toast({
        title: "Instagram 공유",
        description: "결과 이미지를 다운로드하여 Instagram에 공유하세요",
      });
      handleDownload();
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  if (!result || !report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          ref={resultRef}
          className="space-y-6"
        >
          <Card className="p-6 md:p-8 rounded-2xl shadow-lg border border-card-border text-center bg-gradient-to-br from-background to-accent/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-7xl mb-6"
            >
              {animalEmojis[result.animalType]}
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-result-title">
              {report.title}
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-emotion-score">
              감성지수: {Math.round(result.emotionScore * 100)}%
            </p>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-section-personality">
                  성격 요약
                </h2>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI 분석
                </Badge>
              </div>
              <p className="text-base text-foreground leading-relaxed whitespace-pre-line" data-testid="text-personality-summary">
                {report.personalitySummary}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-section-physiognomy">
                  관상학적 특징
                </h2>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI 분석
                </Badge>
              </div>
              <p className="text-base text-foreground leading-relaxed whitespace-pre-line" data-testid="text-physiognomy">
                {report.physiognomyAnalysis}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
              <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-section-keywords">
                핵심 키워드
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {report.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-base px-4 py-2 rounded-full"
                    data-testid={`badge-keyword-${index}`}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
              <h2 className="text-xl font-semibold text-foreground mb-6" data-testid="text-section-traits">
                성격 특성 분석
              </h2>
              <div className="space-y-6">
                <TraitRadarChart scores={report.traitScores} />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">외향성</span>
                      <span className="font-medium text-foreground" data-testid="text-trait-extraversion">
                        {report.traitScores.extraversion}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" 
                        style={{ width: `${report.traitScores.extraversion}%` }}
                        data-testid="bar-trait-extraversion"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">감각형</span>
                      <span className="font-medium text-foreground" data-testid="text-trait-sensing">
                        {report.traitScores.sensing}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" 
                        style={{ width: `${report.traitScores.sensing}%` }}
                        data-testid="bar-trait-sensing"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">사고형</span>
                      <span className="font-medium text-foreground" data-testid="text-trait-thinking">
                        {report.traitScores.thinking}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full" 
                        style={{ width: `${report.traitScores.thinking}%` }}
                        data-testid="bar-trait-thinking"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">계획형</span>
                      <span className="font-medium text-foreground" data-testid="text-trait-judging">
                        {report.traitScores.judging}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" 
                        style={{ width: `${report.traitScores.judging}%` }}
                        data-testid="bar-trait-judging"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border bg-accent/30">
              <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-section-dating">
                연애 스타일
              </h2>
              <p className="text-lg text-foreground font-medium text-center" data-testid="text-dating-style">
                {report.datingStyle}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
              <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-section-compatibility">
                {result.gender === "male" ? "여성" : "남성"} 성격 유형별 궁합
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground font-medium">테토형</span>
                    <span className="text-muted-foreground" data-testid="text-compatibility-teto">
                      {report.compatibilityScores.teto}%
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${report.compatibilityScores.teto}%` }}
                      transition={{ delay: 1.6, duration: 0.8, ease: "easeOut" }}
                      data-testid="bar-compatibility-teto"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground font-medium">테겐형</span>
                    <span className="text-muted-foreground" data-testid="text-compatibility-tegen">
                      {report.compatibilityScores.tegen}%
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${report.compatibilityScores.tegen}%` }}
                      transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
                      data-testid="bar-compatibility-tegen"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground font-medium">에겐형</span>
                    <span className="text-muted-foreground" data-testid="text-compatibility-egen">
                      {report.compatibilityScores.egen}%
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${report.compatibilityScores.egen}%` }}
                      transition={{ delay: 2.0, duration: 0.8, ease: "easeOut" }}
                      data-testid="bar-compatibility-egen"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
              <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-section-animal-compatibility">
                추천 동물상
              </h2>
              <div className="space-y-4">
                {report.compatibilityScores.recommendedAnimals.map((animal, index) => (
                  <motion.div
                    key={animal.animalType}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.4 + index * 0.1, duration: 0.4 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover-elevate"
                    data-testid={`card-animal-${animal.animalType}`}
                  >
                    <div className="text-4xl" data-testid={`emoji-animal-${animal.animalType}`}>
                      {animalEmojis[animal.animalType]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground" data-testid={`text-animal-name-${animal.animalType}`}>
                          {animalNames[animal.animalType]}
                        </h3>
                        <Badge variant="secondary" className="font-medium" data-testid={`badge-animal-score-${animal.animalType}`}>
                          {animal.score}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-animal-reason-${animal.animalType}`}>
                        {animal.reason}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
              <blockquote className="text-base md:text-lg text-foreground italic text-center leading-relaxed" data-testid="text-oneliner">
                "{report.oneLiner}"
              </blockquote>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="space-y-4 pt-4"
        >
          <Card className="p-6 rounded-2xl shadow-md border border-card-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center" data-testid="text-share-title">
              결과 공유하기
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare("twitter")}
                className="gap-2"
                data-testid="button-share-twitter"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("facebook")}
                className="gap-2"
                data-testid="button-share-facebook"
              >
                <SiFacebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("instagram")}
                className="gap-2"
                data-testid="button-share-instagram"
              >
                <SiInstagram className="h-4 w-4" />
                Instagram
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="gap-2"
                data-testid="button-download"
              >
                <Download className="h-4 w-4" />
                다운로드
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/history">
              <Button variant="outline" className="w-full gap-2" data-testid="button-history">
                <History className="h-4 w-4" />
                히스토리
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full gap-2" data-testid="button-home">
                <Home className="h-4 w-4" />
                처음으로
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
