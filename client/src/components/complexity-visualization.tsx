import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplexityVisualizationProps {
  complexityAnalysis?: {
    timeComplexity: string;
    spaceComplexity: string;
    description: string;
  };
  performanceComparison?: {
    originalComplexity: string;
    translatedComplexity: string;
    theoreticalWinner: 'original' | 'translated' | 'equal';
    comparisonReason: string;
  };
  sourceLanguage?: string;
  targetLanguage?: string;
  className?: string;
}

export default function ComplexityVisualization({ 
  complexityAnalysis, 
  performanceComparison,
  sourceLanguage = "Original",
  targetLanguage = "Translated",
  className 
}: ComplexityVisualizationProps) {
  
  const getComplexityScore = (complexity: string): number => {
    if (complexity.includes('O(1)')) return 1;
    if (complexity.includes('O(log')) return 2;
    if (complexity.includes('O(n)') && !complexity.includes('²')) return 3;
    if (complexity.includes('O(n log n)')) return 4;
    if (complexity.includes('O(n²)')) return 5;
    if (complexity.includes('O(2^n)')) return 6;
    if (complexity.includes('O(n!)')) return 7;
    return 3; // default
  };

  const complexityData = useMemo(() => {
    if (!performanceComparison && !complexityAnalysis) return null;

    if (performanceComparison) {
      const originalScore = getComplexityScore(performanceComparison.originalComplexity);
      const translatedScore = getComplexityScore(performanceComparison.translatedComplexity);
      
      return {
        hasComparison: true,
        originalComplexity: performanceComparison.originalComplexity,
        translatedComplexity: performanceComparison.translatedComplexity,
        originalScore,
        translatedScore,
        theoreticalWinner: performanceComparison.theoreticalWinner,
        comparisonReason: performanceComparison.comparisonReason,
        timeScore: undefined,
        spaceScore: undefined,
        timeComplexity: undefined,
        spaceComplexity: undefined
      };
    }

    if (complexityAnalysis) {
      const timeScore = getComplexityScore(complexityAnalysis.timeComplexity);
      const spaceScore = getComplexityScore(complexityAnalysis.spaceComplexity);

      return {
        hasComparison: false,
        timeScore,
        spaceScore,
        timeComplexity: complexityAnalysis.timeComplexity,
        spaceComplexity: complexityAnalysis.spaceComplexity,
        originalComplexity: undefined,
        translatedComplexity: undefined,
        originalScore: undefined,
        translatedScore: undefined,
        theoreticalWinner: undefined,
        comparisonReason: undefined
      };
    }

    return null;
  }, [complexityAnalysis, performanceComparison]);

  const getComplexityColor = (score: number) => {
    if (score <= 2) return 'text-accent-green';
    if (score <= 4) return 'text-accent-orange';
    return 'text-accent-red';
  };

  const getBarColor = (score: number) => {
    if (score <= 2) return 'bg-accent-green';
    if (score <= 4) return 'bg-accent-orange';
    return 'bg-accent-red';
  };

  const complexityLabels = [
    'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)', 'O(n!)'
  ];

  return (
    <Card className={cn("glassmorphism border-dark-600", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-dark-100 text-sm">
          <Zap className="h-4 w-4 text-accent-purple" />
          <span>Complexity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!complexityData ? (
          <div className="text-center text-dark-400 py-8">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Translate code to see complexity</p>
          </div>
        ) : complexityData.hasComparison ? (
          <>
            {/* Comparison Mode */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-dark-200 text-center">Time Complexity Comparison</h3>
              
              {/* Original vs Translated */}
              <div className="grid grid-cols-2 gap-3">
                {/* Original */}
                <div className="glassmorphism bg-dark-900/30 p-3 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-dark-400 mb-1">{sourceLanguage.toUpperCase()}</div>
                    <div className={cn(
                      "text-lg font-bold mb-2",
                      complexityData.theoreticalWinner === 'original' 
                        ? 'text-accent-green' 
                        : complexityData.theoreticalWinner === 'equal'
                        ? 'text-accent-orange'
                        : 'text-accent-red'
                    )}>
                      {complexityData.originalComplexity}
                    </div>
                    
                    <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden mb-2">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          getBarColor(complexityData.originalScore || 0)
                        )}
                        style={{ width: `${((complexityData.originalScore || 0) / 7) * 100}%` }}
                      />
                    </div>
                    
                    {complexityData.theoreticalWinner === 'original' && (
                      <div className="flex items-center justify-center text-xs text-accent-green">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Faster
                      </div>
                    )}
                    
                    {complexityData.theoreticalWinner === 'equal' && (
                      <div className="flex items-center justify-center text-xs text-accent-orange">
                        <Minus className="h-3 w-3 mr-1" />
                        Equal
                      </div>
                    )}
                  </div>
                </div>

                {/* Translated */}
                <div className="glassmorphism bg-dark-900/30 p-3 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-dark-400 mb-1">{targetLanguage.toUpperCase()}</div>
                    <div className={cn(
                      "text-lg font-bold mb-2",
                      complexityData.theoreticalWinner === 'translated' 
                        ? 'text-accent-green' 
                        : complexityData.theoreticalWinner === 'equal'
                        ? 'text-accent-orange'
                        : 'text-accent-red'
                    )}>
                      {complexityData.translatedComplexity}
                    </div>
                    
                    <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden mb-2">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          getBarColor(complexityData.translatedScore || 0)
                        )}
                        style={{ width: `${((complexityData.translatedScore || 0) / 7) * 100}%` }}
                      />
                    </div>
                    
                    {complexityData.theoreticalWinner === 'translated' && (
                      <div className="flex items-center justify-center text-xs text-accent-green">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Faster
                      </div>
                    )}
                    
                    {complexityData.theoreticalWinner === 'equal' && (
                      <div className="flex items-center justify-center text-xs text-accent-orange">
                        <Minus className="h-3 w-3 mr-1" />
                        Equal
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Winner Summary */}
              <div className="glassmorphism bg-dark-900/30 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-dark-200 mb-1 flex items-center justify-center">
                  {complexityData.theoreticalWinner === 'original' && (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-accent-green" />
                      Original is Faster
                    </>
                  )}
                  {complexityData.theoreticalWinner === 'translated' && (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-accent-green" />
                      Translated is Faster
                    </>
                  )}
                  {complexityData.theoreticalWinner === 'equal' && (
                    <>
                      <Minus className="h-3 w-3 mr-1 text-accent-orange" />
                      Equal Performance
                    </>
                  )}
                </h4>
                <p className="text-xs text-dark-400 text-center">{complexityData.comparisonReason}</p>
              </div>

              {/* Complexity Scale */}
              <div className="space-y-2">
                <div className="text-xs text-dark-400 text-center">Complexity Scale</div>
                <div className="grid grid-cols-1 gap-1">
                  {complexityLabels.map((label, index) => {
                    const score = index + 1;
                    const isOriginalActive = score === complexityData.originalScore;
                    const isTranslatedActive = score === complexityData.translatedScore;
                    
                    return (
                      <div
                        key={label}
                        className={cn(
                          "flex items-center justify-between px-2 py-1 rounded text-xs transition-all",
                          (isOriginalActive || isTranslatedActive) 
                            ? "bg-dark-700 text-dark-100" 
                            : "text-dark-500"
                        )}
                      >
                        <span>{label}</span>
                        <div className="flex space-x-1">
                          {isOriginalActive && (
                            <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                          )}
                          {isTranslatedActive && (
                            <div className="w-2 h-2 rounded-full bg-accent-purple"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Single Program Mode */}
            {/* Time Complexity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-400">Time</span>
                <span className={cn("text-sm font-bold", getComplexityColor(complexityData.timeScore || 0))}>
                  {complexityData.timeComplexity}
                </span>
              </div>
              
              <div className="relative h-3 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getBarColor(complexityData.timeScore || 0)
                  )}
                  style={{ width: `${((complexityData.timeScore || 0) / 7) * 100}%` }}
                />
              </div>
            </div>

            {/* Space Complexity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-400">Space</span>
                <span className={cn("text-sm font-bold", getComplexityColor(complexityData.spaceScore || 0))}>
                  {complexityData.spaceComplexity}
                </span>
              </div>
              
              <div className="relative h-3 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getBarColor(complexityData.spaceScore || 0)
                  )}
                  style={{ width: `${((complexityData.spaceScore || 0) / 7) * 100}%` }}
                />
              </div>
            </div>

            {/* Complexity Scale */}
            <div className="space-y-2">
              <div className="text-xs text-dark-400 text-center">Complexity Scale</div>
              <div className="grid grid-cols-1 gap-1">
                {complexityLabels.map((label, index) => {
                  const score = index + 1;
                  const isTimeActive = score === complexityData.timeScore;
                  const isSpaceActive = score === complexityData.spaceScore;
                  
                  return (
                    <div
                      key={label}
                      className={cn(
                        "flex items-center justify-between px-2 py-1 rounded text-xs transition-all",
                        (isTimeActive || isSpaceActive) 
                          ? "bg-dark-700 text-dark-100" 
                          : "text-dark-500"
                      )}
                    >
                      <span>{label}</span>
                      <div className="flex space-x-1">
                        {isTimeActive && (
                          <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                        )}
                        {isSpaceActive && (
                          <div className="w-2 h-2 rounded-full bg-accent-purple"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}