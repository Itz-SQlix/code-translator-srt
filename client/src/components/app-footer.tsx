import { Github, Twitter, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppFooter() {
  return (
    <footer className="glassmorphism border-t border-dark-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">&lt;/&gt;</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                CodeTranslate
              </span>
            </div>
            <p className="text-dark-400 text-sm mb-4">
              Powerful AI-driven code translation platform supporting multiple programming languages with intelligent context understanding.
            </p>
          </div>
          
          <div>
            <h4 className="text-dark-200 font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><a href="#" className="hover:text-accent-blue transition-colors">AI Translation</a></li>
              <li><a href="#" className="hover:text-accent-blue transition-colors">Syntax Highlighting</a></li>
              <li><a href="#" className="hover:text-accent-blue transition-colors">Error Detection</a></li>
              <li><a href="#" className="hover:text-accent-blue transition-colors">Code Formatting</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-dark-200 font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><a href="#" className="hover:text-accent-blue transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-accent-blue transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-accent-blue transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-accent-blue transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-dark-700 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-dark-400 text-sm">© 2024 CodeTranslate. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-dark-400 hover:text-accent-blue transition-colors p-2"
              data-testid="link-github"
            >
              <Github className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-dark-400 hover:text-accent-blue transition-colors p-2"
              data-testid="link-twitter"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-dark-400 hover:text-accent-blue transition-colors p-2"
              data-testid="link-discord"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
