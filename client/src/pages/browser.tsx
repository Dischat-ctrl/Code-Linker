import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCreateProxySession } from '@/hooks/use-proxy-sessions';
import { BrowserTabs, type Tab } from '@/components/ui/browser-tabs';
import { AddressBar } from '@/components/ui/address-bar';
import { BrowserControls } from '@/components/ui/browser-controls';
import { HistoryDrawer } from '@/components/history-drawer';
import { History, Settings, ShieldAlert, LogOut, User as UserIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from 'wouter';

// Mock home page content
const HomePage = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-background p-8 text-center animate-in fade-in zoom-in duration-500">
    <div className="mb-8 p-6 bg-primary/5 rounded-full ring-1 ring-primary/20">
       <ShieldAlert className="w-16 h-16 text-primary" />
    </div>
    <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight">
      HELIOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">BROWSER</span>
    </h1>
    <p className="text-lg text-muted-foreground max-w-2xl font-light">
      Secure. Fast. Unblockable. <br/>
      Enter a URL above to begin your browsing session.
    </p>
    
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
      {['Anti-Tracking', 'Encrypted Proxy', 'Session History'].map((feature) => (
        <div key={feature} className="p-4 rounded-xl border border-border bg-card/50 text-sm font-mono text-muted-foreground hover:border-primary/50 transition-colors cursor-default">
          {feature}
        </div>
      ))}
    </div>
  </div>
);

export default function BrowserPage() {
  const { user, logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const createSession = useCreateProxySession();
  
  // Tab State
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: '', active: true }
  ]);
  
  const [historyOpen, setHistoryOpen] = useState(false);
  
  // Effect for Auth Redirect
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isAuthLoading, setLocation]);

  const activeTab = tabs.find(t => t.active) || tabs[0];

  // Tab Handlers
  const handleNewTab = () => {
    const newTab: Tab = {
      id: uuidv4(),
      title: 'New Tab',
      url: '',
      active: true
    };
    setTabs(prev => prev.map(t => ({ ...t, active: false })).concat(newTab));
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) {
      // Don't close last tab, just reset it
      setTabs([{ ...tabs[0], title: 'New Tab', url: '' }]);
      return;
    }
    
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      // If we closed the active tab, activate the last one
      if (prev.find(t => t.id === id)?.active) {
        newTabs[newTabs.length - 1].active = true;
      }
      return newTabs;
    });
  };

  const handleActivateTab = (id: string) => {
    setTabs(prev => prev.map(t => ({ ...t, active: t.id === id })));
  };

  const handleNavigate = (url: string) => {
    // Update active tab
    setTabs(prev => prev.map(t => {
      if (t.active) {
        return {
          ...t,
          url,
          title: url.replace(/^https?:\/\//, '').substring(0, 20) + '...'
        };
      }
      return t;
    }));

    // Persist to backend
    createSession.mutate({
      url,
      title: 'Browsing Session',
      userId: user?.id || 'anonymous',
      isActive: true
    });
  };

  if (isAuthLoading) return null; // Or a loading spinner

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Bar (Chrome) */}
      <div className="flex flex-col shrink-0 border-b border-border bg-card/95 backdrop-blur z-20 browser-chrome">
        
        {/* Row 1: Tabs & User */}
        <div className="flex items-center pr-2">
          <div className="flex-1 overflow-hidden">
            <BrowserTabs 
              tabs={tabs} 
              onNewTab={handleNewTab} 
              onClose={handleCloseTab} 
              onActivate={handleActivateTab} 
            />
          </div>
          
          {/* Window Controls / User Menu */}
          <div className="flex items-center gap-2 pl-2 border-l border-border/20 ml-2">
             <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground mr-2">
                <UserIcon className="w-3 h-3" />
                <span>{user?.firstName || 'User'}</span>
             </div>
             <button 
                onClick={() => logout()}
                className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                title="Logout"
             >
                <LogOut className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Row 2: Navigation Bar */}
        <div className="flex items-center gap-2 p-2 pt-0 pb-2">
           <BrowserControls 
             canGoBack={true} // Mock
             canGoForward={false} // Mock
             onBack={() => {}} 
             onForward={() => {}} 
             onRefresh={() => {
                const iframe = document.getElementById('proxy-frame') as HTMLIFrameElement;
                if (iframe) iframe.src = iframe.src;
             }}
             onHome={() => handleNavigate('')}
           />
           
           <AddressBar 
             currentUrl={activeTab?.url || ''} 
             onNavigate={handleNavigate} 
           />

           <div className="flex items-center gap-1 pl-1">
              <button 
                onClick={() => setHistoryOpen(true)}
                className="p-2 rounded-lg hover:bg-muted/50 text-foreground transition-colors"
                title="History"
              >
                <History className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-muted/50 text-foreground transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-background w-full h-full">
        {activeTab.url ? (
          /* 
             NOTE: In a real proxy app, this would point to the backend proxy service.
             Since we can't implement a full proxy backend here, we use a placeholder approach
             or try to load safely if it allows framing.
          */
          <div className="w-full h-full flex flex-col">
            <iframe 
               id="proxy-frame"
               key={activeTab.id} // Re-render on tab switch
               src={activeTab.url}
               className="w-full h-full border-none bg-white"
               title="Content View"
               sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
               onError={(e) => console.error("Frame load error", e)}
            />
            {/* Fallback overlay if X-Frame-Options blocks it (just a visual hint for the user) */}
            <div className="absolute top-0 right-0 p-2 pointer-events-none">
               <span className="bg-black/70 text-white text-[10px] px-2 py-1 rounded font-mono backdrop-blur">
                 PROXY: {activeTab.url}
               </span>
            </div>
          </div>
        ) : (
          <HomePage />
        )}
      </div>

      {/* Slide-out Drawers */}
      <HistoryDrawer 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        onNavigate={(url) => {
          handleNavigate(url);
          setHistoryOpen(false);
        }} 
      />
    </div>
  );
}
