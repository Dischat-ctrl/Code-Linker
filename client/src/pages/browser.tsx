import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCreateProxySession } from '@/hooks/use-proxy-sessions';
import { BrowserTabs, type Tab } from '@/components/ui/browser-tabs';
import { AddressBar } from '@/components/ui/address-bar';
import { BrowserControls } from '@/components/ui/browser-controls';
import { HistoryDrawer } from '@/components/history-drawer';
import { SettingsDrawer, type BrowserSettings } from '@/components/settings-drawer';
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
  
  const defaultSettings: BrowserSettings = {
    themeMode: 'dark',
    preset: 'neon',
    customStyle: {
      chrome: '#0d0f14',
      tab: '#151a24',
      tabActive: '#1f2635',
      accent: '#9b5cff',
      text: '#f8fafc',
    },
    wallpaperUrl: '',
    autoClearMinutes: 0,
  };

  // Tab State
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: '', active: true, faviconUrl: '', loaded: false, lastActiveAt: Date.now() }
  ]);
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<BrowserSettings>(() => {
    const stored = localStorage.getItem('browserSettings');
    if (!stored) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
      return defaultSettings;
    }
  });
  
  // Effect for Auth Redirect
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isAuthLoading, setLocation]);

  const activeTab = tabs.find(t => t.active) || tabs[0];

  const userLabel = user?.firstName || user?.email?.split('@')[0] || 'User';

  const themePresets: Record<string, { chrome: string; tab: string; tabActive: string; accent: string; text: string }> = {
    neon: { chrome: '#0d0f14', tab: '#151a24', tabActive: '#1f2635', accent: '#9b5cff', text: '#f8fafc' },
    slate: { chrome: '#0f172a', tab: '#1e293b', tabActive: '#334155', accent: '#38bdf8', text: '#e2e8f0' },
    sunset: { chrome: '#2b1b1a', tab: '#3b2221', tabActive: '#4a2b29', accent: '#f97316', text: '#fff7ed' },
    mono: { chrome: '#111111', tab: '#1f1f1f', tabActive: '#2b2b2b', accent: '#a3a3a3', text: '#fafafa' },
  };

  const appliedTheme = settings.preset === 'custom'
    ? settings.customStyle
    : themePresets[settings.preset] || themePresets.neon;

  useEffect(() => {
    localStorage.setItem('browserSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', settings.themeMode === 'light');
  }, [settings.themeMode]);

  useEffect(() => {
    if (settings.autoClearMinutes <= 0) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      setTabs((prev) =>
        prev.map((tab) => {
          if (!tab.active && tab.loaded && now - tab.lastActiveAt > settings.autoClearMinutes * 60 * 1000) {
            return { ...tab, loaded: false };
          }
          return tab;
        })
      );
    }, 30000);
    return () => window.clearInterval(interval);
  }, [settings.autoClearMinutes]);

  const formatTabTitle = (url: string) => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname === '/' ? '' : parsed.pathname;
      const query = parsed.search ? parsed.search : '';
      return `${parsed.hostname}${path}${query}`;
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(parsed.origin)}`;
    } catch {
      return '';
    }
  };

  // Tab Handlers
  const handleNewTab = () => {
    const newTab: Tab = {
      id: uuidv4(),
      title: 'New Tab',
      url: '',
      active: true,
      faviconUrl: '',
      loaded: false,
      lastActiveAt: Date.now(),
    };
    setTabs(prev => prev.map(t => ({ ...t, active: false })).concat(newTab));
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) {
      // Don't close last tab, just reset it
      setTabs([{ ...tabs[0], title: 'New Tab', url: '', faviconUrl: '', loaded: false }]);
      return;
    }
    
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      // If we closed the active tab, activate the last one
      if (prev.find(t => t.id === id)?.active) {
        newTabs[newTabs.length - 1].active = true;
        newTabs[newTabs.length - 1].lastActiveAt = Date.now();
        if (newTabs[newTabs.length - 1].url) {
          newTabs[newTabs.length - 1].loaded = true;
        }
      }
      return newTabs;
    });
  };

  const handleActivateTab = (id: string) => {
    setTabs(prev => prev.map(t => ({
      ...t,
      active: t.id === id,
      lastActiveAt: t.id === id ? Date.now() : t.lastActiveAt,
      loaded: t.id === id && t.url ? true : t.loaded,
    })));
  };

  const handleNavigate = (url: string) => {
    const title = formatTabTitle(url);
    const faviconUrl = getFaviconUrl(url);
    // Update active tab
    setTabs(prev => prev.map(t => {
      if (t.active) {
        return {
          ...t,
          url,
          title,
          faviconUrl,
          loaded: true,
          lastActiveAt: Date.now(),
        };
      }
      return t;
    }));

    // Persist to backend
    createSession.mutate({
      url,
      title,
      userId: user?.id || 'anonymous',
      isActive: true
    });
  };

  if (isAuthLoading) return null; // Or a loading spinner

  return (
    <div
      className="flex flex-col h-screen bg-background overflow-hidden"
      style={{
        backgroundImage: settings.wallpaperUrl ? `url(${settings.wallpaperUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ['--browser-chrome-bg' as any]: appliedTheme.chrome,
        ['--browser-tab-bg' as any]: appliedTheme.tab,
        ['--browser-tab-active-bg' as any]: appliedTheme.tabActive,
        ['--browser-accent' as any]: appliedTheme.accent,
        ['--browser-text' as any]: appliedTheme.text,
      }}
    >
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
                <span>{userLabel}</span>
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
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-muted/50 text-foreground transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-background/80 w-full h-full backdrop-blur">
        {activeTab.url ? (
          /* 
             NOTE: In a real proxy app, this would point to the backend proxy service.
             Since we can't implement a full proxy backend here, we use a placeholder approach
             or try to load safely if it allows framing.
          */
          <div className="w-full h-full flex flex-col">
            {tabs.map((tab) =>
              tab.url && tab.loaded ? (
                <iframe
                  key={tab.id}
                  id={`proxy-frame-${tab.id}`}
                  src={tab.url}
                  className="w-full h-full border-none bg-white"
                  style={{ display: tab.active ? 'block' : 'none' }}
                  title={`Content View ${tab.id}`}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  onError={(e) => console.error('Frame load error', e)}
                />
              ) : null
            )}
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

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
        onPurgeAccount={async () => {
          await fetch('/api/account/purge', { method: 'DELETE', credentials: 'include' });
          setLocation('/login');
        }}
      />
    </div>
  );
}
