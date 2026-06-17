import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/Button';
import api from '../utils/api';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Check,
} from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Form interactions
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Requirements checking
  const hasMinLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const isPasswordValid = hasMinLength && hasUppercase && hasSpecialChar;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!currentPassword) {
      setApiError('Current password is required');
      return;
    }

    if (!isPasswordValid) {
      setApiError('New password does not meet the requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setApiError('New password and password confirmation do not match');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/auth/change-password', {
        oldPassword: currentPassword,
        newPassword: newPassword,
      });

      // Show success toast
      setToastMessage('Password updated successfully!');
      
      // Reset input fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewPasswordTouched(false);
      setConfirmPasswordTouched(false);

      // Offer to log the user out
      setShowLogoutModal(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to change password. Please check your current password.';
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto text-left space-y-6 relative">
        
        {/* SUCCESS TOAST OVERLAY */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-success text-white px-5 py-3 rounded-btn shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Page header */}
        <div>
          <h2 className="text-2xl font-extrabold text-heading">Change Password</h2>
          <p className="text-sm text-muted">Update your credentials to maintain a secure account</p>
        </div>

        {/* Change Password Form Card */}
        <div className="bg-surface rounded-card border border-border/40 shadow-soft p-6 md:p-8">
          {apiError && (
            <div className="mb-6 p-4 bg-danger/10 text-danger border border-danger/20 rounded-btn text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Current Password */}
            <div className="relative">
              <span className="absolute left-4 top-[38px] text-muted">
                <Lock className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-[38px] text-muted hover:text-body focus:outline-none"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-2.5 rounded-btn border border-border bg-surface-soft focus:outline-none focus:border-primary text-sm text-heading"
                placeholder="••••••••"
              />
            </div>

            {/* New Password */}
            <div className="relative">
              <span className="absolute left-4 top-[38px] text-muted">
                <Key className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-[38px] text-muted hover:text-body focus:outline-none"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setNewPasswordTouched(true);
                }}
                className={`w-full pl-11 pr-11 py-2.5 rounded-btn border bg-surface-soft focus:outline-none text-sm text-heading ${
                  newPasswordTouched
                    ? isPasswordValid
                      ? 'border-success/50 focus:border-success'
                      : 'border-danger/50 focus:border-danger'
                    : 'border-border focus:border-primary'
                }`}
                placeholder="••••••••"
              />
            </div>

            {/* Password Validation Checklist */}
            {newPasswordTouched && (
              <div className="bg-surface-soft border border-border/40 p-4 rounded-btn space-y-2">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Password Requirements:</span>
                <ul className="text-xs space-y-1.5">
                  <li className={`flex items-center gap-2 ${hasMinLength ? 'text-success font-semibold' : 'text-body'}`}>
                    {hasMinLength ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0 text-muted" />}
                    8 - 16 characters long
                  </li>
                  <li className={`flex items-center gap-2 ${hasUppercase ? 'text-success font-semibold' : 'text-body'}`}>
                    {hasUppercase ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0 text-muted" />}
                    Contains at least one uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${hasSpecialChar ? 'text-success font-semibold' : 'text-body'}`}>
                    {hasSpecialChar ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0 text-muted" />}
                    Contains at least one special character
                  </li>
                </ul>
              </div>
            )}

            {/* Confirm New Password */}
            <div className="relative">
              <span className="absolute left-4 top-[38px] text-muted">
                <Lock className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-[38px] text-muted hover:text-body focus:outline-none"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordTouched(true);
                }}
                className={`w-full pl-11 pr-11 py-2.5 rounded-btn border bg-surface-soft focus:outline-none text-sm text-heading ${
                  confirmPasswordTouched
                    ? passwordsMatch
                      ? 'border-success/50 focus:border-success'
                      : 'border-danger/50 focus:border-danger'
                    : 'border-border focus:border-primary'
                }`}
                placeholder="••••••••"
              />
            </div>

            {/* Inline Confirmation Mismatch Message */}
            {confirmPasswordTouched && confirmPassword !== '' && !passwordsMatch && (
              <p className="text-xs text-danger font-semibold flex items-center gap-1.5 mt-1 text-left">
                <XCircle className="w-4 h-4 shrink-0" /> Passwords do not match
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 mt-4"
              disabled={submitting || !isPasswordValid || !passwordsMatch}
            >
              {submitting ? 'Changing password...' : 'Update Password'}
            </Button>
          </form>

        </div>

      </div>

      {/* OFFER LOGOUT MODAL OVERLAY */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-heading/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md p-6 rounded-card shadow-2xl border border-border flex flex-col items-center relative text-center max-w-sm animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center text-xl mb-4 border border-success/20">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <h3 className="text-lg font-bold text-heading">Password Changed!</h3>
            <p className="text-xs text-body mt-2 mb-6 leading-relaxed">
              Your password has been changed successfully. For your security, we recommend logging out and logging back in with your new credentials.
            </p>

            <div className="flex flex-col gap-2.5 w-full">
              <Button
                variant="primary"
                className="w-full py-2.5 text-xs bg-primary hover:bg-primary-dark font-bold shadow-none"
                onClick={handleLogoutConfirm}
              >
                Yes, Log Out Now
              </Button>
              <Button
                variant="outline"
                className="w-full py-2.5 text-xs text-muted font-bold"
                onClick={handleLogoutCancel}
              >
                No, Stay Logged In
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ChangePasswordPage;
