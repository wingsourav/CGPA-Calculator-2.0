import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  GraduationCap,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Hash,
  BookOpen,
  Calendar,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  X,
  KeyRound,
  Check,
  Info,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

// Default Academic Options
const DEFAULT_DEGREES = [
  'B.Tech',
  'B.E.',
  'BCA',
  'MCA',
  'M.Tech',
  'B.Sc',
  'M.Sc',
  'Diploma',
  'Ph.D'
];

const DEFAULT_BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science & Artificial Intelligence',
  'Chemical Engineering',
  'Biotechnology'
];

// Local / Global Options Helpers
const getStoredDegrees = () => {
  try {
    const saved = localStorage.getItem('global_custom_degrees');
    const custom = saved ? JSON.parse(saved) : [];
    return Array.from(new Set([...DEFAULT_DEGREES, ...custom]));
  } catch {
    return DEFAULT_DEGREES;
  }
};

const getStoredBranches = () => {
  try {
    const saved = localStorage.getItem('global_custom_branches');
    const custom = saved ? JSON.parse(saved) : [];
    return Array.from(new Set([...DEFAULT_BRANCHES, ...custom]));
  } catch {
    return DEFAULT_BRANCHES;
  }
};

const saveCustomDegree = (newDeg) => {
  if (!newDeg || !newDeg.trim()) return;
  const trimmed = newDeg.trim();
  try {
    const saved = localStorage.getItem('global_custom_degrees');
    const custom = saved ? JSON.parse(saved) : [];
    if (!custom.includes(trimmed) && !DEFAULT_DEGREES.includes(trimmed)) {
      const updated = [...custom, trimmed];
      localStorage.setItem('global_custom_degrees', JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Could not save custom degree:', err);
  }
};

const saveCustomBranch = (newBranch) => {
  if (!newBranch || !newBranch.trim()) return;
  const trimmed = newBranch.trim();
  try {
    const saved = localStorage.getItem('global_custom_branches');
    const custom = saved ? JSON.parse(saved) : [];
    if (!custom.includes(trimmed) && !DEFAULT_BRANCHES.includes(trimmed)) {
      const updated = [...custom, trimmed];
      localStorage.setItem('global_custom_branches', JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Could not save custom branch:', err);
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { currentUser, loginWithGoogle, loginWithEmail, signupWithEmail, saveStudentProfile, resetPassword } = useAuth();

  // Mode: 'signup' (Create Account by default) | 'login' (Sign In)
  const [mode, setMode] = useState('signup');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic Lists for Degree & Branch (includes saved custom entries)
  const [degreeOptions, setDegreeOptions] = useState(getStoredDegrees);
  const [branchOptions, setBranchOptions] = useState(getStoredBranches);

  // Create Account Form Fields
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [customDegree, setCustomDegree] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [customBranch, setCustomBranch] = useState('');
  const [yearOfPassing, setYearOfPassing] = useState('2026');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetErr, setResetErr] = useState('');

  // Google Sign-In Profile Collection State
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleProfile, setGoogleProfile] = useState({
    name: '',
    registrationNumber: '',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    yearOfPassing: '2026',
    email: ''
  });
  const [googleCustomDegree, setGoogleCustomDegree] = useState('');
  const [googleCustomBranch, setGoogleCustomBranch] = useState('');

  // Password Strength Validator (Min 8 chars, 1 uppercase, 1 number, 1 special symbol)
  const passHasMinLength = password.length >= 8;
  const passHasUppercase = /[A-Z]/.test(password);
  const passHasNumber = /[0-9]/.test(password);
  const passHasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = passHasMinLength && passHasUppercase && passHasNumber && passHasSpecial;

  // Never redirect away if user is onboarding or modal is active
  const isProfileFullyComplete = Boolean(
    currentUser &&
    currentUser.studentProfile &&
    currentUser.studentProfile.registrationNumber &&
    currentUser.studentProfile.registrationNumber.trim() !== ''
  );

  if (isProfileFullyComplete && !showGoogleModal && !isSigningInGoogle) {
    return <Navigate to="/calculator" replace />;
  }

  const refreshOptionsList = () => {
    setDegreeOptions(getStoredDegrees());
    setBranchOptions(getStoredBranches());
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    setIsSigningInGoogle(true);
    setShowGoogleModal(true);

    try {
      const gUser = await loginWithGoogle();
      
      const existingProfile = gUser?.studentProfile || {};
      const userEmail = gUser?.email || existingProfile.email || 'student.google@university.edu';
      const userName = gUser?.displayName || existingProfile.name || '';

      setGoogleProfile({
        name: userName,
        registrationNumber: existingProfile.registrationNumber || '',
        degree: existingProfile.degree || 'B.Tech',
        branch: existingProfile.branch || 'Computer Science & Engineering',
        yearOfPassing: existingProfile.yearOfPassing || '2026',
        email: userEmail
      });
      setGoogleCustomDegree('');
      setGoogleCustomBranch('');
    } catch (err) {
      setError(err.message || 'Google sign in failed');
      setShowGoogleModal(false);
    } finally {
      setLoading(false);
      setIsSigningInGoogle(false);
    }
  };

  const handleGoogleProfileSubmit = (e) => {
    e.preventDefault();
    setError('');

    let finalDegree = googleProfile.degree;
    if (finalDegree === 'Other') {
      if (!googleCustomDegree.trim()) {
        setError('Please type your custom Degree name.');
        return;
      }
      finalDegree = googleCustomDegree.trim();
      saveCustomDegree(finalDegree);
      refreshOptionsList();
    }

    let finalBranch = googleProfile.branch;
    if (finalBranch === 'Other') {
      if (!googleCustomBranch.trim()) {
        setError('Please type your custom Branch / Department name.');
        return;
      }
      finalBranch = googleCustomBranch.trim();
      saveCustomBranch(finalBranch);
      refreshOptionsList();
    }

    if (!googleProfile.name.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!googleProfile.registrationNumber.trim()) {
      setError('Please enter your Registration / Roll Number.');
      return;
    }

    const profileToSave = {
      ...googleProfile,
      degree: finalDegree,
      branch: finalBranch
    };

    saveStudentProfile(profileToSave);
    setShowGoogleModal(false);
    navigate('/calculator');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    let finalDegree = degree;
    let finalBranch = branch;

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your Full Name.');
        return;
      }
      if (!registrationNumber.trim()) {
        setError('Please enter your Registration / Roll Number.');
        return;
      }

      if (degree === 'Other') {
        if (!customDegree.trim()) {
          setError('Please type your custom Degree name.');
          return;
        }
        finalDegree = customDegree.trim();
        saveCustomDegree(finalDegree);
        refreshOptionsList();
      }

      if (branch === 'Other') {
        if (!customBranch.trim()) {
          setError('Please type your custom Branch / Department name.');
          return;
        }
        finalBranch = customBranch.trim();
        saveCustomBranch(finalBranch);
        refreshOptionsList();
      }

      if (!isPasswordValid) {
        setError('Password must be at least 8 characters long, contain 1 capital letter, 1 number, and 1 special symbol (#,@,$,etc.).');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        if (name && registrationNumber) {
          saveStudentProfile({ name, registrationNumber, degree: finalDegree, branch: finalBranch, yearOfPassing, email });
        }
      } else {
        await signupWithEmail(email, password, name);
        saveStudentProfile({
          name,
          registrationNumber,
          degree: finalDegree,
          branch: finalBranch,
          yearOfPassing,
          email
        });
      }
      navigate('/calculator');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (e) => {
    e.preventDefault();
    setResetErr('');
    setResetMsg('');

    if (!forgotEmail.trim()) {
      setResetErr('Please enter your registered email address.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await resetPassword(forgotEmail);
      setResetMsg(res.message || `Password reset link sent to ${forgotEmail}`);
    } catch (err) {
      setResetErr(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900 transition-colors duration-300 relative overflow-hidden">
      
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[350px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login / Register Card */}
      <div className={`w-full ${mode === 'signup' ? 'max-w-xl' : 'max-w-md'} bg-white p-8 rounded-3xl shadow-2xl relative border border-slate-200 space-y-6 transition-all duration-300`}>
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg mb-2">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            GradeCalc 2.0
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Create an account or sign in to save your SGPA & CGPA academic marksheets
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Primary Action: Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || isSigningInGoogle}
          className="w-full py-3 px-4 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 transform active:scale-98 disabled:opacity-50"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>{isSigningInGoogle ? 'Connecting with Google...' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] uppercase font-extrabold text-slate-400 shrink-0">
            or use email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`w-1/2 py-2.5 rounded-xl transition-all text-center ${
              mode === 'signup'
                ? 'bg-white text-indigo-600 font-black shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`w-1/2 py-2.5 rounded-xl transition-all text-center ${
              mode === 'login'
                ? 'bg-white text-indigo-600 font-black shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* CREATE ACCOUNT TAB FIELDS */}
          {mode === 'signup' && (
            <div className="space-y-4 animate-fade-in">
              {/* Row 1: Full Name & Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Registration Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 21BCE1042"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Degree & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Degree Dropdown + Custom "Other" Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Degree <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                      {degreeOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="Other">+ Write Custom Degree (Other)</option>
                    </select>
                  </div>

                  {degree === 'Other' && (
                    <div className="pt-1.5 animate-fade-in">
                      <input
                        type="text"
                        required
                        placeholder="Type custom degree (e.g. B.Des)"
                        value={customDegree}
                        onChange={(e) => setCustomDegree(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-indigo-50/60 border border-indigo-200 text-indigo-950 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Will automatically save for all users!
                      </p>
                    </div>
                  )}
                </div>

                {/* Branch Dropdown + Custom "Other" Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Branch / Department <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                      {branchOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="Other">+ Write Custom Branch (Other)</option>
                    </select>
                  </div>

                  {branch === 'Other' && (
                    <div className="pt-1.5 animate-fade-in">
                      <input
                        type="text"
                        required
                        placeholder="Type custom branch (e.g. Aerospace Engg)"
                        value={customBranch}
                        onChange={(e) => setCustomBranch(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-indigo-50/60 border border-indigo-200 text-indigo-950 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Will automatically save for all users!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Year of Passing */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Year of Passing <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={yearOfPassing}
                    onChange={(e) => setYearOfPassing(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* COMMON FIELDS: EMAIL & PASSWORD */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                Password <span className="text-rose-500">*</span>
              </label>

              {/* SINGLE FORGOT PASSWORD LINK */}
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setResetErr('');
                  setResetMsg('');
                  setShowForgotPasswordModal(true);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Forgot Password?</span>
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                title={showPassword ? 'Hide password' : 'Preview password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* REAL-TIME PASSWORD REQUIREMENTS (FOR CREATE ACCOUNT TAB) */}
          {mode === 'signup' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5 animate-fade-in">
              <p className="font-bold text-slate-700 flex items-center gap-1 text-xs">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                Password Requirements:
              </p>
              <div className="grid grid-cols-2 gap-1.5 font-medium">
                <div className={`flex items-center gap-1.5 ${passHasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${passHasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Min 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passHasUppercase ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${passHasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>1 Capital letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passHasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${passHasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>1 Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passHasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${passHasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Special symbol (#, @, $, etc.)</span>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Register Account'}</span>
          </button>
        </form>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Reset Password</h3>
                  <p className="text-xs text-slate-500">Firebase Password Recovery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter your registered student email address below. Firebase will send you an official email with a secure link to reset your password.
            </p>

            {resetErr && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetErr}</span>
              </div>
            )}

            {resetMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{resetMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendPasswordReset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="w-1/2 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-1/2 py-2.5 px-3 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GOOGLE SIGN-IN STUDENT DETAILS ONBOARDING MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative p-6 sm:p-8 space-y-6">
            
            {/* Modal Header Banner */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Student Profile Details
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 border border-indigo-200">
                      Google Account
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Please fill out your academic info to setup your marksheets
                  </p>
                </div>
              </div>
            </div>

            {/* Error Alert inside Modal */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleGoogleProfileSubmit} className="space-y-4">
              
              {/* Row 1: Full Name & Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={googleProfile.name}
                      onChange={(e) => setGoogleProfile({ ...googleProfile, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Registration Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 21BCE1042"
                      value={googleProfile.registrationNumber}
                      onChange={(e) => setGoogleProfile({ ...googleProfile, registrationNumber: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Degree & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Degree Dropdown + Custom Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Degree <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={googleProfile.degree}
                      onChange={(e) => setGoogleProfile({ ...googleProfile, degree: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                    >
                      {degreeOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="Other">+ Write Custom Degree (Other)</option>
                    </select>
                  </div>

                  {googleProfile.degree === 'Other' && (
                    <div className="pt-1.5 animate-fade-in">
                      <input
                        type="text"
                        required
                        placeholder="Type custom degree (e.g. B.Des)"
                        value={googleCustomDegree}
                        onChange={(e) => setGoogleCustomDegree(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-indigo-50/60 border border-indigo-200 text-indigo-950 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Will automatically save for all users!
                      </p>
                    </div>
                  )}
                </div>

                {/* Branch Dropdown + Custom Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Branch / Department <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={googleProfile.branch}
                      onChange={(e) => setGoogleProfile({ ...googleProfile, branch: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                    >
                      {branchOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="Other">+ Write Custom Branch (Other)</option>
                    </select>
                  </div>

                  {googleProfile.branch === 'Other' && (
                    <div className="pt-1.5 animate-fade-in">
                      <input
                        type="text"
                        required
                        placeholder="Type custom branch (e.g. Aerospace Engg)"
                        value={googleCustomBranch}
                        onChange={(e) => setGoogleCustomBranch(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-indigo-50/60 border border-indigo-200 text-indigo-950 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Will automatically save for all users!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Year of Passing & Google Email ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Year of Passing <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={googleProfile.yearOfPassing}
                      onChange={(e) => setGoogleProfile({ ...googleProfile, yearOfPassing: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                    >
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                      <option value="2030">2030</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">
                      Google Email ID
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Google Verified
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-indigo-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={googleProfile.email}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-indigo-950 text-xs font-bold shadow-inner cursor-not-allowed select-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-98"
                >
                  <span>Complete Setup & Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
