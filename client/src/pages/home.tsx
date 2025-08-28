import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { translateCode, getRecentTranslations } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/app-header";
import LanguageSelector from "@/components/language-selector";
import CodeEditor from "@/components/code-editor";
import FeatureCards from "@/components/feature-cards";
import RecentTranslations from "@/components/recent-translations";
import PerformanceMetrics from "@/components/performance-metrics";
import CPUUsageChart from "@/components/cpu-usage-chart";
import ComplexityVisualization from "@/components/complexity-visualization";
import AppFooter from "@/components/app-footer";
import { Button } from "@/components/ui/button";
import { Loader2, Languages, Trash2, Save, Share } from "lucide-react";
import type { SupportedLanguage, TranslateRequest } from "@shared/schema";

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>("cpp");
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>("python");
  const [sourceCode, setSourceCode] = useState("");
  const [translatedCode, setTranslatedCode] = useState("");
  const [complexityAnalysis, setComplexityAnalysis] = useState<{
    timeComplexity: string;
    spaceComplexity: string;
    description: string;
  } | undefined>();
  const { toast } = useToast();

  const { data: recentTranslations } = useQuery({
    queryKey: ["/api/translations/recent"],
    staleTime: 30000,
  });

  const translateMutation = useMutation({
    mutationFn: (request: TranslateRequest) => translateCode(request),
    onSuccess: (data) => {
      setTranslatedCode(data.translation.translatedCode);
      setComplexityAnalysis(data.complexityAnalysis);
      toast({
        title: "Translation Complete",
        description: "Your code has been successfully translated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/translations/recent"] });
    },
    onError: (error) => {
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "An error occurred during translation",
        variant: "destructive",
      });
    },
  });

  const handleTranslate = () => {
    if (!sourceCode.trim()) {
      toast({
        title: "No Code to Translate",
        description: "Please enter some code to translate",
        variant: "destructive",
      });
      return;
    }

    if (sourceLanguage === targetLanguage) {
      toast({
        title: "Same Languages Selected",
        description: "Please select different source and target languages",
        variant: "destructive",
      });
      return;
    }

    translateMutation.mutate({
      sourceLanguage,
      targetLanguage,
      sourceCode,
    });
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    if (translatedCode) {
      setSourceCode(translatedCode);
      setTranslatedCode("");
      setComplexityAnalysis(undefined);
    }
  };

  const handleClear = () => {
    setSourceCode("");
    setTranslatedCode("");
    setComplexityAnalysis(undefined);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100">
      <AppHeader />
      
      <div className="flex">
        {/* Left Sidebar - CPU Usage Chart */}
        <div className="hidden lg:block w-64 p-4">
          <div className="sticky top-20">
            <CPUUsageChart />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LanguageSelector
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceLanguageChange={setSourceLanguage}
          onTargetLanguageChange={setTargetLanguage}
          onSwapLanguages={handleSwapLanguages}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CodeEditor
            language={sourceLanguage}
            value={sourceCode}
            onChange={setSourceCode}
            title="Source Code"
            placeholder={`// Enter your ${sourceLanguage.toUpperCase()} code here`}
            data-testid="source-code-editor"
          />
          
          <CodeEditor
            language={targetLanguage}
            value={translatedCode}
            readOnly
            title="Translated Code"
            isTranslated
            isLoading={translateMutation.isPending}
            data-testid="translated-code-editor"
          />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
          <Button
            onClick={handleTranslate}
            disabled={translateMutation.isPending || !sourceCode.trim()}
            className="translate-btn px-8 py-4 text-lg font-semibold h-auto bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-purple hover:to-accent-blue"
            data-testid="button-translate"
          >
            {translateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="mr-2 h-5 w-5" />
                Translate Code
              </>
            )}
          </Button>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleClear}
              className="glassmorphism border-dark-600 hover:bg-dark-800"
              data-testid="button-clear"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="glassmorphism border-dark-600 hover:bg-dark-800"
              data-testid="button-save"
            >
              <Save className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="glassmorphism border-dark-600 hover:bg-dark-800"
              data-testid="button-share"
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>
          </div>

          <PerformanceMetrics 
            complexityAnalysis={complexityAnalysis}
            isVisible={!!translatedCode || !!complexityAnalysis}
          />
          
          <FeatureCards />
          <RecentTranslations translations={recentTranslations as any || []} />
        </main>
        
        {/* Right Sidebar - Complexity Visualization */}
        <div className="hidden lg:block w-64 p-4">
          <div className="sticky top-20">
            <ComplexityVisualization complexityAnalysis={complexityAnalysis} />
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
