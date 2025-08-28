import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplexityVisualizationProps {
  complexityAnalysis?: {
    timeComplexity: string;
    spaceComplexity: string;
    description: string;
  };
  className?: string;
}

export default function ComplexityVisualization({ 
  complexityAnalysis, 
  className 
}: ComplexityVisualizationProps) {
  
  const complexityData = useMemo(() => {
    if (!complexityAnalysis) return null;

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

    const timeScore = getComplexityScore(complexityAnalysis.timeComplexity);
    const spaceScore = getComplexityScore(complexityAnalysis.spaceComplexity);

    return {
      timeScore,
      spaceScore,
      timeComplexity: complexityAnalysis.timeComplexity,
      spaceComplexity: complexityAnalysis.spaceComplexity
    };
  }, [complexityAnalysis]);

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
        ) : (
          <>
            {/* Time Complexity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-400">Time</span>
                <span className={cn("text-sm font-bold", getComplexityColor(complexityData.timeScore))}>
                  {complexityData.timeComplexity}
                </span>
              </div>
              
              <div className="relative h-3 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getBarColor(complexityData.timeScore)
                  )}
                  style={{ width: `${(complexityData.timeScore / 7) * 100}%` }}
                />
              </div>
            </div>

            {/* Space Complexity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-400">Space</span>
                <span className={cn("text-sm font-bold", getComplexityColor(complexityData.spaceScore))}>
                  {complexityData.spaceComplexity}
                </span>
              </div>
              
              <div className="relative h-3 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getBarColor(complexityData.spaceScore)
                  )}
                  style={{ width: `${(complexityData.spaceScore / 7) * 100}%` }}
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