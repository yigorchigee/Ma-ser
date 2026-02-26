import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { dataClient } from '@/api/dataClient';

export default function CreatePin() {
  const { user, isAuthenticated, isPinVerified, markPinVerified } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handlePinChange = (setter) => (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 4);
    setter(digitsOnly);
  };

  const redirectPath = location.state?.from || '/dashboard';
  const hasExistingPin = Boolean(user?.has_security_pin);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isPinVerified) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);

      if (hasExistingPin) {
        await dataClient.auth.verifySecurityPin(pin);
        toast.success('PIN verified');
      } else {
        if (pin !== confirmPin) {
          throw new Error('PINs must match.');
        }

        await dataClient.auth.setSecurityPin(pin);
        toast.success('PIN created');
      }

      markPinVerified();
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Unable to update PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-108px)] bg-slate-50 flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{hasExistingPin ? 'Enter your PIN' : 'Create your PIN'}</p>
              <p className="text-slate-600">
                {hasExistingPin
                  ? 'For your security, please confirm your PIN to continue.'
                  : 'Set a 4-digit PIN to secure your account before continuing.'}
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800" htmlFor="pin">
                {hasExistingPin ? 'Security PIN' : 'Choose a PIN'}
              </label>
              <input
                id="pin"
                name="pin"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                minLength={4}
                value={pin}
                onChange={handlePinChange(setPin)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4-digit PIN"
              />
            </div>

            {!hasExistingPin && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="confirmPin">
                  Confirm PIN
                </label>
                <input
                  id="confirmPin"
                  name="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                minLength={4}
                value={confirmPin}
                onChange={handlePinChange(setConfirmPin)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Re-enter your PIN"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition"
            >
              {isSubmitting ? 'Please wait...' : hasExistingPin ? 'Verify PIN' : 'Create PIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
