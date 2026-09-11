import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Calculator,
  Award,
  Target,
  BarChart3,
  FileSpreadsheet,
  CloudUpload,
  CheckCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCalculator } from '../contexts/CalculatorContext.jsx';

export default function LandingPage() {
  const { currentUser, loginWithGoogle } = useAuth();
  const { studentType, setStudentType } = useCalculator();

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Stream Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-8 shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
          <span>Supporting Diploma & General Student Grading Systems</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight mb-6">
          Calculate Your SGPA & CGPA{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 block sm:inline mt-1 sm:mt-0">
            Effortlessly & Accurately
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          A modern academic performance calculator tailored for Diploma and General university students. Analyze trends, estimate target grades, and import Excel marksheets with zero effort.
        </p>

        {/* Call-To-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-16">
          <Link
            to="/calculator"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5 shrink-0" />
            <span>Calculate SGPA</span>
          </Link>

          <Link
            to="/cgpa"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>Calculate CGPA</span>
          </Link>

          {!currentUser && (
            <button
              onClick={loginWithGoogle}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Google Sign-In</span>
            </button>
          )}
        </div>

        {/* Category Switch Cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20 text-left">
          <div
            onClick={() => setStudentType('diploma')}
            className={`p-6 rounded-2xl cursor-pointer transition-all border ${
              studentType === 'diploma'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                : 'glass-panel hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Stream 01</span>
              {studentType === 'diploma' && <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Diploma Students</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Supports lateral entry (3rd to 8th semesters) & standard 5-semester diploma course structures.
            </p>
          </div>

          <div
            onClick={() => setStudentType('general')}
            className={`p-6 rounded-2xl cursor-pointer transition-all border ${
              studentType === 'general'
                ? 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                : 'glass-panel hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Stream 02</span>
              {studentType === 'general' && <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">General Students</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Supports standard 4-year degree programs (1st through 8th semesters) with credit-weighted CGPA.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            Everything You Need for Academic Excellence
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Engineered with strict mathematical accuracy matching university grading systems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1 */}
          <div className="glass-panel p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dynamic SGPA Calculator</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Add, edit, duplicate, or delete subjects dynamically. Real-time calculations with credit-point multiplication.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Credit-Weighted CGPA</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculates CGPA using exact credit weightage across semesters rather than naive SGPA averaging.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Target CGPA Estimator</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Input your desired target CGPA to instantly know the exact SGPA required in your upcoming semester.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Visual Performance Analytics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Interactive trend charts for SGPA, credit distributions, grade breakdowns, and min/max semester statistics.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excel Import & Export</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload existing spreadsheet marksheets to parse grades automatically or download a formatted `.xlsx` report.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shrink-0">
              <CloudUpload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Firebase Cloud Sync</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Securely sign in with Google to save your calculation history safely across devices via Firestore.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 GradeCalc 2.0. Built with React, Node.js, and Firebase.</p>
      </footer>

    </div>
  );
}
