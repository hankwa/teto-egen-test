import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        <div className="text-6xl md:text-7xl mb-6 animate-pulse">✨</div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight" data-testid="text-app-title">
          테토·에겐 남녀 테스트
        </h1>
        
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed" data-testid="text-app-description">
          당신의 얼굴 특징과 심리 설문을 분석하여 고유한 성격을 알려드립니다.
          <br />
          재미있고 흥미로운 AI 분석으로 자신에 대한 새로운 인사이트를 발견하세요.
        </p>

        <div className="pt-4">
          <Link href="/upload">
            <Button 
              size="lg" 
              className="rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              data-testid="button-start-test"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              시작하기
            </Button>
          </Link>
        </div>

        <div className="pt-8">
          <p className="text-sm text-muted-foreground" data-testid="text-privacy-notice">
            🔒 개인정보 보호: 사진은 서버로 전송되지 않고 브라우저에서만 처리됩니다
          </p>
        </div>
      </motion.div>
    </div>
  );
}
