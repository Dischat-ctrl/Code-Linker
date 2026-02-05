import React, { useState, useEffect } from 'react';
import { Search, Lock, RefreshCw, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressBarProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
  isLoading?: boolean;
}

export function AddressBar({ currentUrl, onNavigate, isLoading = false }: AddressBarProps) {
  const [inputVal, setInputVal] = useState(currentUrl);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputVal(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      let url = inputVal;
      // Basic heuristic for URL vs Search
      if (!url.includes('.') || url.includes(' ')) {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      } else if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      onNavigate(url);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "flex-1 flex items-center h-9 bg-card border rounded-full px-3 transition-all duration-300",
        isFocused 
          ? "border-primary/50 shadow-[0_0_15px_-3px_hsla(var(--primary),0.3)] bg-background" 
          : "border-border bg-card/50"
      )}
    >
      <div className="text-muted-foreground mr-2">
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <div className="flex items-center gap-2">
             {currentUrl.startsWith('https') ? <Lock className="w-3.5 h-3.5 text-green-500" /> : <Search className="w-4 h-4" />}
          </div>
        )}
      </div>

      <input
        type="text"
        className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground/50"
        placeholder="Search or enter address"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          // Select all on focus for easier typing
          // e.target.select(); 
        }}
        onBlur={() => setIsFocused(false)}
      />

      <div className="flex items-center gap-1 ml-2">
         {/* Decorative Star for "Favorite" */}
         <button type="button" className="p-1 hover:text-yellow-400 text-muted-foreground transition-colors">
            <Star className="w-3.5 h-3.5" />
         </button>
      </div>
    </form>
  );
}
