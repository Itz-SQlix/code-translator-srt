import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { systemMonitor } from './system-monitor';

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

  async executeCode(code: string, language: string, timeout: number = 5000): Promise<ExecutionResult> {
    const startTime = Date.now();
    const startMetrics = await systemMonitor.getSystemMetrics();

    try {
      const result = await this.runCodeSafely(code, language, timeout);
      const endTime = Date.now();
      const endMetrics = await systemMonitor.getSystemMetrics();

      return {
        ...result,
        executionTime: endTime - startTime,
        cpuUsage: Math.max(0, endMetrics.cpuUsage - startMetrics.cpuUsage),
        memoryUsage: endMetrics.memoryUsage.used - startMetrics.memoryUsage.used
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

  private async runCodeSafely(code: string, language: string, timeout: number): Promise<{ success: boolean; output?: string; error?: string }> {
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

        process.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        process.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        process.on('close', (code) => {
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
    switch (language) {
      case 'python':
        return { cmd: 'python3', args: [filePath] };
      case 'javascript':
        return { cmd: 'node', args: [filePath] };
      case 'java':
        const className = path.basename(filePath, '.java');
        return { cmd: 'javac', args: [filePath, '&&', 'java', className] };
      case 'cpp':
        const execName = path.join(path.dirname(filePath), 'temp_exec');
        return { cmd: 'g++', args: [filePath, '-o', execName, '&&', execName] };
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