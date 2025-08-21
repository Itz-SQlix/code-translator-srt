import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Translation } from "@shared/schema";

interface RecentTranslationsProps {
  translations: Translation[];
}

const languageMap = {
  cpp: { name: "C++", icon: "C++", gradient: "from-blue-500 to-blue-600" },
  python: { name: "Python", icon: "Py", gradient: "from-yellow-500 to-blue-500" },
  java: { name: "Java", icon: "Java", gradient: "from-orange-500 to-red-500" },
  javascript: { name: "JavaScript", icon: "JS", gradient: "from-yellow-400 to-yellow-500" },
};

function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Unknown";
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function RecentTranslations({ translations }: RecentTranslationsProps) {
  if (!translations || translations.length === 0) {
    return (
      <div className="glassmorphism rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-dark-100 mb-6">Recent Translations</h3>
        <div className="text-center py-8">
          <p className="text-dark-400">No recent translations yet. Start by translating some code!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-dark-100">Recent Translations</h3>
        <Button
          variant="link"
          className="text-accent-blue hover:text-accent-purple transition-colors p-0"
          data-testid="button-view-all-translations"
        >
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {translations.slice(0, 5).map((translation) => {
          const sourceLang = languageMap[translation.sourceLanguage as keyof typeof languageMap];
          const targetLang = languageMap[translation.targetLanguage as keyof typeof languageMap];
          
          return (
            <div
              key={translation.id}
              className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl hover:bg-dark-800/50 transition-colors cursor-pointer"
              data-testid={`translation-item-${translation.id}`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                    sourceLang?.gradient || "from-gray-500 to-gray-600"
                  )}>
                    <span className="text-white text-xs font-bold">
                      {sourceLang?.icon || translation.sourceLanguage.toUpperCase()}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-dark-400" />
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                    targetLang?.gradient || "from-gray-500 to-gray-600"
                  )}>
                    <span className="text-white text-xs font-bold">
                      {targetLang?.icon || translation.targetLanguage.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-dark-200 font-medium" data-testid={`text-title-${translation.id}`}>
                    {translation.title || `${sourceLang?.name || translation.sourceLanguage} to ${targetLang?.name || translation.targetLanguage} translation`}
                  </p>
                  <p className="text-dark-400 text-sm" data-testid={`text-time-${translation.id}`}>
                    {formatTimeAgo(translation.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-dark-400 hover:text-dark-200 transition-colors p-2"
                data-testid={`button-view-translation-${translation.id}`}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
