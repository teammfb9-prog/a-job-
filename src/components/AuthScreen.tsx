import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export function AuthScreen({ onLogin, onBack, t, isRtl }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('pox_users') || '{}');

    if (isLogin) {
      if (users[email] && users[email].password === password) {
        onLogin(users[email].name);
      } else {
        setError(isRtl ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');
      }
    } else {
      // Password validation: at least 8 chars, at least one letter and one number
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        setError(isRtl 
          ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وتحتوي على حروف وأرقام' 
          : 'Password must be at least 8 characters and contain both letters and numbers');
        return;
      }

      if (users[email]) {
        setError(isRtl ? 'هذا الحساب مسجل مسبقاً' : 'Account already exists');
      } else {
        users[email] = { name, password };
        localStorage.setItem('pox_users', JSON.stringify(users));
        onLogin(name);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[var(--bg)]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-[var(--muted)] p-8 rounded-3xl shadow-2xl border border-[var(--border)] animate-[fadeIn_0.4s_ease-out] relative">
        
        <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full hover:bg-[var(--border)] transition-colors text-[var(--muted-fg)]">
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20 mb-4">
            <Sparkles className="w-8 h-8 text-[var(--accent-fg)]" />
          </div>
          <h1 className="text-3xl font-bold text-center">{t.welcomeTitle}</h1>
          <p className="text-[var(--muted-fg)] text-center mt-2">{t.welcomeSub}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <div className={`absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'} text-[var(--muted-fg)]`}>
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder={isRtl ? 'الاسم' : 'Name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} focus:outline-none focus:border-[var(--accent)] transition-colors`}
                dir="auto"
              />
            </div>
          )}
          <div className="relative">
            <div className={`absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'} text-[var(--muted-fg)]`}>
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} focus:outline-none focus:border-[var(--accent)] transition-colors`}
              dir="auto"
            />
          </div>
          <div className="relative">
            <div className={`absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'} text-[var(--muted-fg)]`}>
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={isRtl ? 'كلمة المرور (8+ أحرف وأرقام)' : 'Password (8+ chars & numbers)'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 ${isRtl ? 'pr-11 pl-11' : 'pl-11 pr-11'} focus:outline-none focus:border-[var(--accent)] transition-colors`}
              dir="auto"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute top-3.5 ${isRtl ? 'left-3.5' : 'right-3.5'} text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--accent)] text-[var(--accent-fg)] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-6 shadow-md shadow-[var(--accent)]/20"
          >
            {isLogin ? (isRtl ? 'تسجيل الدخول' : 'Login') : (isRtl ? 'إنشاء حساب' : 'Sign Up')}
            <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm text-[var(--muted-fg)] hover:text-[var(--accent)] transition-colors font-medium"
          >
            {isLogin 
              ? (isRtl ? 'ليس لديك حساب؟ إنشاء حساب جديد' : "Don't have an account? Sign up") 
              : (isRtl ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Login')}
          </button>
        </div>
      </div>
    </div>
  );
}
