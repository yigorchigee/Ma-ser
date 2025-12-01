import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/auth/AuthContext';
import { Mail, KeyRound } from 'lucide-react';

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
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">{mode === 'login' ? 'Welcome' : 'Create account'}</p>
              <p className="text-slate-600">
                {mode === 'login'
                  ? "Sign in to access your ma'aser dashboard."
                  : 'Create your Tzedaka Tracker account to get started.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 font-semibold shadow-sm hover:-translate-y-0.5 active:scale-95 transition disabled:opacity-60"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Continue with Google
            </button>

            {!googleLoginEnabled && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-3 px-4 space-y-1">
                <p className="font-semibold text-center">Google login is not set up yet.</p>
                <p>
                  In your <code>.env</code> file (or hosting env vars), set <code>VITE_GOOGLE_CLIENT_ID</code> to
                  <span className="font-semibold"> 377092527146-vu27pupmj0m69d3ndavbnv2i7adv6t9k.apps.googleusercontent.com</span>
                  , then restart the app. You can also set <code>window.VITE_GOOGLE_CLIENT_ID</code> in the browser
                  console for quick local testing.
                </p>
              </div>
            )}

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

              {mode === 'login' ? (
                <p className="text-xs text-slate-600 text-center">
                  New to Tzedaka Tracker?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-blue-700 font-semibold hover:underline"
                  >
                    Create account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-600 text-center">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-700 font-semibold hover:underline"
                  >
                    Log in
                  </button>
                </p>
              )}
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
