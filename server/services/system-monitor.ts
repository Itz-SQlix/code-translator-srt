import * as os from "os";

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  timestamp: number;
}

class SystemMonitor {
  private cpuUsageHistory: number[] = [];
  private maxHistoryLength = 10;

  async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startMeasures = this.getCPUInfo();
      
      setTimeout(() => {
        const endMeasures = this.getCPUInfo();
        const idleDifference = endMeasures.idle - startMeasures.idle;
        const totalDifference = endMeasures.total - startMeasures.total;
        
        const cpuPercentage = 100 - Math.floor(100 * idleDifference / totalDifference);
        
        // Store in history
        this.cpuUsageHistory.push(cpuPercentage);
        if (this.cpuUsageHistory.length > this.maxHistoryLength) {
          this.cpuUsageHistory.shift();
        }
        
        resolve(Math.max(0, Math.min(100, cpuPercentage)));
      }, 100);
    });
  }

  private getCPUInfo() {
    const cpus = os.cpus();
    
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    
    for (const cpu of cpus) {
      user += cpu.times.user;
      nice += cpu.times.nice;
      sys += cpu.times.sys;
      irq += cpu.times.irq;
      idle += cpu.times.idle;
    }
    
    const total = user + nice + sys + idle + irq;
    
    return { idle, total };
  }

  getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return {
      used: Math.round(usedMem / 1024 / 1024), // MB
      total: Math.round(totalMem / 1024 / 1024), // MB
      percentage: Math.round((usedMem / totalMem) * 100)
    };
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = await this.getCPUUsage();
    const memoryUsage = this.getMemoryUsage();
    
    return {
      cpuUsage,
      memoryUsage,
      timestamp: Date.now()
    };
  }

  getCPUHistory(): number[] {
    return [...this.cpuUsageHistory];
  }
}

export const systemMonitor = new SystemMonitor();