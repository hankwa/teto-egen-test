import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, ArrowRight, Shield } from "lucide-react";
import { analyzeFacialFeatures } from "@/lib/facial-analysis";
import type { FacialFeatures, Gender } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/LanguageContext";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    localStorage.removeItem("facialFeatures");
    localStorage.removeItem("surveyAnswers");
    localStorage.removeItem("analysisResult");
    localStorage.removeItem("gender");
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: t('upload', 'imageOnly'),
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast, t]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage || !selectedGender) {
      toast({
        title: "Information Required",
        description: t('upload', 'selectGender'),
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const features = await analyzeFacialFeatures(selectedImage);
      localStorage.setItem("facialFeatures", JSON.stringify(features));
      localStorage.setItem("gender", selectedGender);
      setLocation("/survey");
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze face. Please try a different photo.",
        variant: "destructive",
      });
      console.error("Facial analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage, selectedGender, setLocation, toast, t]);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              1
            </div>
            <div className="w-16 h-0.5 bg-border"></div>
            <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-semibold">
              2
            </div>
            <div className="w-16 h-0.5 bg-border"></div>
            <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-semibold">
              3
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground" data-testid="text-upload-title">
            {t('upload', 'title')}
          </h1>
          <p className="text-base text-muted-foreground" data-testid="text-upload-description">
            {t('upload', 'subtitle')}
          </p>
        </div>

        <Card className="p-6 md:p-8 rounded-2xl shadow-md border border-card-border">
          {!selectedImage ? (
            <label
              htmlFor="photo-upload"
              className={`flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-xl cursor-pointer transition-all hover-elevate p-8 ${
                isDragging 
                  ? "border-primary bg-accent/20 scale-[1.02]" 
                  : "border-input hover:border-primary"
              }`}
              data-testid="upload-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Camera className={`w-16 h-16 mb-4 transition-colors ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`} />
              <p className="text-lg font-medium text-foreground mb-2">
                {t('upload', 'dragDropText')}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {t('upload', 'uploadHint')}
              </p>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-photo-upload"
              />
            </label>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Selected photo"
                  className="w-full h-auto max-h-[400px] object-contain"
                  data-testid="img-preview"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-medium text-foreground" data-testid="text-gender-label">
                  {t('upload', 'selectGender')}
                </h3>
                <div className="flex gap-3">
                  <Button
                    variant={selectedGender === "male" ? "default" : "outline"}
                    onClick={() => setSelectedGender("male")}
                    className="flex-1"
                    data-testid="button-gender-male"
                  >
                    {t('upload', 'male')}
                  </Button>
                  <Button
                    variant={selectedGender === "female" ? "default" : "outline"}
                    onClick={() => setSelectedGender("female")}
                    className="flex-1"
                    data-testid="button-gender-female"
                  >
                    {t('upload', 'female')}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedGender(null);
                  }}
                  className="flex-1"
                  data-testid="button-reselect-photo"
                >
                  {t('common', 'retry')}
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !selectedGender}
                  className="flex-1"
                  data-testid="button-next-to-survey"
                >
                  {isAnalyzing ? t('common', 'loading') : t('common', 'next')}
                  {!isAnalyzing && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="bg-accent/30 rounded-xl p-6 flex items-start gap-4">
          <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-medium text-foreground text-sm">
              {t('upload', 'privacyTitle')}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('upload', 'privacyText1')}
              {" "}
              {t('upload', 'privacyText2')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
