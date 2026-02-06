import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, ShieldAlert, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ThemeMode = 'dark' | 'light';
export type ThemePreset = 'neon' | 'slate' | 'sunset' | 'mono' | 'custom';

export interface BrowserThemeStyle {
  chrome: string;
  tab: string;
  tabActive: string;
  accent: string;
  text: string;
}

export interface BrowserSettings {
  themeMode: ThemeMode;
  preset: ThemePreset;
  customStyle: BrowserThemeStyle;
  wallpaperUrl: string;
  autoClearMinutes: number;
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BrowserSettings;
  onChange: (settings: BrowserSettings) => void;
  onPurgeAccount: () => void;
}

const presetOptions: Array<{ label: string; value: ThemePreset }> = [
  { label: 'Neon', value: 'neon' },
  { label: 'Slate', value: 'slate' },
  { label: 'Sunset', value: 'sunset' },
  { label: 'Mono', value: 'mono' },
  { label: 'Custom', value: 'custom' },
];

export function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  onChange,
  onPurgeAccount,
}: SettingsDrawerProps) {
  const updateSetting = (patch: Partial<BrowserSettings>) => {
    onChange({ ...settings, ...patch });
  };

  const updateCustom = (patch: Partial<BrowserThemeStyle>) => {
    onChange({
      ...settings,
      customStyle: {
        ...settings.customStyle,
        ...patch,
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">Ajustes</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Modo</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['dark', 'light'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSetting({ themeMode: mode })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide',
                        settings.themeMode === mode
                          ? 'border-primary text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {mode === 'dark' ? 'Oscuro' : 'Claro'}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Estilo del navegador</h3>
                <div className="grid grid-cols-2 gap-3">
                  {presetOptions.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => updateSetting({ preset: preset.value })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide',
                        settings.preset === preset.value
                          ? 'border-primary text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {settings.preset === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <label className="space-y-1">
                      <span>Barra superior</span>
                      <input
                        type="color"
                        value={settings.customStyle.chrome}
                        onChange={(event) => updateCustom({ chrome: event.target.value })}
                        className="h-9 w-full rounded-md border border-border bg-background"
                      />
                    </label>
                    <label className="space-y-1">
                      <span>Pestañas</span>
                      <input
                        type="color"
                        value={settings.customStyle.tab}
                        onChange={(event) => updateCustom({ tab: event.target.value })}
                        className="h-9 w-full rounded-md border border-border bg-background"
                      />
                    </label>
                    <label className="space-y-1">
                      <span>Pestaña activa</span>
                      <input
                        type="color"
                        value={settings.customStyle.tabActive}
                        onChange={(event) => updateCustom({ tabActive: event.target.value })}
                        className="h-9 w-full rounded-md border border-border bg-background"
                      />
                    </label>
                    <label className="space-y-1">
                      <span>Acento</span>
                      <input
                        type="color"
                        value={settings.customStyle.accent}
                        onChange={(event) => updateCustom({ accent: event.target.value })}
                        className="h-9 w-full rounded-md border border-border bg-background"
                      />
                    </label>
                    <label className="space-y-1 col-span-2">
                      <span>Texto</span>
                      <input
                        type="color"
                        value={settings.customStyle.text}
                        onChange={(event) => updateCustom({ text: event.target.value })}
                        className="h-9 w-full rounded-md border border-border bg-background"
                      />
                    </label>
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Fondo de pantalla</h3>
                <input
                  type="text"
                  placeholder="https://..."
                  value={settings.wallpaperUrl}
                  onChange={(event) => updateSetting({ wallpaperUrl: event.target.value })}
                  className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/60"
                />
                <p className="text-xs text-muted-foreground">
                  Usa una URL para mostrar un fondo personalizado detrás de las pestañas.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Limpieza de RAM</h3>
                <input
                  type="number"
                  min={0}
                  max={240}
                  value={settings.autoClearMinutes}
                  onChange={(event) =>
                    updateSetting({ autoClearMinutes: Number(event.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/60"
                />
                <p className="text-xs text-muted-foreground">
                  Minutos sin actividad antes de liberar pestañas en memoria. Usa 0 para desactivar.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Cuenta</h3>
                <button
                  onClick={onPurgeAccount}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 transition"
                >
                  <span>Eliminar todos los datos de esta cuenta</span>
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                  <span>Esto borra tu historial y sesión actual.</span>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
