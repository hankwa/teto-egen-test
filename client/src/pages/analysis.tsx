import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generatePersonalityReport } from "@/lib/ai-analysis";
import type { FacialFeatures, SurveyAnswer, PersonalityReport, AnalysisResult } from "@shared/schema";

export default function AnalysisPage() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("AI 모델 불러오는 중...");

  useEffect(() => {
    const analyze = async () => {
      try {
        const facialFeaturesStr = localStorage.getItem("facialFeatures");
        const surveyAnswersStr = localStorage.getItem("surveyAnswers");

        if (!facialFeaturesStr || !surveyAnswersStr) {
          setLocation("/");
          return;
        }

        const facialFeatures: FacialFeatures = JSON.parse(facialFeaturesStr);
        const surveyAnswers: SurveyAnswer[] = JSON.parse(surveyAnswersStr);
        const gender = localStorage.getItem("gender") as "male" | "female" || "male";

        setProgress(10);
        setStatusText("얼굴 특징 분석 중...");

        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(30);
        setStatusText("성격 유형 계산 중...");

        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(50);
        setStatusText("WebLLM 모델 로딩 중...");

        const result = await generatePersonalityReport(facialFeatures, surveyAnswers, gender, (progress) => {
          setProgress(Math.min(99, 50 + (progress * 0.5)));
          if (progress > 80) {
            setStatusText("AI로 리포트 생성 중...");
          }
        });

        setProgress(100);
        setStatusText("분석 완료!");

        localStorage.setItem("analysisResult", JSON.stringify(result));

        await new Promise(resolve => setTimeout(resolve, 800));
        setLocation("/result");
      } catch (error) {
        console.error("Analysis error:", error);
        setStatusText("분석 중 오류가 발생했습니다");
      }
    };

    analyze();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto w-full">
        <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
          <div className="space-y-8 text-center">
            <div className="text-6xl animate-pulse" data-testid="emoji-analyzing">
              🔮
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground" data-testid="text-analyzing-title">
                분석 중입니다
              </h2>
              <p className="text-base text-muted-foreground" data-testid="text-status">
                {statusText}
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-3" data-testid="progress-analysis" />
              <p className="text-sm text-muted-foreground" data-testid="text-progress-percent">
                {Math.round(progress)}%
              </p>
            </div>

            <p className="text-sm text-muted-foreground" data-testid="text-wait-message">
              잠시만 기다려주세요. 당신만의 성격 리포트를 생성하고 있습니다.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
