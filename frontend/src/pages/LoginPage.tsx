import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import api from '../utils/api';
import userLoginImg from '../assets/userlogin.png';
import storeLoginImg from '../assets/storelogin.png';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Store,
  Shield,
  Star,
  LineChart,
  LockKeyhole,
  CheckCircle2,
  Headphones,
  ArrowRight,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USER' | 'STORE_OWNER'>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;
      login(accessToken, user);

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STORE_OWNER') {
        navigate('/store');
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (tab: 'USER' | 'STORE_OWNER') => {
    setActiveTab(tab);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#EAE6F8] flex flex-col items-center justify-center p-4 font-sans">

      {/* ── Desktop: full-bleed image with absolutely-positioned form ─────── */}
      <div
        className="hidden md:block w-full relative"
        style={{ maxWidth: 1160, aspectRatio: '4096 / 2730' }}
      >
        {/* Background image (swaps on tab change) */}
        <img
          src={activeTab === 'USER' ? userLoginImg : storeLoginImg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
          draggable={false}
        />

        {/* Form overlay — positioned over the white card in the image */}
        <div
          className="absolute flex flex-col"
          style={{
            left:   '46.7%',
            top:    '4.5%',
            width:  '49%',
            height: '91%',
          }}
        >
          {/* Inner scroll container so form is always fully visible */}
          <div className="flex flex-col h-full px-8 py-6 overflow-y-auto">

            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold text-heading">Welcome back!</h2>
              <p className="text-xs font-semibold text-muted mt-0.5">Login or register to continue</p>
            </div>

            {/* Tab toggle */}
            <div className="bg-surface-soft p-1 rounded-xl border border-border flex mb-5">
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'USER'
                    ? 'bg-white shadow-sm border-b-2 border-primary text-primary'
                    : 'text-muted hover:text-body'
                }`}
                onClick={() => handleTabSwitch('USER')}
              >
                <Users className="w-3.5 h-3.5" /> Normal User
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'STORE_OWNER'
                    ? 'bg-white shadow-sm border-b-2 border-primary text-primary'
                    : 'text-muted hover:text-body'
                }`}
                onClick={() => handleTabSwitch('STORE_OWNER')}
              >
                <Store className="w-3.5 h-3.5" /> Store Owner
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-danger/10 text-danger rounded-lg text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1 text-left">
                  Email Address
                </label>
                <span className="absolute left-3 top-[30px] text-muted pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white/70 focus:bg-white focus:outline-none focus:border-primary text-sm text-heading transition-colors"
                  placeholder="Email address"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1 text-left">
                  Password
                </label>
                <span className="absolute left-3 top-[30px] text-muted pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[30px] text-muted hover:text-body focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-white/70 focus:bg-white focus:outline-none focus:border-primary text-sm text-heading transition-colors"
                  placeholder="Password"
                />
              </div>

              {/* Forgot */}
              <div className="text-right">
                <button type="button" className="text-xs font-bold text-primary hover:underline focus:outline-none">
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? 'Signing in…' : (
                  activeTab === 'USER'
                    ? <><span>Login</span><ArrowRight className="w-4 h-4" /></>
                    : <><span>Login as Store Owner</span><ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-border/60" />
              <span className="flex-shrink mx-3 text-[10px] font-semibold text-muted uppercase tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-border/60" />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-heading focus:outline-none">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-heading focus:outline-none">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Apple
              </button>
            </div>

            {/* Footer link */}
            <div className="text-center text-xs text-muted">
              {activeTab === 'USER' ? (
                <>
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary font-bold hover:underline">
                    Register now
                  </Link>
                </>
              ) : (
                <>
                  Don't have a store account?{' '}
                  <Link to="/register?tab=store" className="text-primary font-bold hover:underline">
                    Register now
                  </Link>
                </>
              )}
            </div>

            {/* Bottom trust row */}
            <div className="mt-4 pt-3 border-t border-border/30 grid grid-cols-3 gap-1 text-left">
              {activeTab === 'USER' ? (
                <>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-primary">
                      <Shield className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-heading">Trusted & Secure</span>
                    </div>
                    <p className="text-[9px] text-muted">We protect your data</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-primary">
                      <Users className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-heading">Real & Honest</span>
                    </div>
                    <p className="text-[9px] text-muted">Reviews from real people</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="w-3 h-3 fill-primary/20" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-heading">Better Choices</span>
                    </div>
                    <p className="text-[9px] text-muted">Make confident decisions</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-primary">
                      <LockKeyhole className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-heading">Secure Access</span>
                    </div>
                    <p className="text-[9px] text-muted">Your data is protected</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-primary">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-heading">Verified Platform</span>
                    </div>
                    <p className="text-[9px] text-muted">Trusted by thousands</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-primary">
                      <Headphones className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-heading">Dedicated Support</span>
                    </div>
                    <p className="text-[9px] text-muted">We're here to help</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile fallback: plain form card ────────────────────────────── */}
      <div className="md:hidden w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border/20 p-6 space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-heading">Welcome back!</h2>
          <p className="text-xs font-semibold text-muted mt-0.5">Login or register to continue</p>
        </div>

        {/* Mobile tab */}
        <div className="bg-surface-soft p-1 rounded-xl border border-border flex">
          <button
            type="button"
            onClick={() => handleTabSwitch('USER')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'USER' ? 'bg-white shadow-sm border-b-2 border-primary text-primary' : 'text-muted'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Normal User
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('STORE_OWNER')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'STORE_OWNER' ? 'bg-white shadow-sm border-b-2 border-primary text-primary' : 'text-muted'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Store Owner
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-danger/10 text-danger rounded-lg text-xs font-semibold text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Mail className="w-4 h-4" /></span>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface-soft focus:outline-none focus:border-primary text-sm"
              placeholder="Email address" />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Lock className="w-4 h-4" /></span>
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted focus:outline-none">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-surface-soft focus:outline-none focus:border-primary text-sm"
              placeholder="Password" />
          </div>
          <div className="text-right">
            <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
          </div>
          <Button type="submit" variant="primary" className="w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? 'Signing in…' : <><span>{activeTab === 'USER' ? 'Login' : 'Login as Store Owner'}</span><ArrowRight className="w-4 h-4" /></>}
          </Button>
        </form>

        <div className="text-center text-xs text-muted pt-2 border-t border-border/30">
          {activeTab === 'USER' ? (
            <>Don't have an account?{' '}<Link to="/register" className="text-primary font-bold hover:underline">Register now</Link></>
          ) : (
            <>Don't have a store account?{' '}<Link to="/register?tab=store" className="text-primary font-bold hover:underline">Register now</Link></>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
