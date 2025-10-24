import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { surveyQuestions, answerOptions } from "@shared/schema";
import type { SurveyAnswer } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/LanguageContext";

export default function SurveyPage() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const { t } = useI18n();

  const handleAnswer = (answer: "A" | "B" | "C" | "D") => {
    const newAnswers = [
      ...answers.filter(a => a.questionId !== surveyQuestions[currentQuestion].id),
      { questionId: surveyQuestions[currentQuestion].id, answer }
    ];
    setAnswers(newAnswers);

    if (currentQuestion < surveyQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      localStorage.setItem("surveyAnswers", JSON.stringify(newAnswers));
      setTimeout(() => {
        setLocation("/analysis");
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      setLocation("/upload");
    }
  };

  const currentAnswer = answers.find(
    a => a.questionId === surveyQuestions[currentQuestion].id
  );

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              ✓
            </div>
            <div className="w-16 h-0.5 bg-primary"></div>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              2
            </div>
            <div className="w-16 h-0.5 bg-border"></div>
            <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-semibold">
              3
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground" data-testid="text-survey-title">
            {t('survey', 'title')}
          </h1>
          <p className="text-base text-muted-foreground" data-testid="text-question-progress">
            {t('survey', 'progress', { current: String(currentQuestion + 1), total: String(surveyQuestions.length) })}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
              <div className="space-y-6">
                <h2 
                  className="text-lg md:text-xl font-medium text-foreground text-center leading-relaxed"
                  data-testid={`text-question-${currentQuestion + 1}`}
                >
                  {t('surveyQuestions', `q${surveyQuestions[currentQuestion].id}`)}
                </h2>

                <div className="space-y-3">
                  {answerOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={currentAnswer?.answer === option.value ? "default" : "outline"}
                      size="lg"
                      className="w-full min-h-[60px] text-base"
                      onClick={() => handleAnswer(option.value)}
                      data-testid={`button-answer-${option.value.toLowerCase()}-q${currentQuestion + 1}`}
                    >
                      {t('answerOptions', option.value)}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common', 'previous')}
          </Button>
          <div className="flex gap-1">
            {surveyQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentQuestion ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
