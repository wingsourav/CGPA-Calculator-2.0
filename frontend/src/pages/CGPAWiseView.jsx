import React from 'react';
import { Sparkles, Save, Layers, Award, CheckCircle2, TrendingUp, ShieldCheck, Briefcase } from 'lucide-react';
import { useCalculator } from '../contexts/CalculatorContext.jsx';
import { calculateSGPA } from '../utils/calculatorEngine.js';
import CumulativeMatrixTable from '../components/CumulativeMatrixTable.jsx';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function CGPAWiseView() {
  const { studentType, cgpaResult, saveChanges, hasUnsavedChanges, semesters } = useCalculator();

  // Prepare chart dataset comparing SGPA vs progressive CGPA per semester
  let accumCredits = 0;
  let accumPoints = 0;
  let prevCGPA = 0;

  const chartData = semesters.map((sem, idx) => {
    const calc = calculateSGPA(sem.subjects || [], sem);
    const cred = sem.credits !== undefined && sem.credits !== ''
      ? parseFloat(sem.credits)
      : calc.totalCredits;
    const sgpa = sem.sgpa !== undefined && sem.sgpa !== ''
      ? parseFloat(sem.sgpa)
      : calc.sgpa;

    if (cred > 0 && sgpa > 0) {
      accumCredits += cred;
      accumPoints += cred * sgpa;
      prevCGPA = Number((accumPoints / accumCredits).toFixed(2));
    }

    return {
      name: sem.name ? sem.name.replace(' Semester', '') : `Sem ${idx + 1}`,
      SGPA: sgpa > 0 ? sgpa : null,
      CGPA: prevCGPA > 0 ? prevCGPA : null
    };
  }).filter(d => d.SGPA !== null || d.CGPA !== null);

  const finalCGPA = cgpaResult.cgpa || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Cumulative Academic CGPA Matrix</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            CGPA-Wise Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Progressive semester credits, SGPA & cumulative trajectory for <strong className="capitalize text-indigo-600">{studentType}</strong> stream
          </p>
        </div>

        {/* Action Controls */}
        <button
          onClick={saveChanges}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 ${
            hasUnsavedChanges
              ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{hasUnsavedChanges ? 'Save Unsaved Changes' : 'Marksheet Saved'}</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Overall CGPA */}
        <div className="glass-panel p-5 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white border-indigo-200/80 shadow-md">
          <span className="text-xs font-extrabold uppercase text-indigo-600 block mb-1">
            Overall CGPA
          </span>
          <div className="text-4xl font-black text-slate-900">
            {cgpaResult.cgpa > 0 ? cgpaResult.cgpa.toFixed(2) : '-'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-medium">
            Cumulative weighted score
          </span>
        </div>

        {/* Total Earned Credits */}
        <div className="glass-panel p-5 bg-white border border-slate-200/80 shadow-md">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Total Earned Credits
          </span>
          <div className="text-3xl font-black text-slate-900">
            {cgpaResult.totalCredits > 0 ? cgpaResult.totalCredits : '-'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-medium">Accumulated Credits</span>
        </div>

        {/* Total Grade Points */}
        <div className="glass-panel p-5 bg-white border border-slate-200/80 shadow-md">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Total Grade Points
          </span>
          <div className="text-3xl font-black text-slate-900">
            {cgpaResult.totalPoints > 0 ? cgpaResult.totalPoints : '-'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-medium">Σ (Credit × Grade Pt)</span>
        </div>

        {/* Placement Cutoff Status */}
        <div className="glass-panel p-5 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-emerald-700 block">
                Placement Tier
              </span>
              <Briefcase className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-black text-slate-900 mt-1">
              {finalCGPA >= 8.0 ? 'Tier-1 Product Cos.' : finalCGPA >= 7.0 ? 'Tier-2 IT & Core' : finalCGPA >= 6.0 ? 'Mass Recruiters' : 'Standard'}
            </div>
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block mt-2">
            {finalCGPA >= 8.0 ? 'Eligible for 100% Companies' : finalCGPA >= 7.0 ? 'Eligible for 85%+ Companies' : 'Basic Cutoff Eligible'}
          </span>
        </div>
      </div>

      {/* Trajectory Area Chart Section (Visual Trend Graph) */}
      {chartData.length > 0 && (
        <div className="glass-panel p-6 bg-white border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Semester Academic Trajectory Curve
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Semester SGPA vs Progressive Cumulative CGPA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                <span className="text-slate-700">SGPA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                <span className="text-slate-700">Cumulative CGPA</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 10]} stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="SGPA" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#sgpaGrad)" />
                <Area type="monotone" dataKey="CGPA" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#cgpaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Redesigned Primary Cumulative Matrix Table */}
      <CumulativeMatrixTable />

    </div>
  );
}
