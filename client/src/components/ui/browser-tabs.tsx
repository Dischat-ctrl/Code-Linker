import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

interface BrowserTabsProps {
  tabs: Tab[];
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onNewTab: () => void;
}

export function BrowserTabs({ tabs, onActivate, onClose, onNewTab }: BrowserTabsProps) {
  return (
    <div className="flex items-end h-10 w-full bg-background/50 border-b border-border/50 px-2 pt-1 gap-1 overflow-x-auto scrollbar-hide select-none">
      <AnimatePresence initial={false}>
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, width: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "group relative flex items-center min-w-[160px] max-w-[240px] h-9 px-3 rounded-t-lg cursor-pointer transition-colors border-t border-x border-transparent",
              tab.active
                ? "bg-muted text-foreground border-border/50 z-10"
                : "bg-transparent text-muted-foreground hover:bg-muted/30"
            )}
            onClick={() => onActivate(tab.id)}
          >
            <Globe className={cn(
              "w-4 h-4 mr-2",
              tab.active ? "text-primary" : "text-muted-foreground/70"
            )} />
            
            <span className="flex-1 text-xs font-mono truncate mr-2">
              {tab.title || "New Tab"}
            </span>

            <button
              className={cn(
                "p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-background/80 transition-all",
                tab.active && "opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
            >
              <X className="w-3 h-3" />
            </button>
            
            {/* Active Tab Glow */}
            {tab.active && (
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={onNewTab}
        className="ml-1 p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
