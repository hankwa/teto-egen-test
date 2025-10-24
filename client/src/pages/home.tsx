import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/LanguageContext";

export default function Home() {
  const { t } = useI18n();

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
          {t('home', 'title')}
        </h1>
        
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed" data-testid="text-app-description">
          {t('home', 'description')}
          <br />
          <span className="text-primary font-semibold">{t('home', 'aiHighlight')}</span>{t('home', 'aiDescription')}
        </p>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 max-w-xl mx-auto border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t('home', 'aiSystemTitle')}</h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>{t('home', 'aiFeature1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>{t('home', 'aiFeature2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>{t('home', 'aiFeature3')}</span>
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <Link href="/upload">
            <Button 
              size="lg" 
              className="rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              data-testid="button-start-test"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {t('common', 'getStarted')}
            </Button>
          </Link>
        </div>

        <div className="pt-8">
          <p className="text-sm text-muted-foreground" data-testid="text-privacy-notice">
            🔒 {t('home', 'privacyNote')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
