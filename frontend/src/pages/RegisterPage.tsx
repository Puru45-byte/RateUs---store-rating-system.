import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import api from '../utils/api';
import {
  Users,
  Store,
  User,
  Mail,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Building2,
} from 'lucide-react';

/* ─── helpers ──────────────────────────────────────────────── */
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passRx  = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

function validateUser(f: { name: string; email: string; address: string; password: string }) {
  const e: Record<string, string> = {};
  if (f.name.length < 5 || f.name.length > 60)
    e.name = 'Name must be 5–60 characters.';
  if (!emailRx.test(f.email))
    e.email = 'Enter a valid email address.';
  if (f.address.length > 400)
    e.address = 'Address must be at most 400 characters.';
  if (f.address.trim() === '')
    e.address = 'Address is required.';
  if (!passRx.test(f.password))
    e.password = 'Password must be 8–16 chars with at least 1 uppercase letter and 1 special character.';
  return e;
}

function validateStoreOwner(f: {
  ownerName: string; ownerEmail: string; ownerAddress: string; password: string;
  storeName: string; storeEmail: string; storeAddress: string;
}) {
  const e: Record<string, string> = {};
  if (f.ownerName.length < 5 || f.ownerName.length > 60)
    e.ownerName = 'Owner name must be 5–60 characters.';
  if (!emailRx.test(f.ownerEmail))
    e.ownerEmail = 'Enter a valid owner email address.';
  if (f.ownerAddress.trim() === '' || f.ownerAddress.length > 400)
    e.ownerAddress = f.ownerAddress.trim() === '' ? 'Owner address is required.' : 'Address must be at most 400 characters.';
  if (!passRx.test(f.password))
    e.password = 'Password must be 8–16 chars with at least 1 uppercase letter and 1 special character.';
  if (f.storeName.length < 5 || f.storeName.length > 60)
    e.storeName = 'Store name must be 5–60 characters.';
  if (!emailRx.test(f.storeEmail))
    e.storeEmail = 'Enter a valid store email address.';
  if (f.storeAddress.trim() === '' || f.storeAddress.length > 400)
    e.storeAddress = f.storeAddress.trim() === '' ? 'Store address is required.' : 'Address must be at most 400 characters.';
  return e;
}

