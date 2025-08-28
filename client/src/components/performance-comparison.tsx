import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Zap, 
  Clock, 
  Cpu, 
  MemoryStick, 
  Play, 
  CheckCircle, 
  XCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface PerformanceComparisonProps {
  sourceCode: string;
  sourceLanguage: string;
  translatedCode: string;
  targetLanguage: string;
  performanceComparison?: {
    originalComplexity: string;
    translatedComplexity: string;
    theoreticalWinner: 'original' | 'translated' | 'equal';
    comparisonReason: string;
  };
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface PerformanceTestResult {
  originalResult: ExecutionResult;
  translatedResult: ExecutionResult;
  practicalWinner: 'original' | 'translated' | 'equal';
  comparisonSummary: string;
}

export default function PerformanceComparison({
  sourceCode,
  sourceLanguage,
  translatedCode,
  targetLanguage,
  performanceComparison
}: PerformanceComparisonProps) {
  const [testResult, setTestResult] = useState<PerformanceTestResult | null>(null);

  const performanceTestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/performance/test", {
        originalCode: sourceCode,
        originalLanguage: sourceLanguage,
        translatedCode: translatedCode,
        translatedLanguage: targetLanguage
      });
      return response.json();
    },
    onSuccess: (data: PerformanceTestResult) => {
      setTestResult(data);
    }
  });

  const getWinnerIcon = (winner: string) => {
    switch (winner) {
      case 'original': return <TrendingUp className="h-4 w-4 text-accent-green" />;
      case 'translated': return <TrendingDown className="h-4 w-4 text-accent-blue" />;
      default: return <Minus className="h-4 w-4 text-accent-orange" />;
    }
  };

  const getWinnerColor = (winner: string) => {
    switch (winner) {
      case 'original': return 'text-accent-green';
      case 'translated': return 'text-accent-blue';
      default: return 'text-accent-orange';
    }
  };

  const formatTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatMemory = (memory: number) => {
    if (memory < 1024) return `${memory}MB`;
    return `${(memory / 1024).toFixed(2)}GB`;
  };

  return (
    <Card className="glassmorphism border-dark-600">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-dark-100">
          <Trophy className="h-5 w-5 text-accent-purple" />
          <span>Performance Analysis & Comparison</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theoretical Complexity Comparison */}
        {performanceComparison && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dark-100 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-accent-blue" />
              <span>Theoretical Analysis</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glassmorphism bg-dark-900/30 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-dark-400 mb-1">Original ({sourceLanguage.toUpperCase()})</div>
                  <div className="text-xl font-bold text-dark-100 mb-2">
                    {performanceComparison.originalComplexity}
                  </div>
                  {performanceComparison.theoreticalWinner === 'original' && (
                    <Badge className="bg-accent-green text-white">
                      <Trophy className="h-3 w-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="glassmorphism bg-dark-900/30 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-dark-400 mb-1">Translated ({targetLanguage.toUpperCase()})</div>
                  <div className="text-xl font-bold text-dark-100 mb-2">
                    {performanceComparison.translatedComplexity}
                  </div>
                  {performanceComparison.theoreticalWinner === 'translated' && (
                    <Badge className="bg-accent-blue text-white">
                      <Trophy className="h-3 w-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                  {performanceComparison.theoreticalWinner === 'equal' && (
                    <Badge className="bg-accent-orange text-white">
                      <Minus className="h-3 w-3 mr-1" />
                      Equal
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="glassmorphism bg-dark-900/30 p-3 rounded-lg">
              <p className="text-sm text-dark-300">{performanceComparison.comparisonReason}</p>
            </div>
          </div>
        )}

        <Separator className="bg-dark-700" />

        {/* Practical Performance Test */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dark-100 flex items-center space-x-2">
              <Play className="h-4 w-4 text-accent-green" />
              <span>Practical Performance Test</span>
            </h3>
            
            <Button
              onClick={() => performanceTestMutation.mutate()}
              disabled={performanceTestMutation.isPending || !sourceCode.trim() || !translatedCode.trim()}
              className="bg-accent-purple hover:bg-accent-purple/80"
              data-testid="button-run-performance-test"
            >
              {performanceTestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Test
                </>
              )}
            </Button>
          </div>

          {testResult && (
            <div className="space-y-4">
              {/* Performance Results */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original Results */}
                <div className="glassmorphism bg-dark-900/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-dark-200">Original Code</span>
                    {testResult.originalResult.success ? (
                      <CheckCircle className="h-4 w-4 text-accent-green" />
                    ) : (
                      <XCircle className="h-4 w-4 text-accent-red" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Execution Time
                      </span>
                      <span className="text-sm font-medium text-dark-200">
                        {formatTime(testResult.originalResult.executionTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-400 flex items-center">
                        <Cpu className="h-3 w-3 mr-1" />
                        CPU Usage
                      </span>
                      <span className="text-sm font-medium text-dark-200">
                        {testResult.originalResult.cpuUsage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-400 flex items-center">
                        <MemoryStick className="h-3 w-3 mr-1" />
                        Memory
                      </span>
                      <span className="text-sm font-medium text-dark-200">
                        {formatMemory(testResult.originalResult.memoryUsage)}
                      </span>
                    </div>
                  </div>
                  
                  {testResult.practicalWinner === 'original' && (
                    <Badge className="bg-accent-green text-white mt-2 w-full justify-center">
                      <Trophy className="h-3 w-3 mr-1" />
                      Practical Winner
                    </Badge>
                  )}
                </div>

                {/* Translated Results */}
                <div className="glassmorphism bg-dark-900/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-dark-200">Translated Code</span>
                    {testResult.translatedResult.success ? (
                      <CheckCircle className="h-4 w-4 text-accent-green" />
                    ) : (
                      <XCircle className="h-4 w-4 text-accent-red" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Execution Time
                      </span>
                      <span className="text-sm font-medium text-dark-200">
                        {formatTime(testResult.translatedResult.executionTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-400 flex items-center">
                        <Cpu className="h-3 w-3 mr-1" />
                        CPU Usage
                      </span>
                      <span className="text-sm font-medium text-dark-200">
                        {testResult.translatedResult.cpuUsage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-400 flex items-center">
                        <MemoryStick className="h-3 w-3 mr-1" />
                        Memory
                      </span>
                      <span className="text-sm font-medium text-dark-200">
                        {formatMemory(testResult.translatedResult.memoryUsage)}
                      </span>
                    </div>
                  </div>
                  
                  {testResult.practicalWinner === 'translated' && (
                    <Badge className="bg-accent-blue text-white mt-2 w-full justify-center">
                      <Trophy className="h-3 w-3 mr-1" />
                      Practical Winner
                    </Badge>
                  )}
                  
                  {testResult.practicalWinner === 'equal' && (
                    <Badge className="bg-accent-orange text-white mt-2 w-full justify-center">
                      <Minus className="h-3 w-3 mr-1" />
                      Equal Performance
                    </Badge>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="glassmorphism bg-dark-900/30 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-dark-200 mb-2 flex items-center">
                  {getWinnerIcon(testResult.practicalWinner)}
                  <span className="ml-2">Performance Summary</span>
                </h4>
                <p className="text-sm text-dark-400">{testResult.comparisonSummary}</p>
              </div>

              {/* Final Verdict */}
              {performanceComparison && (
                <div className="glassmorphism bg-dark-900/30 p-4 rounded-lg border border-accent-purple/30">
                  <h4 className="text-sm font-medium text-dark-200 mb-3 flex items-center">
                    <Trophy className="h-4 w-4 text-accent-purple mr-2" />
                    Final Verdict
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xs text-dark-400 mb-1">Theoretical</div>
                      <div className={cn("text-sm font-bold", getWinnerColor(performanceComparison.theoreticalWinner))}>
                        {performanceComparison.theoreticalWinner === 'original' ? 'Original Wins' :
                         performanceComparison.theoreticalWinner === 'translated' ? 'Translated Wins' : 'Equal'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-dark-400 mb-1">Practical</div>
                      <div className={cn("text-sm font-bold", getWinnerColor(testResult.practicalWinner))}>
                        {testResult.practicalWinner === 'original' ? 'Original Wins' :
                         testResult.practicalWinner === 'translated' ? 'Translated Wins' : 'Equal'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!testResult && !performanceTestMutation.isPending && (
            <div className="text-center text-dark-400 py-8">
              <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Click "Run Test" to execute both code versions and compare their performance</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}