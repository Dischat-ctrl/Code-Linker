import React from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home } from 'lucide-react';

interface BrowserControlsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
}

export function BrowserControls({ 
  canGoBack, 
  canGoForward, 
  onBack, 
  onForward, 
  onRefresh,
  onHome
}: BrowserControlsProps) {
  return (
    <div className="flex items-center gap-1 px-2">
      <button 
        disabled={!canGoBack}
        onClick={onBack}
        className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      
      <button 
        disabled={!canGoForward}
        onClick={onForward}
        className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent text-foreground transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
      </button>

      <button 
        onClick={onRefresh}
        className="p-2 rounded-lg hover:bg-muted/50 text-foreground transition-colors hover:rotate-180 duration-500"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <button 
        onClick={onHome}
        className="p-2 rounded-lg hover:bg-muted/50 text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </button>
    </div>
  );
}
