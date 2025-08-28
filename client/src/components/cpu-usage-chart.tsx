import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface CPUUsageChartProps {
  className?: string;
}

export default function CPUUsageChart({ className }: CPUUsageChartProps) {
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [currentCPU, setCurrentCPU] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/system/metrics');
        if (response.ok) {
          const metrics = await response.json();
          setCurrentCPU(metrics.cpuUsage);
          
          setCpuHistory(prev => {
            const newHistory = [...prev, metrics.cpuUsage];
            return newHistory.slice(-20); // Keep last 20 readings
          });
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch CPU metrics:', error);
        setIsLoading(false);
      }
    };

    fetchMetrics();
    interval = setInterval(fetchMetrics, 1000); // Update every second

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const getCpuColor = (usage: number) => {
    if (usage < 30) return 'text-accent-green';
    if (usage < 70) return 'text-accent-orange';
    return 'text-accent-red';
  };

  const getBarColor = (usage: number) => {
    if (usage < 30) return 'bg-accent-green';
    if (usage < 70) return 'bg-accent-orange';
    return 'bg-accent-red';
  };

  const maxValue = Math.max(...cpuHistory, 100);

  return (
    <Card className={cn("glassmorphism border-dark-600", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-dark-100 text-sm">
          <Cpu className="h-4 w-4 text-accent-blue" />
          <span>CPU Usage</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-dark-700 rounded mb-2"></div>
            <div className="h-20 bg-dark-700 rounded"></div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <span className={cn("text-2xl font-bold", getCpuColor(currentCPU))}>
                {currentCPU}%
              </span>
            </div>
            
            <div className="relative h-24 flex items-end justify-center space-x-1">
              {cpuHistory.map((usage, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 rounded-t transition-all duration-300",
                    getBarColor(usage)
                  )}
                  style={{
                    height: `${Math.max(2, (usage / maxValue) * 100)}%`,
                    opacity: 0.3 + (index / cpuHistory.length) * 0.7
                  }}
                  data-testid={`cpu-bar-${index}`}
                />
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-dark-400">
              <span>0%</span>
              <span>Real-time</span>
              <span>100%</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}