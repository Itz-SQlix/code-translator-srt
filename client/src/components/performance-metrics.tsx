import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, MemoryStick, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  timestamp: number;
}

interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
}

interface PerformanceMetricsProps {
  complexityAnalysis?: ComplexityAnalysis;
  isVisible?: boolean;
}

export default function PerformanceMetrics({ complexityAnalysis, isVisible = true }: PerformanceMetricsProps) {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/system/metrics');
        if (response.ok) {
          const metrics = await response.json();
          setSystemMetrics(metrics);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch system metrics:', error);
        setIsLoading(false);
      }
    };

    if (isVisible) {
      fetchMetrics();
      interval = setInterval(fetchMetrics, 2000); // Update every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const getComplexityColor = (complexity: string) => {
    if (complexity.includes('O(1)')) return 'text-accent-green';
    if (complexity.includes('O(log')) return 'text-accent-blue';
    if (complexity.includes('O(n)') && !complexity.includes('²')) return 'text-accent-orange';
    if (complexity.includes('O(n²)') || complexity.includes('O(n!)')) return 'text-accent-red';
    return 'text-dark-300';
  };

  const getCpuColor = (usage: number) => {
    if (usage < 30) return 'text-accent-green';
    if (usage < 70) return 'text-accent-orange';
    return 'text-accent-red';
  };

  const getMemoryColor = (percentage: number) => {
    if (percentage < 60) return 'text-accent-green';
    if (percentage < 85) return 'text-accent-orange';
    return 'text-accent-red';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Performance */}
      <Card className="glassmorphism border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-dark-100">
            <Cpu className="h-5 w-5 text-accent-blue" />
            <span>System Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-dark-700 rounded mb-2"></div>
                <div className="h-6 bg-dark-700 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-dark-700 rounded mb-2"></div>
                <div className="h-6 bg-dark-700 rounded"></div>
              </div>
            </div>
          ) : systemMetrics ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-300">CPU Usage</span>
                  <span className={cn("text-sm font-semibold", getCpuColor(systemMetrics.cpuUsage))}>
                    {systemMetrics.cpuUsage}%
                  </span>
                </div>
                <Progress 
                  value={systemMetrics.cpuUsage} 
                  className="h-2"
                  data-testid="cpu-usage-progress"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-300">Memory Usage</span>
                  <span className={cn("text-sm font-semibold", getMemoryColor(systemMetrics.memoryUsage.percentage))}>
                    {systemMetrics.memoryUsage.used}MB / {systemMetrics.memoryUsage.total}MB 
                    ({systemMetrics.memoryUsage.percentage}%)
                  </span>
                </div>
                <Progress 
                  value={systemMetrics.memoryUsage.percentage} 
                  className="h-2"
                  data-testid="memory-usage-progress"
                />
              </div>
            </>
          ) : (
            <div className="text-center text-dark-400 py-4">
              <p>Unable to load system metrics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Complexity */}
      <Card className="glassmorphism border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-dark-100">
            <Zap className="h-5 w-5 text-accent-purple" />
            <span>Algorithm Complexity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {complexityAnalysis ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="glassmorphism bg-dark-900/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-accent-blue" />
                    <span className="text-xs text-dark-400">Time Complexity</span>
                  </div>
                  <span className={cn("text-lg font-bold", getComplexityColor(complexityAnalysis.timeComplexity))}>
                    {complexityAnalysis.timeComplexity}
                  </span>
                </div>
                
                <div className="glassmorphism bg-dark-900/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MemoryStick className="h-4 w-4 text-accent-green" />
                    <span className="text-xs text-dark-400">Space Complexity</span>
                  </div>
                  <span className={cn("text-lg font-bold", getComplexityColor(complexityAnalysis.spaceComplexity))}>
                    {complexityAnalysis.spaceComplexity}
                  </span>
                </div>
              </div>
              
              <div className="glassmorphism bg-dark-900/30 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-dark-200 mb-2">Analysis</h4>
                <p className="text-sm text-dark-400 leading-relaxed">
                  {complexityAnalysis.description}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center text-dark-400 py-8">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Translate code to see complexity analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}