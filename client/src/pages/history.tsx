import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Calendar, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { TestResult } from "@shared/schema";
import { animalEmojis, animalNames, personalityNames, genderLabels } from "@shared/schema";
import { motion } from "framer-motion";
import { getUserId } from "@/lib/userId";

export default function HistoryPage() {
  const userId = getUserId();

  const { data: results, isLoading } = useQuery<TestResult[]>({
    queryKey: ["/api/results", userId],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 rounded-2xl shadow-md border border-card-border">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">히스토리를 불러오는 중...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="text-history-title">
            테스트 히스토리
          </h1>
          <p className="text-base text-muted-foreground" data-testid="text-history-subtitle">
            {results && results.length > 0
              ? `총 ${results.length}번의 테스트 결과`
              : "아직 테스트 결과가 없습니다"}
          </p>
        </div>

        {results && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, index) => {
              const report = result.report as any;
              const createdDate = new Date(result.createdAt);
              
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="p-6 rounded-2xl shadow-md border border-card-border hover-elevate" data-testid={`card-result-${result.id}`}>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex gap-4 items-center flex-1">
                        <div className="text-5xl" data-testid={`emoji-animal-${result.id}`}>
                          {animalEmojis[result.animalType as keyof typeof animalEmojis]}
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className="text-lg font-semibold text-foreground" data-testid={`text-result-title-${result.id}`}>
                            {animalNames[result.animalType as keyof typeof animalNames]}{" "}
                            {personalityNames[result.personalityType as keyof typeof personalityNames]}
                          </h3>
                          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span data-testid={`text-date-${result.id}`}>
                                {createdDate.toLocaleDateString("ko-KR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span data-testid={`text-gender-${result.id}`}>
                                {genderLabels[result.gender as keyof typeof genderLabels]}
                              </span>
                            </div>
                            <span>•</span>
                            <span data-testid={`text-emotion-${result.id}`}>
                              감성지수 {result.emotionScore}%
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {report.keywords?.slice(0, 3).map((keyword: string, idx: number) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs px-2 py-1"
                                data-testid={`badge-keyword-${result.id}-${idx}`}
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 rounded-2xl shadow-md border border-card-border text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">테스트 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-6">첫 번째 성격 테스트를 시작해보세요!</p>
            <Link href="/">
              <Button data-testid="button-start-test">
                테스트 시작하기
              </Button>
            </Link>
          </Card>
        )}

        <div className="flex justify-center pt-6">
          <Link href="/">
            <Button variant="outline" className="gap-2" data-testid="button-home">
              <Home className="h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
