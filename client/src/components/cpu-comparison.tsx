import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Cpu, 
  Play, 
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  MemoryStick
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface CPUComparisonProps {
  sourceCode: string;
  sourceLanguage: string;
  translatedCode: string;
  targetLanguage: string;
  className?: string;
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

export default function CPUComparison({
  sourceCode,
  sourceLanguage,
  translatedCode,
  targetLanguage,
  className
}: CPUComparisonProps) {
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

  const getCPUColor = (usage: number) => {
    if (usage < 30) return 'text-accent-green';
    if (usage < 70) return 'text-accent-orange';
    return 'text-accent-red';
  };

  const getBarColor = (usage: number) => {
    if (usage < 30) return 'bg-accent-green';
    if (usage < 70) return 'bg-accent-orange';
    return 'bg-accent-red';
  };

  const getWinnerIcon = (winner: string) => {
    switch (winner) {
      case 'original': return <TrendingUp className="h-4 w-4 text-accent-green" />;
      case 'translated': return <TrendingDown className="h-4 w-4 text-accent-blue" />;
      default: return <Minus className="h-4 w-4 text-accent-orange" />;
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

  const determinePerformanceWinner = (original: ExecutionResult, translated: ExecutionResult) => {
    if (!original.success && !translated.success) return 'equal';
    if (!original.success) return 'translated';
    if (!translated.success) return 'original';
    
    // Compare execution time first (more important)
    if (original.executionTime < translated.executionTime * 0.9) return 'original';
    if (translated.executionTime < original.executionTime * 0.9) return 'translated';
    
    // If execution times are similar, compare CPU usage
    if (original.cpuUsage < translated.cpuUsage * 0.9) return 'original';
    if (translated.cpuUsage < original.cpuUsage * 0.9) return 'translated';
    
    return 'equal';
  };

  return (
    <Card className={cn("glassmorphism border-dark-600", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-dark-100">
          <Cpu className="h-5 w-5 text-accent-orange" />
          <span>CPU & Performance Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!testResult ? (
          <div className="space-y-4">
            <div className="text-center text-dark-400 py-6">
              <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Run performance test to compare CPU usage</p>
            </div>
            
            <Button
              onClick={() => performanceTestMutation.mutate()}
              disabled={performanceTestMutation.isPending || !sourceCode.trim() || !translatedCode.trim()}
              className="w-full bg-accent-orange hover:bg-accent-orange/80"
              data-testid="button-run-cpu-test"
            >
              {performanceTestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Performance...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run CPU Performance Test
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-dark-200 text-center">CPU Usage Comparison</h3>
            
            {/* CPU Usage Comparison */}
            <div className="grid grid-cols-2 gap-3">
              {/* Original */}
              <div className="glassmorphism bg-dark-900/30 p-3 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-dark-400 mb-1">{sourceLanguage.toUpperCase()}</div>
                  <div className={cn(
                    "text-lg font-bold mb-2",
                    getCPUColor(testResult.originalResult.cpuUsage)
                  )}>
                    {testResult.originalResult.cpuUsage.toFixed(1)}%
                  </div>
                  
                  <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getBarColor(testResult.originalResult.cpuUsage)
                      )}
                      style={{ width: `${Math.min(100, testResult.originalResult.cpuUsage)}%` }}
                    />
                  </div>
                  
                  {determinePerformanceWinner(testResult.originalResult, testResult.translatedResult) === 'original' && (
                    <div className="flex items-center justify-center text-xs text-accent-green">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      More Efficient
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
                    getCPUColor(testResult.translatedResult.cpuUsage)
                  )}>
                    {testResult.translatedResult.cpuUsage.toFixed(1)}%
                  </div>
                  
                  <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getBarColor(testResult.translatedResult.cpuUsage)
                      )}
                      style={{ width: `${Math.min(100, testResult.translatedResult.cpuUsage)}%` }}
                    />
                  </div>
                  
                  {determinePerformanceWinner(testResult.originalResult, testResult.translatedResult) === 'translated' && (
                    <div className="flex items-center justify-center text-xs text-accent-green">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      More Efficient
                    </div>
                  )}
                  
                  {determinePerformanceWinner(testResult.originalResult, testResult.translatedResult) === 'equal' && (
                    <div className="flex items-center justify-center text-xs text-accent-orange">
                      <Minus className="h-3 w-3 mr-1" />
                      Equal
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="glassmorphism bg-dark-900/20 p-2 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-dark-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Time
                  </span>
                  <span className="text-dark-200 font-medium">
                    {formatTime(testResult.originalResult.executionTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 flex items-center">
                    <MemoryStick className="h-3 w-3 mr-1" />
                    Memory
                  </span>
                  <span className="text-dark-200 font-medium">
                    {formatMemory(testResult.originalResult.memoryUsage)}
                  </span>
                </div>
              </div>
              
              <div className="glassmorphism bg-dark-900/20 p-2 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-dark-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Time
                  </span>
                  <span className="text-dark-200 font-medium">
                    {formatTime(testResult.translatedResult.executionTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 flex items-center">
                    <MemoryStick className="h-3 w-3 mr-1" />
                    Memory
                  </span>
                  <span className="text-dark-200 font-medium">
                    {formatMemory(testResult.translatedResult.memoryUsage)}
                  </span>
                </div>
              </div>
            </div>

            {/* Winner Summary */}
            <div className="glassmorphism bg-dark-900/30 p-3 rounded-lg">
              <h4 className="text-xs font-medium text-dark-200 mb-1 flex items-center justify-center">
                {getWinnerIcon(determinePerformanceWinner(testResult.originalResult, testResult.translatedResult))}
                <span className="ml-2">
                  {determinePerformanceWinner(testResult.originalResult, testResult.translatedResult) === 'original' && 'Original Uses Less CPU'}
                  {determinePerformanceWinner(testResult.originalResult, testResult.translatedResult) === 'translated' && 'Translated Uses Less CPU'}
                  {determinePerformanceWinner(testResult.originalResult, testResult.translatedResult) === 'equal' && 'Similar CPU Usage'}
                </span>
              </h4>
              <p className="text-xs text-dark-400 text-center">{testResult.comparisonSummary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}