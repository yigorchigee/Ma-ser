import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, KeyRound } from 'lucide-react';

import { useAuth } from '@/auth/AuthContext';
import { dataClient } from '@/api/dataClient';
import TzedakaLogo from '@/components/icons/TzedakaLogo';

export default function Login({ defaultMode = 'login' }) {
  const { isAuthenticated, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/dashboard';

  const [mode, setMode] = useState(defaultMode);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleLoginEnabled = dataClient.auth.isGoogleLoginConfigured();

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
      const nextPath = mode === 'signup' ? '/connect-accounts' : redirectPath;
      if (result.user?.has_security_pin) {
        navigate('/create-pin', { replace: true, state: { from: nextPath } });
      } else {
        navigate(nextPath, { replace: true });
      }
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
      let result;
      if (mode === 'login') {
        result = await loginWithEmail({ email: form.email, password: form.password });
        toast.success('Welcome back!');
      } else {
        result = await registerWithEmail({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        toast.success('Account created');
        toast.message(result.message, { icon: <Mail size={16} /> });
      }
      const nextPath = mode === 'signup' ? '/connect-accounts' : redirectPath;
      if (result?.user?.has_security_pin) {
        navigate('/create-pin', { replace: true, state: { from: nextPath } });
      } else {
        navigate(nextPath, { replace: true });
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <div className="auth-brand">
              <TzedakaLogo variant="full" className="auth-brand-logo" />
            </div>
            <p className="auth-title">{mode === 'login' ? 'Welcome' : 'Create account'}</p>
            <p className="auth-subtitle">
              {mode === 'login'
                ? "Sign in to access your ma'aser dashboard."
                : 'Create your Tzedaka Tracker account to get started.'}
            </p>
          </div>

          <div className="auth-content">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="auth-google-btn"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="auth-google-icon"
              />
              Continue with Google
            </button>

            {!googleLoginEnabled && (
              <div className="auth-warning">
                <p className="auth-warning-title">Google login is not set up yet.</p>
                <p>
                  In your <code>.env</code> file (or hosting env vars), set <code>VITE_GOOGLE_CLIENT_ID</code> to
                  <span className="auth-warning-id"> 377092527146-vu27pupmj0m69d3ndavbnv2i7adv6t9k.apps.googleusercontent.com</span>
                  , then restart the app. Add <code>{window.location.origin}</code> as an authorized JavaScript origin for the
                  OAuth client in Google Cloud Console so local sign-ins are allowed. You can also set
                  <code>window.VITE_GOOGLE_CLIENT_ID</code> in the browser console for quick local testing.
                </p>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="auth-form">
              {mode === 'signup' && (
                <div className="auth-field">
                  <label className="auth-label" htmlFor="name">Full name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="auth-input"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="password">Password</label>
                <div className="auth-input-icon-wrap">
                  <KeyRound size={16} className="auth-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="auth-input auth-input-with-icon"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
                {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
              </button>

              {mode === 'login' ? (
                <p className="auth-switch-copy">
                  New to Tzedaka Tracker?{' '}
                  <button type="button" onClick={() => setMode('signup')} className="auth-switch-btn">
                    Create account
                  </button>
                </p>
              ) : (
                <p className="auth-switch-copy">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode('login')} className="auth-switch-btn">
                    Log in
                  </button>
                </p>
              )}
            </form>

            <p className="auth-footnote">
              A verification email is sent when you create an account. Your session is remembered on this device so you stay
              signed in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
