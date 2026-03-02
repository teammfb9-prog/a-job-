import React from 'react';
import { Sparkles, Mail, Github, Facebook, Twitter, Apple, Briefcase } from 'lucide-react';

export function StartScreen({ onNavigate, onGoogleLogin, t, isRtl }: any) {
  const handleSocialClick = () => {
    alert(isRtl ? 'قريباً! هذه الميزة ستتوفر في التحديث القادم.' : 'Coming soon! This feature will be available in the next update.');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[var(--bg)]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md flex flex-col items-center animate-[fadeIn_0.8s_ease-out]">
        <div className="w-24 h-24 rounded-3xl bg-[var(--accent)] flex items-center justify-center shadow-2xl shadow-[var(--accent)]/30 mb-8 transform hover:scale-105 transition-transform">
          <Briefcase className="w-12 h-12 text-[var(--accent-fg)]" />
        </div>
        
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-blue-400 mb-2 text-center">
          A Job AI
        </h1>
        <p className="text-xl font-bold text-[var(--fg)] mb-4 text-center">
          {isRtl ? 'عمل' : 'Work'}
        </p>
        <p className="text-lg text-[var(--muted-fg)] text-center mb-12 max-w-sm leading-relaxed">
          {t.startSubtitle}
        </p>

        <div className="w-full space-y-3">
          <button 
            onClick={handleSocialClick}
            className="w-full bg-white text-gray-800 border border-gray-200 py-3 px-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isRtl ? 'المتابعة باستخدام Google' : 'Continue with Google'}
          </button>

          <button 
            onClick={handleSocialClick}
            className="w-full bg-black text-white py-3 px-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-900 transition-all shadow-sm"
          >
            <Apple className="w-5 h-5" />
            {isRtl ? 'المتابعة باستخدام Apple' : 'Continue with Apple'}
          </button>

          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={handleSocialClick}
              className="bg-[#1DA1F2] text-white py-3 px-4 rounded-2xl font-semibold flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
              title="Continue with X"
            >
              <Twitter className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSocialClick}
              className="bg-[#1877F2] text-white py-3 px-4 rounded-2xl font-semibold flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
              title="Continue with Facebook"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSocialClick}
              className="bg-[#333333] text-white py-3 px-4 rounded-2xl font-semibold flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
              title="Continue with GitHub"
            >
              <Github className="w-5 h-5" />
            </button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg)] px-4 text-sm text-[var(--muted-fg)]">
                {isRtl ? 'أو' : 'OR'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('auth')}
            className="w-full bg-[var(--accent)] text-[var(--accent-fg)] py-3 px-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-md shadow-[var(--accent)]/20"
          >
            <Mail className="w-5 h-5" />
            {isRtl ? 'المتابعة بالبريد الإلكتروني' : 'Continue with Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