/* ─── field component ───────────────────────────────────────── */
function Field({
  label, icon, error, children,
}: { label: string; icon?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">{icon}</span>}
        <div className={icon ? '[&>*]:pl-9' : ''}>{children}</div>
      </div>
      {error && <p className="text-xs text-danger mt-1 font-semibold">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full px-4 py-2.5 rounded-btn border bg-surface-soft focus:outline-none text-sm text-heading transition-colors ${
    err ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'
  }`;

/* ─── component ─────────────────────────────────────────────── */
export const RegisterPage: React.FC = () => {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<'USER' | 'STORE_OWNER'>(
    params.get('tab') === 'store' ? 'STORE_OWNER' : 'USER'
  );
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // ── Normal-user fields ──────────────────────────
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [address,  setAddress]  = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // ── Store-owner fields ─────────────────────────
  const [ownerName,    setOwnerName]    = useState('');
  const [ownerEmail,   setOwnerEmail]   = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [storePass,    setStorePass]    = useState('');
  const [showStorePass, setShowStorePass] = useState(false);
  const [storeName,    setStoreName]    = useState('');
  const [storeEmail,   setStoreEmail]   = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  // Reset state on tab switch
  useEffect(() => {
    setFieldErrors({});
    setError('');
    setSuccess(false);
  }, [tab]);

  /* ── submit ─────────────────────────────────── */
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = validateUser({ name, email, address, password });
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, address, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStoreOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = validateStoreOwner({
      ownerName, ownerEmail, ownerAddress, password: storePass,
      storeName, storeEmail, storeAddress,
    });
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await api.post('/auth/register/store-owner', {
        ownerName, ownerEmail, ownerAddress, password: storePass,
        storeName, storeEmail, storeAddress,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login?tab=store'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0ECFC] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-[680px] bg-surface rounded-card shadow-xl border border-border/20 overflow-hidden">

        {/* Header */}
        <div className="bg-background border-b border-border/20 px-8 py-6 flex flex-col items-center gap-3">
          <Logo />
          <h1 className="text-2xl font-extrabold text-heading">Create your account</h1>
          <p className="text-xs text-muted font-semibold">Join TrustRate and start making trusted connections.</p>

          {/* Tab toggle */}
          <div className="bg-surface-soft p-1 rounded-full border border-border flex w-full max-w-xs mt-1">
            <button
              type="button"
              onClick={() => setTab('USER')}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                tab === 'USER'
                  ? 'bg-surface shadow-sm border-b-2 border-primary text-primary'
                  : 'text-muted hover:text-body'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Normal User
            </button>
            <button
              type="button"
              onClick={() => setTab('STORE_OWNER')}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                tab === 'STORE_OWNER'
                  ? 'bg-surface shadow-sm border-b-2 border-primary text-primary'
                  : 'text-muted hover:text-body'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Store Owner
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Success banner */}
          {success && (
            <div className="mb-6 p-4 bg-success/10 text-success rounded-btn text-sm font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {tab === 'USER'
                ? 'Account created! Redirecting to login…'
                : 'Store account created! Redirecting to login…'}
            </div>
          )}

          {/* Global error */}
          {error && (
            <div className="mb-4 p-3 bg-danger/10 text-danger rounded-btn text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* ═══ NORMAL USER FORM ════════════════════════════════ */}
          {tab === 'USER' && !success && (
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <Field label="Full Name (5–60 chars)" icon={<User className="w-4 h-4" />} error={fieldErrors.name}>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className={inputCls(fieldErrors.name)}
                  placeholder="e.g. Christopher William Miller"
                />
              </Field>

              <Field label="Email Address" icon={<Mail className="w-4 h-4" />} error={fieldErrors.email}>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className={inputCls(fieldErrors.email)}
                  placeholder="e.g. chris@example.com"
                />
              </Field>

              <Field label="Physical Address (max 400 chars)" icon={<MapPin className="w-4 h-4" />} error={fieldErrors.address}>
                <textarea
                  required rows={2} value={address} onChange={e => setAddress(e.target.value)}
                  className={inputCls(fieldErrors.address) + ' resize-none'}
                  placeholder="e.g. 500 Shopping Plaza Ave, Chicago, IL"
                />
              </Field>

              <Field label="Password (8–16 chars, uppercase + special)" icon={<Lock className="w-4 h-4" />} error={fieldErrors.password}>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputCls(fieldErrors.password) + ' pl-9 pr-10'}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body focus:outline-none">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <Button type="submit" variant="primary" className="w-full py-3 mt-2 flex items-center justify-center gap-2" disabled={loading}>
                {loading ? 'Creating account…' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>
          )}

          {/* ═══ STORE OWNER FORM ════════════════════════════════ */}
          {tab === 'STORE_OWNER' && !success && (
            <form onSubmit={handleSubmitStoreOwner} className="space-y-5">

              {/* Owner section */}
              <div className="rounded-card border border-border/40 p-4 space-y-4 bg-surface-soft/40">
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Your Account Details
                </h3>

                <Field label="Your Full Name (5–60 chars)" error={fieldErrors.ownerName}>
                  <input
                    type="text" required value={ownerName} onChange={e => setOwnerName(e.target.value)}
                    className={inputCls(fieldErrors.ownerName)}
                    placeholder="e.g. Johnathan Alexander Smith"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Your Email" error={fieldErrors.ownerEmail}>
                    <input
                      type="email" required value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)}
                      className={inputCls(fieldErrors.ownerEmail)}
                      placeholder="john@example.com"
                    />
                  </Field>

                  <Field label="Password (8–16 chars)" error={fieldErrors.password}>
                    <div className="relative">
                      <input
                        type={showStorePass ? 'text' : 'password'} required value={storePass}
                        onChange={e => setStorePass(e.target.value)}
                        className={inputCls(fieldErrors.password) + ' pr-10'}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowStorePass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body focus:outline-none">
                        {showStorePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
                </div>

                <Field label="Your Address (max 400 chars)" error={fieldErrors.ownerAddress}>
                  <textarea
                    required rows={2} value={ownerAddress} onChange={e => setOwnerAddress(e.target.value)}
                    className={inputCls(fieldErrors.ownerAddress) + ' resize-none'}
                    placeholder="e.g. 200 Commercial Blvd, New York, NY"
                  />
                </Field>
              </div>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-border/60" />
                <span className="mx-3 text-[10px] font-bold text-muted uppercase tracking-widest bg-surface px-2">
                  Store Information
                </span>
                <div className="flex-grow border-t border-border/60" />
              </div>

              {/* Store section */}
              <div className="rounded-card border border-primary/20 p-4 space-y-4 bg-primary/5">
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> Your Store Details
                </h3>

                <Field label="Store Name (5–60 chars)" error={fieldErrors.storeName}>
                  <input
                    type="text" required value={storeName} onChange={e => setStoreName(e.target.value)}
                    className={inputCls(fieldErrors.storeName)}
                    placeholder="e.g. Sunshine Grocery Market Store"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Store Contact Email" error={fieldErrors.storeEmail}>
                    <input
                      type="email" required value={storeEmail} onChange={e => setStoreEmail(e.target.value)}
                      className={inputCls(fieldErrors.storeEmail)}
                      placeholder="contact@mystore.com"
                    />
                  </Field>

                  <Field label="Store Address" error={fieldErrors.storeAddress}>
                    <input
                      type="text" required value={storeAddress} onChange={e => setStoreAddress(e.target.value)}
                      className={inputCls(fieldErrors.storeAddress)}
                      placeholder="500 Shopping Plaza Ave, Chicago, IL"
                    />
                  </Field>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
                {loading ? 'Creating store account…' : <><Store className="w-4 h-4" /><span>Create Store Owner Account</span><ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-muted border-t border-border/30 pt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
