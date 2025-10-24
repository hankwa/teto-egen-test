import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Home from "@/pages/home";
import UploadPage from "@/pages/upload";
import SurveyPage from "@/pages/survey";
import AnalysisPage from "@/pages/analysis";
import ResultPage from "@/pages/result";
import HistoryPage from "@/pages/history";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/survey" component={SurveyPage} />
      <Route path="/analysis" component={AnalysisPage} />
      <Route path="/result" component={ResultPage} />
      <Route path="/history" component={HistoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <div className="min-h-screen flex flex-col">
            <header className="fixed top-0 right-0 z-50 p-4">
              <LanguageSwitcher />
            </header>
            <main className="flex-1">
              <Router />
            </main>
          </div>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
