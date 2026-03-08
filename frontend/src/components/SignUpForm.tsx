import { useState, type FormEvent } from 'react';
import { signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Stethoscope, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type Role = 'DOCTOR' | 'PATIENT' | '';
type Step = 'form' | 'confirm' | 'success';

interface Props {
  onSwitchToSignIn: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

function InputField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = true,
  children,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children ?? (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all
            ${error
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
              : 'border-slate-200 bg-white focus:border-[#196ee6] focus:ring-2 focus:ring-[#196ee6]/20'
            }`}
        />
      )}
      <FieldError msg={error} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SignUpForm({ onSwitchToSignIn }: Props) {
  // Step state
  const [step, setStep] = useState<Step>('form');
  const [pendingEmail, setPendingEmail] = useState('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('');
  const [specialization, setSpecialization] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Confirmation step
  const [code, setCode] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Enter a valid email address';
    if (phone && !/^\+?[1-9]\d{6,14}$/.test(phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid phone number (e.g. +919876543210)';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) e.password = 'Password must include an uppercase letter';
    if (!/[0-9]/.test(password)) e.password = (e.password ? e.password + ' & ' : '') + 'a digit';
    if (!/[^A-Za-z0-9]/.test(password)) e.password = 'Password must include a special character';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!role) e.role = 'Please select a role';
    if (role === 'DOCTOR' && !specialization.trim())
      e.specialization = 'Specialization is required for doctors';
    if (role === 'PATIENT' && !dateOfBirth)
      e.dateOfBirth = 'Date of birth is required for patients';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Sign-up handler ─────────────────────────────────────────────────────────

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const userAttributes: Record<string, string> = {
        given_name: firstName.trim(),
        family_name: lastName.trim(),
        'custom:role': role,
      };
      if (phone.trim()) userAttributes.phone_number = phone.trim().replace(/\s/g, '');
      if (role === 'DOCTOR') userAttributes['custom:specialization'] = specialization.trim();
      if (role === 'PATIENT') userAttributes.birthdate = dateOfBirth; // YYYY-MM-DD

      await signUp({
        username: email.trim().toLowerCase(),
        password,
        options: { userAttributes },
      });

      setPendingEmail(email.trim().toLowerCase());
      setStep('confirm');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Confirmation handler ────────────────────────────────────────────────────

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setGlobalError('');
    if (!code.trim()) { setErrors({ code: 'Enter the verification code' }); return; }

    setLoading(true);
    try {
      await confirmSignUp({ username: pendingEmail, confirmationCode: code.trim() });
      setStep('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid code. Please try again.';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendStatus('sending');
    try {
      await resendSignUpCode({ username: pendingEmail });
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 4000);
    } catch {
      setResendStatus('idle');
    }
  }

  // ── Render: Success ─────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-8 px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle size={36} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Account created!</h2>
          <p className="text-slate-500 text-sm mt-1">
            Your account has been confirmed. Sign in to get started.
          </p>
        </div>
        <button
          onClick={onSwitchToSignIn}
          className="w-full max-w-xs py-3 rounded-xl bg-[#196ee6] text-white font-semibold text-sm hover:bg-[#1557c0] transition-colors"
        >
          Sign in to Swarksha
        </button>
      </div>
    );
  }

  // ── Render: Confirmation code ───────────────────────────────────────────────

  if (step === 'confirm') {
    return (
      <form onSubmit={handleConfirm} className="space-y-5 px-1">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
          <p className="text-slate-500 text-sm mt-1">
            We sent a 6-digit code to <span className="font-medium text-slate-700">{pendingEmail}</span>
          </p>
        </div>

        {globalError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="shrink-0" />
            {globalError}
          </div>
        )}

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">
            Verification Code <span className="text-red-400">*</span>
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className={`w-full px-3 py-3 rounded-xl border text-center text-xl font-mono tracking-widest outline-none transition-all
              ${errors.code
                ? 'border-red-400 bg-red-50'
                : 'border-slate-200 bg-white focus:border-[#196ee6] focus:ring-2 focus:ring-[#196ee6]/20'
              }`}
          />
          <FieldError msg={errors.code} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#196ee6] text-white font-semibold text-sm hover:bg-[#1557c0] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Confirm Account
        </button>

        <div className="text-center text-sm text-slate-500">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus !== 'idle'}
            className="text-[#196ee6] font-medium hover:underline disabled:opacity-50"
          >
            {resendStatus === 'sending' ? 'Sending…' : resendStatus === 'sent' ? 'Sent!' : 'Resend'}
          </button>
        </div>

        <div className="text-center text-sm text-slate-500">
          <button type="button" onClick={onSwitchToSignIn} className="text-[#196ee6] font-medium hover:underline">
            Back to sign in
          </button>
        </div>
      </form>
    );
  }

  // ── Render: Sign-up form (Step 1) ───────────────────────────────────────────

  return (
    <form onSubmit={handleSignUp} className="space-y-4 px-1">
      <div className="flex flex-col items-center pb-1">
        <div className="flex md:hidden items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#196ee6] flex items-center justify-center shadow-md">
            <Stethoscope size={20} color="white" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-tight">Swarksha</p>
            <p className="text-[11px] text-slate-400 leading-tight">AI Clinical Documentation</p>
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
        <p className="text-slate-500 text-sm mt-1 text-center">Join Swarksha to get started</p>
        <div className="w-10 h-0.5 bg-[#196ee6]/30 rounded-full mt-3" />
      </div>

      {globalError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          {globalError}
        </div>
      )}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <InputField label="First name" id="firstName" value={firstName} onChange={setFirstName} error={errors.firstName} placeholder="Priya" />
        <InputField label="Last name" id="lastName" value={lastName} onChange={setLastName} error={errors.lastName} placeholder="Sharma" />
      </div>

      {/* Email */}
      <InputField label="Email" id="email" type="email" value={email} onChange={setEmail} error={errors.email} placeholder="priya@hospital.com" />

      {/* Phone */}
      <InputField label="Phone number" id="phone" type="tel" value={phone} onChange={setPhone} error={errors.phone} placeholder="+91 98765 43210" required={false} />

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
          Role <span className="text-red-400">*</span>
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => { setRole(e.target.value as Role); setSpecialization(''); setDateOfBirth(''); }}
          className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white
            ${errors.role
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
              : 'border-slate-200 focus:border-[#196ee6] focus:ring-2 focus:ring-[#196ee6]/20'
            }`}
        >
          <option value="">Select your role…</option>
          <option value="DOCTOR">Doctor</option>
          <option value="PATIENT">Patient</option>
        </select>
        <FieldError msg={errors.role} />
      </div>

      {/* Conditional: Specialization (Doctor) */}
      {role === 'DOCTOR' && (
        <InputField
          label="Specialization"
          id="specialization"
          value={specialization}
          onChange={setSpecialization}
          error={errors.specialization}
          placeholder="e.g. Cardiology, General Medicine"
        />
      )}

      {/* Conditional: Date of Birth (Patient) */}
      {role === 'PATIENT' && (
        <InputField
          label="Date of Birth"
          id="dateOfBirth"
          type="date"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          error={errors.dateOfBirth}
        />
      )}

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 chars, uppercase, digit, symbol"
            className={`w-full px-3 py-2.5 pr-10 rounded-xl border text-sm outline-none transition-all
              ${errors.password
                ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                : 'border-slate-200 bg-white focus:border-[#196ee6] focus:ring-2 focus:ring-[#196ee6]/20'
              }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <FieldError msg={errors.password} />
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
          Confirm Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className={`w-full px-3 py-2.5 pr-10 rounded-xl border text-sm outline-none transition-all
              ${errors.confirmPassword
                ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                : 'border-slate-200 bg-white focus:border-[#196ee6] focus:ring-2 focus:ring-[#196ee6]/20'
              }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <FieldError msg={errors.confirmPassword} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#196ee6] text-white font-semibold text-sm hover:bg-[#1557c0] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Create Account
      </button>

      <p className="text-center text-sm text-slate-500 pb-2">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToSignIn} className="text-[#196ee6] font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
}
