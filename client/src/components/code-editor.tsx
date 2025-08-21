import { useState } from "react";
import { Copy, Code, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { SupportedLanguage } from "@shared/schema";

interface CodeEditorProps {
  language: SupportedLanguage;
  value: string;
  onChange?: (value: string) => void;
  title: string;
  placeholder?: string;
  readOnly?: boolean;
  isTranslated?: boolean;
  isLoading?: boolean;
  "data-testid"?: string;
}

const languageMap = {
  cpp: { name: "C++", icon: "C++", gradient: "from-blue-500 to-blue-600" },
  python: { name: "Python", icon: "Py", gradient: "from-yellow-500 to-blue-500" },
  java: { name: "Java", icon: "Java", gradient: "from-orange-500 to-red-500" },
  javascript: { name: "JavaScript", icon: "JS", gradient: "from-yellow-400 to-yellow-500" },
};

export default function CodeEditor({
  language,
  value,
  onChange,
  title,
  placeholder,
  readOnly = false,
  isTranslated = false,
  isLoading = false,
  "data-testid": testId,
}: CodeEditorProps) {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);
  const lang = languageMap[language];

  const handleCopy = async () => {
    if (!value.trim()) return;
    
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsCopying(false), 600);
    }
  };

  const downloadCode = () => {
    if (!value.trim()) return;
    
    const extensions = {
      cpp: "cpp",
      python: "py",
      java: "java",
      javascript: "js",
    };
    
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translated.${extensions[language]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glassmorphism rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
            lang.gradient
          )}>
            <span className="text-white text-xs font-bold">{lang.icon}</span>
          </div>
          <span className="font-medium text-dark-200">
            {title} ({lang.name})
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!value.trim()}
            className={cn(
              "copy-btn p-2 transition-all duration-200",
              isCopying && "success-animation scale-110 bg-accent-green/20"
            )}
            data-testid={`button-copy-${isTranslated ? 'translated' : 'source'}`}
          >
            <Copy className="h-4 w-4 text-dark-400" />
          </Button>
          
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-dark-800 transition-colors"
              data-testid="button-format"
            >
              <Code className="h-4 w-4 text-dark-400" />
            </Button>
          )}
          
          {isTranslated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadCode}
              disabled={!value.trim()}
              className="p-2 hover:bg-dark-800 transition-colors"
              data-testid="button-download"
            >
              <Download className="h-4 w-4 text-dark-400" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-80 bg-dark-900/50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent-blue mx-auto mb-3" />
              <p className="text-dark-400">Translating code...</p>
            </div>
          </div>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || `// Translated ${lang.name} code will appear here`}
            readOnly={readOnly}
            className="w-full h-80 p-4 bg-transparent text-dark-100 font-mono text-sm resize-none border-0 focus:ring-2 focus:ring-accent-blue/50 rounded-none"
            data-testid={testId}
          />
        )}
        
        {/* Line numbers */}
        <div className="absolute left-2 top-4 text-dark-500 font-mono text-sm leading-6 pointer-events-none select-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
