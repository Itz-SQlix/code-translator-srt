import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SupportedLanguage } from "@shared/schema";

interface LanguageSelectorProps {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  onSourceLanguageChange: (language: SupportedLanguage) => void;
  onTargetLanguageChange: (language: SupportedLanguage) => void;
  onSwapLanguages: () => void;
}

const languages = [
  { id: "cpp", name: "C++", icon: "C++", gradient: "from-blue-500 to-blue-600" },
  { id: "python", name: "Python", icon: "Py", gradient: "from-yellow-500 to-blue-500" },
  { id: "java", name: "Java", icon: "Java", gradient: "from-orange-500 to-red-500" },
  { id: "javascript", name: "JavaScript", icon: "JS", gradient: "from-yellow-400 to-yellow-500" },
] as const;

export default function LanguageSelector({
  sourceLanguage,
  targetLanguage,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onSwapLanguages,
}: LanguageSelectorProps) {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-dark-100 mb-2">Select Translation Languages</h2>
        <p className="text-dark-400">Choose source and target programming languages for translation</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Source Language Selection */}
        <div className="w-full lg:w-auto">
          <label className="block text-sm font-medium text-dark-300 mb-3">From</label>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <Button
                key={`source-${lang.id}`}
                onClick={() => onSourceLanguageChange(lang.id as SupportedLanguage)}
                className={cn(
                  "language-btn h-auto p-4 flex-col transition-all duration-300 hover:transform hover:-translate-y-1",
                  sourceLanguage === lang.id
                    ? "bg-accent-blue text-white border-accent-blue"
                    : "glassmorphism border-dark-600 hover:bg-dark-800"
                )}
                variant="outline"
                data-testid={`button-source-${lang.id}`}
              >
                <div className={cn(
                  "w-12 h-12 mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br",
                  lang.gradient
                )}>
                  <span className="text-white text-sm font-bold">{lang.icon}</span>
                </div>
                <span className="text-sm font-medium">{lang.name}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Swap Button */}
        <div className="flex items-center justify-center">
          <Button
            onClick={onSwapLanguages}
            className="p-3 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-purple hover:to-accent-blue transition-all duration-300 transform hover:scale-110"
            data-testid="button-swap-languages"
          >
            <ArrowRightLeft className="h-5 w-5 text-white" />
          </Button>
        </div>
        
        {/* Target Language Selection */}
        <div className="w-full lg:w-auto">
          <label className="block text-sm font-medium text-dark-300 mb-3">To</label>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <Button
                key={`target-${lang.id}`}
                onClick={() => onTargetLanguageChange(lang.id as SupportedLanguage)}
                className={cn(
                  "language-btn h-auto p-4 flex-col transition-all duration-300 hover:transform hover:-translate-y-1",
                  targetLanguage === lang.id
                    ? "bg-accent-blue text-white border-accent-blue"
                    : "glassmorphism border-dark-600 hover:bg-dark-800"
                )}
                variant="outline"
                data-testid={`button-target-${lang.id}`}
              >
                <div className={cn(
                  "w-12 h-12 mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br",
                  lang.gradient
                )}>
                  <span className="text-white text-sm font-bold">{lang.icon}</span>
                </div>
                <span className="text-sm font-medium">{lang.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
