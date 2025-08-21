import { Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  return (
    <header className="glassmorphism border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">&lt;/&gt;</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                CodeTranslate
              </h1>
              <p className="text-xs text-dark-400">AI-Powered Code Translation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4 text-dark-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
              data-testid="button-help"
            >
              <HelpCircle className="h-4 w-4 text-dark-400" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
