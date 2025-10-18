import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { systemMonitor } from './system-monitor';
import pidusage from 'pidusage';

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface PerformanceTestResult {
  originalResult: ExecutionResult;
  translatedResult: ExecutionResult;
  practicalWinner: 'original' | 'translated' | 'equal';
  comparisonSummary: string;
}

class CodeExecutor {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'codetranslate-execution');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async executeCode(code: string, language: string, timeout: number = 10000): Promise<ExecutionResult> {
    const startTime = Date.now();
    let cpuSamples: number[] = [];
    let memSamples: number[] = [];
    let maxCpu = 0;
    let result: any = {};

    try {
      result = await this.runCodeSafely(
        code,
        language,
        timeout,
        (childPid: number) => {
          // Pid callback
        },
        (exited: boolean) => {
          // Exit callback
        },
        (cpu: number, mem: number) => {
          if (cpu > 0) {
            cpuSamples.push(cpu);
            maxCpu = Math.max(maxCpu, cpu);
          }
          if (mem > 0) {
            memSamples.push(mem);
          }
        }
      );
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Calculate CPU: use max CPU if we have samples, otherwise estimate from execution time
      let cpuUsage = 0;
      if (cpuSamples.length > 0) {
        // Use average of top samples
        const sortedSamples = cpuSamples.sort((a, b) => b - a);
        const topSamples = sortedSamples.slice(0, Math.max(3, Math.floor(sortedSamples.length / 2)));
        cpuUsage = topSamples.reduce((a, b) => a + b, 0) / topSamples.length;
      } else if (result.success && executionTime > 100) {
        // Estimate: if process ran for significant time, assume some CPU usage
        cpuUsage = Math.min(50, (executionTime / 1000) * 10);
      }
      
      const maxMem = memSamples.length ? Math.max(...memSamples) : 0;
      
      return {
        ...result,
        executionTime,
        cpuUsage: Math.round(cpuUsage * 10) / 10, // One decimal place
        memoryUsage: Math.round(maxMem / 1024 / 1024) // bytes to MB
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: endTime - startTime,
        cpuUsage: 0,
        memoryUsage: 0
      };
    }
  }

  private async runCodeSafely(
    code: string, 
    language: string, 
    timeout: number,
    onPid?: (pid: number) => void,
    onExit?: (exited: boolean) => void,
    onSample?: (cpu: number, mem: number) => void
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    const fileName = this.generateFileName(language);
    const filePath = path.join(this.tempDir, fileName);

    try {
      // Write code to temporary file
      fs.writeFileSync(filePath, code);

      // Execute based on language
      const command = this.getExecutionCommand(language, filePath);
      
      return new Promise((resolve) => {
        const process = spawn(command.cmd, command.args, {
          cwd: this.tempDir,
          timeout: timeout,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        let samplingInterval: NodeJS.Timeout | null = null;
        let sampleCount = 0;

        // Start CPU/memory sampling immediately and aggressively
        if (process.pid && onPid && onSample) {
          onPid(process.pid);
          
          // Sample immediately
          const sampleUsage = async () => {
            try {
              if (process.pid && !process.killed) {
                const stats = await pidusage(process.pid);
                onSample(stats.cpu, stats.memory);
                sampleCount++;
              }
            } catch (err) {
              // Process might have exited, ignore
            }
          };
          
          // First sample
          sampleUsage();
          
          // Then sample every 50ms for more granular data
          samplingInterval = setInterval(sampleUsage, 50);
        }

        process.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        process.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        process.on('close', async (code) => {
          // Give one final sample before cleaning up
          if (samplingInterval) {
            await new Promise(resolve => setTimeout(resolve, 100));
            clearInterval(samplingInterval);
          }
          if (onExit) onExit(true);
          
          // Clean up file
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            // Ignore cleanup errors
          }

          if (code === 0) {
            resolve({ success: true, output: stdout });
          } else {
            resolve({ success: false, error: stderr || `Process exited with code ${code}` });
          }
        });

        process.on('error', (error) => {
          if (samplingInterval) clearInterval(samplingInterval);
          if (onExit) onExit(true);
          
          // Clean up file
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            // Ignore cleanup errors
          }
          resolve({ success: false, error: error.message });
        });

        // Handle timeout
        setTimeout(() => {
          if (!process.killed) {
            if (samplingInterval) clearInterval(samplingInterval);
            process.kill('SIGTERM');
            resolve({ success: false, error: 'Execution timeout' });
          }
        }, timeout);
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File write error'
      };
    }
  }

  private generateFileName(language: string): string {
    const timestamp = Date.now();
    const extensions: Record<string, string> = {
      'python': 'py',
      'javascript': 'js',
      'java': 'java',
      'cpp': 'cpp'
    };
    return `test_${timestamp}.${extensions[language] || 'txt'}`;
  }

  private getExecutionCommand(language: string, filePath: string): { cmd: string; args: string[] } {
    const isWin = process.platform === 'win32';
    switch (language) {
      case 'python':
        // Try python3, fallback to python
        return { cmd: isWin ? 'python' : 'python3', args: [filePath] };
      case 'javascript':
        return { cmd: 'node', args: [filePath] };
      case 'java':
        if (isWin) {
          // Windows: javac then java
          return { cmd: 'cmd', args: ['/c', `javac "${filePath}" && java -cp "${path.dirname(filePath)}" "${path.basename(filePath, '.java')}"`] };
        } else {
          return { cmd: 'sh', args: ['-c', `cd "${path.dirname(filePath)}" && javac "${path.basename(filePath)}" && java "${path.basename(filePath, '.java')}"`] };
        }
      case 'cpp':
        const execName = path.join(path.dirname(filePath), isWin ? 'temp_exec.exe' : 'temp_exec');
        if (isWin) {
          // Windows: g++ then run .exe
          return { cmd: 'cmd', args: ['/c', `g++ "${filePath}" -o "${execName}" && "${execName}"`] };
        } else {
          return { cmd: 'sh', args: ['-c', `g++ "${filePath}" -o "${execName}" && "${execName}"`] };
        }
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  async performanceTest(
    originalCode: string,
    originalLanguage: string,
    translatedCode: string,
    translatedLanguage: string
  ): Promise<PerformanceTestResult> {
    // Execute both codes with performance monitoring
    const originalResult = await this.executeCode(originalCode, originalLanguage);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between executions
    const translatedResult = await this.executeCode(translatedCode, translatedLanguage);

    // Determine practical winner
    let practicalWinner: 'original' | 'translated' | 'equal' = 'equal';
    let comparisonSummary = '';

    if (originalResult.success && translatedResult.success) {
      if (originalResult.executionTime < translatedResult.executionTime) {
        if (originalResult.executionTime * 1.1 < translatedResult.executionTime) { // 10% threshold
          practicalWinner = 'original';
          comparisonSummary = `Original code executed ${((translatedResult.executionTime / originalResult.executionTime - 1) * 100).toFixed(1)}% faster`;
        }
      } else if (translatedResult.executionTime < originalResult.executionTime) {
        if (translatedResult.executionTime * 1.1 < originalResult.executionTime) {
          practicalWinner = 'translated';
          comparisonSummary = `Translated code executed ${((originalResult.executionTime / translatedResult.executionTime - 1) * 100).toFixed(1)}% faster`;
        }
      }

      if (practicalWinner === 'equal') {
        comparisonSummary = 'Both codes performed similarly (within 10% execution time difference)';
      }
    } else if (originalResult.success && !translatedResult.success) {
      practicalWinner = 'original';
      comparisonSummary = 'Original code executed successfully, translated code failed';
    } else if (!originalResult.success && translatedResult.success) {
      practicalWinner = 'translated';
      comparisonSummary = 'Translated code executed successfully, original code failed';
    } else {
      comparisonSummary = 'Both codes failed to execute';
    }

    return {
      originalResult,
      translatedResult,
      practicalWinner,
      comparisonSummary
    };
  }
}

export const codeExecutor = new CodeExecutor();