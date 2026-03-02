import React from 'react';
import { ArrowLeft, Moon, Sun, Layout, MessageSquare, Palette, User, LogOut, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsScreen({ onBack, settings, setSettings, t, isRtl, userName, onLogout, onClearHistory }: any) {
  return (
    <div className="flex flex-col h-screen bg-[var(--bg)] text-[var(--fg)]" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="flex-none flex items-center gap-4 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)] z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors">
          <ArrowLeft className={cn("w-5 h-5", isRtl ? "rotate-180" : "")} />
        </button>
        <h1 className="text-xl font-bold">{t.settings}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Account Section */}
          <section className="bg-[var(--muted)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--accent)]" />
              {isRtl ? 'الحساب' : 'Account'}
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center font-bold">
                    {userName ? userName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{userName || (isRtl ? 'مستخدم' : 'User')}</p>
                    <p className="text-sm text-[var(--muted-fg)]">{isRtl ? 'حساب محلي' : 'Local Account'}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  {isRtl ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <button 
                  onClick={() => {
                    if (window.confirm(isRtl ? 'هل أنت متأكد من مسح سجل المحادثة؟' : 'Are you sure you want to clear chat history?')) {
                      onClearHistory();
                    }
                  }}
                  className="flex items-center gap-2 text-[var(--muted-fg)] hover:text-red-500 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  {isRtl ? 'مسح سجل المحادثة' : 'Clear Chat History'}
                </button>
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section className="bg-[var(--muted)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-[var(--accent)]" />
              {t.appearance}
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.theme}</p>
                  <p className="text-sm text-[var(--muted-fg)]">{t.themeDesc}</p>
                </div>
                <div className="flex bg-[var(--bg)] border border-[var(--border)] rounded-full p-1">
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                      settings.theme === 'light' ? "bg-white text-black shadow-sm" : "text-[var(--muted-fg)] hover:text-[var(--fg)]"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                    {isRtl ? 'نهاري' : 'Light'}
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                      settings.theme === 'dark' ? "bg-gray-800 text-white shadow-sm" : "text-[var(--muted-fg)] hover:text-[var(--fg)]"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    {isRtl ? 'ليلي' : 'Dark'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.canvas}</p>
                  <p className="text-sm text-[var(--muted-fg)]">{t.canvasDesc}</p>
                </div>
                <button 
                  onClick={() => setSettings({...settings, canvasEnabled: !settings.canvasEnabled})}
                  className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", settings.canvasEnabled ? "bg-[var(--accent)]" : "bg-[var(--border)]")}
                >
                  <span className={cn("inline-block h-4 w-4 transform rounded-full bg-[var(--bg)] transition-transform", settings.canvasEnabled ? (isRtl ? "-translate-x-6" : "translate-x-6") : (isRtl ? "-translate-x-1" : "translate-x-1"))} />
                </button>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="font-medium">{isRtl ? 'لون المحادثة' : 'Chat Color'}</p>
                  <p className="text-sm text-[var(--muted-fg)]">{isRtl ? 'تخصيص لون المساعد' : 'Customize assistant color'}</p>
                </div>
                <div className="flex gap-2">
                  {['#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b'].map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-[var(--bg)] shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        document.documentElement.style.setProperty('--accent', color);
                        document.documentElement.style.setProperty('--bubble-model', `${color}15`);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* AI Personality Section */}
          <section className="bg-[var(--muted)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
              {t.aiPersonality}
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted-fg)]">{t.aiPersonalityDesc}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['professional', 'friendly', 'silly', 'concise'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setSettings({...settings, responseStyle: style})}
                    className={cn(
                      "py-3 px-4 rounded-xl border font-medium transition-all text-sm",
                      settings.responseStyle === style 
                        ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] shadow-md" 
                        : "bg-[var(--bg)] border-[var(--border)] hover:border-[var(--accent)]/50"
                    )}
                  >
                    {t[style as keyof typeof t]}
                  </button>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
