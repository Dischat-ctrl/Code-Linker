import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Shield, Lock, Terminal, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (isAuthenticated) {
    setLocation('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Abstract Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-stretch gap-12 p-6">
        
        {/* Left Side: Brand */}
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              SYSTEM ONLINE
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 mb-4">
              HELIOS<br/><span className="text-primary">PROXY</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
              Advanced web browsing capability within a secure, sandboxed environment. Bypass restrictions. Remain invisible.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            <FeatureCard 
              icon={<Shield className="w-5 h-5 text-secondary" />}
              title="Stealth Mode"
              desc="Traffic masking active"
            />
            <FeatureCard 
              icon={<Terminal className="w-5 h-5 text-primary" />}
              title="Encrypted"
              desc="End-to-end security"
            />
            <FeatureCard 
              icon={<Globe className="w-5 h-5 text-secondary" />}
              title="Global"
              desc="Any site, anywhere"
            />
          </motion.div>
        </div>

        {/* Right Side: Login Action */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="lg:w-[400px] flex flex-col"
        >
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl flex flex-col h-full justify-between">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-background rounded-xl border border-border flex items-center justify-center">
                <Lock className="w-6 h-6 text-foreground" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">Authentication Required</h3>
                <p className="text-muted-foreground text-sm">
                  Please verify your identity to access the terminal.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 text-sm font-mono text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Server Status: Nominal</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 text-sm font-mono text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Gateway: Connected</span>
                </div>
              </div>
            </div>

            <a 
              href="/api/login"
              className="group mt-8 w-full flex items-center justify-between px-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-[0_0_20px_-5px_hsla(var(--primary),0.5)] hover:shadow-[0_0_25px_-5px_hsla(var(--primary),0.6)] hover:-translate-y-0.5"
            >
              <span>Initialize Session</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-card/30 border border-border/30 hover:border-primary/30 transition-colors">
      <div className="mb-2">{icon}</div>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}
