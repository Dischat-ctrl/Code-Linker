import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useProxySessions, useDeleteProxySession } from '@/hooks/use-proxy-sessions';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
}

export function HistoryDrawer({ isOpen, onClose, onNavigate }: HistoryDrawerProps) {
  const { data: sessions, isLoading } = useProxySessions();
  const deleteSession = useDeleteProxySession();
  const getFaviconUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(parsed.origin)}`;
    } catch {
      return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-card border-l border-border z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">History</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Syncing history...</span>
                </div>
              ) : !sessions || sessions.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
                  <p className="text-muted-foreground">No browsing history found.</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="group flex flex-col px-3 py-2 rounded-lg hover:bg-muted/30 border border-transparent hover:border-border transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 flex items-start gap-2" onClick={() => onNavigate(session.url)}>
                         {session.url && (
                           <img src={getFaviconUrl(session.url)} alt="" className="w-4 h-4 mt-0.5 rounded-sm" />
                         )}
                         <div className="min-w-0">
                           <h3 className="font-medium text-xs text-foreground truncate cursor-pointer hover:text-primary transition-colors">
                             {session.title || session.url}
                           </h3>
                           <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                             {session.url}
                           </p>
                         </div>
                      </div>
                      <button
                        onClick={() => deleteSession.mutate(session.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/10">
                      <span className="text-[10px] text-muted-foreground">
                        {session.lastAccessed ? format(new Date(session.lastAccessed), 'MMM d, h:mm a') : 'Unknown'}
                      </span>
                      <button 
                         onClick={() => onNavigate(session.url)}
                         className="text-[10px] flex items-center gap-1 text-primary hover:underline"
                      >
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/10">
              <p className="text-xs text-center text-muted-foreground">
                History is synced securely with the server.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
