import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/auth/AuthContext';
import CharityBoxIcon from '@/components/icons/CharityBoxIcon';
import { Mail, ShieldCheck, UserPlus, LogIn, KeyRound } from 'lucide-react';

export default function Login() {
  const { isAuthenticated, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/dashboard';

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      const result = await loginWithGoogle();
      toast.success(`Signed in as ${result.user.email}`);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Unable to sign in with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      if (mode === 'login') {
        await loginWithEmail({ email: form.email, password: form.password });
        toast.success('Welcome back!');
      } else {
        const result = await registerWithEmail({ name: form.name, email: form.email, password: form.password });
        toast.success('Account created');
        toast.message(result.message, { icon: <Mail className="h-4 w-4" /> });
      }
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-8 items-center">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-400 text-white p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_45%)]" aria-hidden />
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
              <CharityBoxIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-semibold">Ma'aser Tracker</p>
              <p className="text-sm text-white/80">Keep your giving organized and secure</p>
            </div>
          </div>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" />
              <p className="text-lg font-semibold">Secure sign-in</p>
            </div>
            <p className="text-white/80 leading-relaxed">
              Choose Google or email-based login. We'll remember your session on this device so you can jump right into tracking
              your ma'aser without repeated logins.
            </p>
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <UserPlus className="h-4 w-4" />
                <span>Create an account with your email and we'll send a verification message.</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <LogIn className="h-4 w-4" />
                <span>Already registered? Just sign in and we will keep you logged in.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">Welcome</p>
              <p className="text-slate-600">Sign in to access your ma'aser dashboard.</p>
            </div>
            <div className="flex rounded-full border border-slate-200 overflow-hidden">
              {['login', 'signup'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    mode === value ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {value === 'login' ? 'Login' : 'Create account'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 font-semibold shadow-sm hover:-translate-y-0.5 active:scale-95 transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Continue with Google
            </button>

            <div className="relative py-2 text-center text-xs text-slate-500">
              <span className="px-3 bg-white relative z-10">or</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" aria-hidden />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition"
              >
                {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>

            <p className="text-xs text-slate-500 text-center">
              A verification email is sent when you create an account. Your session is remembered on this device so you stay signed
              in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
