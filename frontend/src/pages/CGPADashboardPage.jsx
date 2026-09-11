import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Calculator,
  TrendingUp,
  Layers,
  HelpCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useCalculator } from '../contexts/CalculatorContext.jsx';

export default function CGPADashboardPage() {
  const { cgpaResult, studentType, scaleType } = useCalculator();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          <Award className="w-4 h-4" />
          <span>Cumulative Grade Point Average</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          CGPA Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Credit-weighted CGPA calculated strictly using university weighted average logic
        </p>
      </div>

      {/* Hero Result Banner */}
      <div className="glass-panel p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 grid md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Overall Academic Status • <span className="capitalize">{studentType}</span> Stream
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Cumulative CGPA Report
            </h2>
            <p className="text-sm text-indigo-100 max-w-xl">
              Weighted average derived from {cgpaResult.completedSemestersCount} completed semester(s) with a total of {cgpaResult.totalCredits} earned credits.
            </p>
          </div>

          {/* Big Visual Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 shadow-inner">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200 block mb-1">
              Overall CGPA
            </span>
            <div className="text-5xl font-black tracking-tight drop-shadow-md">
              {cgpaResult.cgpa.toFixed(2)}
            </div>
            <span className="text-xs text-indigo-200 mt-1 block">
              Out of 10.00 Max
            </span>
          </div>

        </div>
      </div>

      {/* Explanation Banner: Why Credit-Weighted CGPA Matters */}
      <div className="glass-panel p-6 border-l-4 border-l-indigo-500 flex items-start space-x-4">
        <HelpCircle className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Why We Use Credit-Weighted CGPA (Not Simple Averaging):
          </p>
          <p>
            Semesters often have varying total credit counts (e.g., Sem 1: 22 credits vs Sem 3: 23 credits). Simple averaging ignores credit weightage. Our engine uses the exact formula:
          </p>
          <p className="font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold inline-block my-1">
            CGPA = Σ(SGPA × Semester Credits) / Σ(Total Semester Credits)
          </p>
        </div>
      </div>

      {/* Semester Breakdown Table */}
      <div className="glass-panel overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Semester-wise CGPA Breakdown
          </h3>
          <Link
            to="/calculator"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Edit Semesters</span>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4 text-center">Semester Credits</th>
                <th className="py-3 px-4 text-center">Semester SGPA</th>
                <th className="py-3 px-4 text-center">Earned Points (Credit × SGPA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {cgpaResult.semesterSummaries.map((sem) => (
                <tr key={sem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {sem.name}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-300">
                    {sem.credits}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                    {sem.sgpa.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {sem.points.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50/70 dark:bg-indigo-950/50 font-bold text-sm text-slate-900 dark:text-white border-t-2 border-indigo-200 dark:border-indigo-800">
                <td className="py-4 px-4 text-right uppercase text-xs">Total Academic Cumulative:</td>
                <td className="py-4 px-4 text-center text-base">{cgpaResult.totalCredits} Credits</td>
                <td className="py-4 px-4 text-center text-lg font-black text-indigo-600 dark:text-indigo-400">
                  CGPA: {cgpaResult.cgpa.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-center text-base font-extrabold">{cgpaResult.totalPoints} Points</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
