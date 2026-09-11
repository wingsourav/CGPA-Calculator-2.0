import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  LogIn,
  Save,
  Trash2,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  Layers,
  PieChart as PieIcon,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCalculator } from '../contexts/CalculatorContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const {
    studentType,
    setStudentType,
    batchYear,
    setBatchYear,
    viewMode,
    setViewMode,
    hasUnsavedChanges,
    saveChanges,
    clearAllData,
    toastMessage
  } = useCalculator();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSemesterMenu, setShowSemesterMenu] = useState(false);
  const [showMobileSemesterMenu, setShowMobileSemesterMenu] = useState(false);

  const semesterDropdownRef = useRef(null);
  const mobileSemesterDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (semesterDropdownRef.current && !semesterDropdownRef.current.contains(event.target)) {
        setShowSemesterMenu(false);
      }
      if (mobileSemesterDropdownRef.current && !mobileSemesterDropdownRef.current.contains(event.target)) {
        setShowMobileSemesterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide Navbar completely on the Login page
  if (location.pathname === '/login') {
    return null;
  }

  const handleClearAllConfirm = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset all marks and auto-save an empty marksheet.')) {
      clearAllData();
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 space-y-2 sm:space-y-0">
          
          {/* Main Top Row: Logo, Mobile Stream Switcher, Right Controls */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent whitespace-nowrap">
                  GradeCalc 2.0
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  PRO
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs (Hidden on Mobile, shown in subrow on mobile) */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                {/* Semester-Wise Tab with Dropdown for Before 2026 / After 2026 */}
                <div className="relative flex items-center" ref={semesterDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('semester');
                      setShowSemesterMenu(prev => !prev);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-xl transition-all whitespace-nowrap cursor-pointer ${
                      viewMode === 'semester'
                        ? 'bg-indigo-600 text-white shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                    title="Switch to Semester-Wise view"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="font-black">Semester-Wise</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode('semester');
                      setShowSemesterMenu(prev => !prev);
                    }}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-r-xl border-l transition-all whitespace-nowrap cursor-pointer ${
                      viewMode === 'semester'
                        ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
                        : 'text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                    title="Select regulation: Before 2026 or After 2026"
                  >
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        viewMode === 'semester'
                          ? 'bg-indigo-700 text-white border border-indigo-500/60 shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {batchYear === 'after-2026' ? 'After 2026' : 'Before 2026'}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 stroke-[3] ${
                        showSemesterMenu ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showSemesterMenu && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white py-1.5 shadow-2xl rounded-2xl border border-slate-200 z-50 animate-fade-in text-xs font-bold text-slate-800">
                      <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        Select Regulation
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBatchYear('before-2026');
                          setViewMode('semester');
                          setShowSemesterMenu(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                          batchYear === 'before-2026'
                            ? 'bg-indigo-50 text-indigo-600 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-black text-xs">Before 2026</span>
                          <span className="text-[10px] font-medium text-slate-400">1st & 2nd Sem has E grade (9 pts)</span>
                        </div>
                        {batchYear === 'before-2026' && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBatchYear('after-2026');
                          setViewMode('semester');
                          setShowSemesterMenu(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                          batchYear === 'after-2026'
                            ? 'bg-indigo-50 text-indigo-600 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-black text-xs">After 2026</span>
                          <span className="text-[10px] font-medium text-slate-400">1st & 2nd Sem has P grade (5 pts)</span>
                        </div>
                        {batchYear === 'after-2026' && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setViewMode('cgpa'); setShowSemesterMenu(false); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    viewMode === 'cgpa'
                      ? 'bg-indigo-600 text-white shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>CGPA-Wise</span>
                </button>

                <button
                  onClick={() => { setViewMode('placement'); setShowSemesterMenu(false); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    viewMode === 'placement'
                      ? 'bg-indigo-600 text-white shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PieIcon className="w-3.5 h-3.5" />
                  <span>Placement Analytics</span>
                </button>
              </div>

              {/* Stream Switcher Pill */}
              {viewMode === 'semester' && (
                <div className="flex items-center border-l border-slate-300 pl-3 ml-1">
                  <div className="flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/80 shadow-inner">
                    <button
                      onClick={() => setStudentType('diploma')}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                        studentType === 'diploma'
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                          : 'text-indigo-400 hover:text-indigo-600 font-semibold'
                      }`}
                    >
                      Diploma
                    </button>
                    <button
                      onClick={() => setStudentType('general')}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                        studentType === 'general'
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                          : 'text-indigo-400 hover:text-indigo-600 font-semibold'
                      }`}
                    >
                      General
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Clear All Data Button */}
              <button
                onClick={handleClearAllConfirm}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                title="Clear all marks & auto-save empty marksheet"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clear All</span>
              </button>

              {/* Save Button */}
              <button
                onClick={saveChanges}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm ${
                  hasUnsavedChanges
                    ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title="Save current marks to database"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="inline">
                  {hasUnsavedChanges ? 'Save' : 'Saved'}
                </span>
              </button>

              {/* Profile Menu */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-indigo-400 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                        {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-60 bg-white py-2 shadow-2xl z-50 rounded-xl border border-slate-200 text-slate-800 animate-fade-in">
                      <div className="px-3.5 py-2 border-b border-slate-100 space-y-1">
                        <p className="text-xs font-black truncate text-slate-900">
                          {currentUser.displayName || 'Student User'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentUser.email}
                        </p>

                        {currentUser.studentProfile && (
                          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg">
                            {currentUser.studentProfile.registrationNumber && (
                              <p className="font-semibold text-slate-700">
                                <span className="text-slate-400">Reg No:</span> {currentUser.studentProfile.registrationNumber}
                              </p>
                            )}
                            {(currentUser.studentProfile.degree || currentUser.studentProfile.branch) && (
                              <p className="truncate text-indigo-600 font-bold">
                                {currentUser.studentProfile.degree} • {currentUser.studentProfile.branch}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Google Sign-In</span>
                </button>
              )}

            </div>
          </div>

          {/* Mobile Secondary Row: Full Width Scrollable Navigation Bar */}
          <div className="flex md:hidden items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 w-full text-[11px] font-bold">
              {/* Semester-Wise Dropdown on Mobile */}
              <div className="relative flex items-center shrink-0" ref={mobileSemesterDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('semester');
                    setShowMobileSemesterMenu(prev => !prev);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-l-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'semester'
                      ? 'bg-indigo-600 text-white font-black shadow-sm'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <BookOpen className="w-3 h-3 shrink-0" />
                  <span>Semester-Wise</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode('semester');
                    setShowMobileSemesterMenu(prev => !prev);
                  }}
                  className={`flex items-center gap-1 px-1.5 py-1.5 rounded-r-xl border-l transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'semester'
                      ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Select regulation"
                >
                  <span className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${
                    viewMode === 'semester' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {batchYear === 'after-2026' ? 'After 2026' : 'Before 2026'}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform stroke-[2.5] ${
                      showMobileSemesterMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showMobileSemesterMenu && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white py-1 shadow-2xl rounded-xl border border-slate-200 z-50 text-[11px] font-bold text-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setBatchYear('before-2026');
                        setViewMode('semester');
                        setShowMobileSemesterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between ${
                        batchYear === 'before-2026'
                          ? 'bg-indigo-50 text-indigo-600 font-black'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div>Before 2026</div>
                        <div className="text-[9px] font-normal text-slate-400">E grade for Sem 1 & 2</div>
                      </div>
                      {batchYear === 'before-2026' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBatchYear('after-2026');
                        setViewMode('semester');
                        setShowMobileSemesterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between ${
                        batchYear === 'after-2026'
                          ? 'bg-indigo-50 text-indigo-600 font-black'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div>After 2026</div>
                        <div className="text-[9px] font-normal text-slate-400">P grade for Sem 1 & 2</div>
                      </div>
                      {batchYear === 'after-2026' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setViewMode('cgpa'); setShowMobileSemesterMenu(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  viewMode === 'cgpa'
                    ? 'bg-indigo-600 text-white font-black shadow-sm'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>CGPA-Wise</span>
              </button>

              <button
                onClick={() => { setViewMode('placement'); setShowMobileSemesterMenu(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  viewMode === 'placement'
                    ? 'bg-indigo-600 text-white font-black shadow-sm'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <PieIcon className="w-3 h-3" />
                <span>Analytics</span>
              </button>

              {/* Stream Switcher Pill on Mobile */}
              {viewMode === 'semester' && (
                <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg shrink-0 ml-auto">
                  <button
                    onClick={() => setStudentType('diploma')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                      studentType === 'diploma' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Diploma
                  </button>
                  <button
                    onClick={() => setStudentType('general')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                      studentType === 'general' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    General
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </nav>

      {/* Floating Save Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fade-in font-bold text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
