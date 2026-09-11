import React, { useEffect, useRef } from 'react';
import { useCalculator } from '../contexts/CalculatorContext.jsx';
import { calculateSGPA } from '../utils/calculatorEngine.js';
import {
  Layers,
  Plus,
  Trash2,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Award,
  FileSpreadsheet,
  CheckCircle2,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { handleGridKeyDown } from '../utils/keyboardNav.js';

// Helper to get grade badge styling & label based on SGPA
function getGradeStatus(sgpaVal) {
  const score = parseFloat(sgpaVal);
  if (!score || isNaN(score) || score <= 0) {
    return { label: 'Pending', color: 'bg-slate-100 text-slate-500 border-slate-200' };
  }
  if (score >= 9.0) {
    return { label: 'O (Outstanding)', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' };
  }
  if (score >= 8.0) {
    return { label: 'E (Excellent)', color: 'bg-indigo-50 text-indigo-700 border-indigo-300' };
  }
  if (score >= 7.0) {
    return { label: 'A (Very Good)', color: 'bg-blue-50 text-blue-700 border-blue-300' };
  }
  if (score >= 6.0) {
    return { label: 'B (Good)', color: 'bg-amber-50 text-amber-700 border-amber-300' };
  }
  if (score >= 5.0) {
    return { label: 'C (Average)', color: 'bg-orange-50 text-orange-700 border-orange-300' };
  }
  return { label: 'F (Reappear)', color: 'bg-rose-50 text-rose-700 border-rose-300' };
}

// Helper to get Degree Honors Classification
function getDegreeHonors(cgpa) {
  if (!cgpa || cgpa <= 0) return { title: 'Not Evaluated', badge: 'bg-slate-100 text-slate-600' };
  if (cgpa >= 8.5) return { title: 'First Class with Distinction (Honors)', badge: 'bg-emerald-500 text-white shadow-emerald-500/20' };
  if (cgpa >= 7.5) return { title: 'First Class with Honors', badge: 'bg-indigo-600 text-white shadow-indigo-500/20' };
  if (cgpa >= 6.5) return { title: 'First Class', badge: 'bg-blue-600 text-white' };
  if (cgpa >= 5.0) return { title: 'Second Class', badge: 'bg-amber-500 text-white' };
  return { title: 'Pass Division', badge: 'bg-slate-600 text-white' };
}

export default function CumulativeMatrixTable() {
  const {
    semesters,
    updateSemesterOverview,
    addSemester,
    deleteSemester,
    clearAllData
  } = useCalculator();

  const confettiFired = useRef(false);

  // Map all current semesters to matrix table rows (unrestricted dynamic length!)
  const allSemesters = semesters.map((sem, idx) => {
    const semName = sem.name || `${idx + 1}th Semester`;
    const shortName = semName.replace(' Semester', '');
    const calc = calculateSGPA(sem.subjects || [], sem);

    const creditsVal = sem.credits !== undefined && sem.credits !== null && sem.credits !== ''
      ? sem.credits
      : (calc.totalCredits > 0 ? String(calc.totalCredits) : '');

    const sgpaVal = sem.sgpa !== undefined && sem.sgpa !== null && sem.sgpa !== ''
      ? sem.sgpa
      : (calc.sgpa > 0 ? String(calc.sgpa) : '');

    return {
      id: sem.id,
      name: shortName,
      fullName: semName,
      creditsVal: creditsVal,
      sgpaVal: sgpaVal,
      hasSubjects: sem.subjects && sem.subjects.length > 0
    };
  });

  // Calculate progressive cumulative CGPA trajectory matching Image 1 formula
  let runningTotalCredits = 0;
  let runningTotalPoints = 0;
  let prevCGPA = 0;

  const matrixData = allSemesters.map((sem) => {
    const cred = parseFloat(sem.creditsVal) || 0;
    const sgpa = parseFloat(sem.sgpaVal) || 0;

    let currentCGPA = 0;
    if (cred > 0 && sgpa > 0) {
      runningTotalCredits += cred;
      runningTotalPoints += cred * sgpa;
      currentCGPA = Number((runningTotalPoints / runningTotalCredits).toFixed(2));
    }

    // Determine trend arrow comparing with previous semester CGPA
    let trend = 'same';
    let trendDiff = 0;
    if (currentCGPA > 0 && prevCGPA > 0) {
      const diff = currentCGPA - prevCGPA;
      if (diff > 0.005) {
        trend = 'up';
        trendDiff = diff;
      } else if (diff < -0.005) {
        trend = 'down';
        trendDiff = Math.abs(diff);
      }
    }

    if (currentCGPA > 0) {
      prevCGPA = currentCGPA;
    }

    return {
      ...sem,
      currentCGPA,
      cgpaDisplay: currentCGPA > 0 ? currentCGPA.toFixed(2) : '-',
      trend,
      trendDiff: trendDiff.toFixed(2)
    };
  });

  const finalTotalCredits = runningTotalCredits;
  const finalCGPA = prevCGPA;
  const honorsInfo = getDegreeHonors(finalCGPA);

  // Trigger celebration confetti for distinction CGPA (>= 8.5)
  useEffect(() => {
    if (finalCGPA >= 8.5 && !confettiFired.current) {
      confettiFired.current = true;
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Ignore if confetti fails
      }
    } else if (finalCGPA < 8.5) {
      confettiFired.current = false;
    }
  }, [finalCGPA]);

  // Quick Preset Helper: Fill standard B.Tech credits (22 credits/sem)
  const handleQuickFillPreset = () => {
    semesters.forEach((sem) => {
      if (!sem.credits || sem.credits === '') {
        updateSemesterOverview(sem.id, 'credits', '22');
      }
    });
  };

  return (
    <div className="glass-panel p-6 border border-slate-200/80 shadow-xl space-y-6 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        
        {/* Title & Description */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Cumulative Semester Performance Matrix
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                Live Trajectory
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Progressive semester credits, SGPA & cumulative CGPA trajectory calculation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Preset Button */}
          <button
            onClick={handleQuickFillPreset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors shadow-sm"
            title="Auto-fill default 22 credits per semester"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Preset 22 Cred/Sem</span>
          </button>

          {/* Add Semester */}
          <button
            onClick={addSemester}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Semester</span>
          </button>

          {/* Clear All Data */}
          <button
            onClick={() => {
              if (window.confirm('Clear all semester matrix data and reset inputs?')) clearAllData();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Matrix</span>
          </button>

          {/* Excel Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel Formula Ready</span>
          </div>
        </div>

      </div>

      {/* Redesigned Matrix Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="w-full text-left border-collapse min-w-[700px]">
            
            {/* Ultra-Sleek Dark Slate / Indigo Header */}
            <thead>
              <tr className="glass-header text-white font-extrabold text-xs uppercase tracking-wider">
                <th className="py-4 px-5 w-2/12">Semester</th>
                <th className="py-4 px-4 w-2/12 text-center">Credits</th>
                <th className="py-4 px-4 w-2/12 text-center">SGPA</th>
                <th className="py-4 px-4 w-3/12 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Cumulative CGPA</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                </th>
                <th className="py-4 px-4 w-2/12 text-center">Grade Rating</th>
                <th className="py-4 px-3 w-1/12 text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-800 bg-white">
              {matrixData.map((row, index) => {
                const status = getGradeStatus(row.sgpaVal);
                const sgpaNum = parseFloat(row.sgpaVal);

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Semester Name */}
                    <td className="py-3.5 px-5 font-extrabold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                          {row.name.replace(/\D/g, '') || '#'}
                        </div>
                        <span>{row.name}</span>
                      </div>
                    </td>

                    {/* Credits Input */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="text"
                        inputMode="decimal"
                        data-grid-id={`matrix-grid-${index}-0`}
                        onKeyDown={(e) => handleGridKeyDown(e, index, 0, matrixData.length, 2, 'matrix-grid', addSemester)}
                        placeholder="e.g. 22"
                        value={row.creditsVal}
                        onChange={(e) => updateSemesterOverview(row.id, 'credits', e.target.value)}
                        className="w-24 text-center px-3 py-1.5 rounded-xl glass-input font-bold text-slate-900 text-sm"
                      />
                    </td>

                    {/* SGPA Input */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="text"
                        inputMode="decimal"
                        data-grid-id={`matrix-grid-${index}-1`}
                        onKeyDown={(e) => handleGridKeyDown(e, index, 1, matrixData.length, 2, 'matrix-grid', addSemester)}
                        placeholder="e.g. 8.5"
                        value={row.sgpaVal}
                        onChange={(e) => updateSemesterOverview(row.id, 'sgpa', e.target.value)}
                        className={`w-28 text-center px-3 py-1.5 rounded-xl glass-input font-black text-sm ${
                          sgpaNum >= 9.0
                            ? 'text-emerald-600 font-black'
                            : sgpaNum >= 8.0
                            ? 'text-indigo-600 font-black'
                            : sgpaNum >= 7.0
                            ? 'text-blue-600 font-black'
                            : sgpaNum >= 6.0
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-900 font-bold'
                        }`}
                      />
                    </td>

                    {/* Progressive Cumulative CGPA & Trajectory Arrow */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-base font-black text-slate-900">
                          {row.cgpaDisplay}
                        </span>

                        {/* Trend Arrow */}
                        {row.trend === 'up' && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <TrendingUp className="w-3 h-3" />
                            <span>+{row.trendDiff}</span>
                          </span>
                        )}
                        {row.trend === 'down' && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <TrendingDown className="w-3 h-3" />
                            <span>-{row.trendDiff}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Performance Grade Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>

                    {/* Delete Action Button */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => deleteSemester(row.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-80 group-hover:opacity-100"
                        title={`Delete ${row.fullName}`}
                        disabled={matrixData.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* Redesigned Premium Metric Summary Cards (Replacing old green block) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        
        {/* 1. Total Earned Credits Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <span className="text-xs font-extrabold uppercase text-indigo-300 tracking-wider block mb-1">
              Cumulative Credits Earned
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-white">
                {finalTotalCredits > 0 ? finalTotalCredits : 0}
              </span>
              <span className="text-xs font-semibold text-indigo-200">
                Credits
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-indigo-800/60 relative z-10 flex items-center justify-between text-xs text-indigo-200">
            <span>Completed Semesters:</span>
            <span className="font-bold text-white">
              {matrixData.filter(s => parseFloat(s.creditsVal) > 0).length} of {matrixData.length}
            </span>
          </div>

          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
        </div>

        {/* 2. Overall CGPA Showcase Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between animate-pulse-subtle">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-indigo-100 tracking-wider">
                Overall Cumulative CGPA
              </span>
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black text-white tracking-tight">
                {finalCGPA > 0 ? finalCGPA.toFixed(2) : '0.00'}
              </span>
              <span className="text-sm font-bold text-indigo-100">
                / 10.0
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 relative z-10 flex items-center justify-between text-xs font-medium text-indigo-100">
            <span>Percentage Equivalent:</span>
            <span className="font-extrabold text-white text-sm">
              {finalCGPA > 0 ? `${((finalCGPA - 0.5) * 10).toFixed(1)}%` : '0.0%'}
            </span>
          </div>

          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* 3. Degree Honors & Classification Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Academic Standing & Division
            </span>
            
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-md ${honorsInfo.badge}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{honorsInfo.title}</span>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Minimum Pass standard:</span>
            <span className="font-bold text-slate-800">5.0 CGPA</span>
          </div>
        </div>

      </div>

    </div>
  );
}
