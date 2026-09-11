import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calculator,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useCalculator } from '../contexts/CalculatorContext.jsx';
import { calculateTargetSGPA } from '../utils/calculatorEngine.js';

export default function TargetCalculatorPage() {
  const { cgpaResult } = useCalculator();

  const [currentCGPA, setCurrentCGPA] = useState(cgpaResult.cgpa || 8.0);
  const [completedCredits, setCompletedCredits] = useState(cgpaResult.totalCredits || 60);
  const [targetCGPA, setTargetCGPA] = useState(8.5);
  const [upcomingCredits, setUpcomingCredits] = useState(20);

  const result = calculateTargetSGPA({
    currentCGPA,
    completedCredits,
    targetCGPA,
    upcomingCredits
  });

  const getStatusBadgeClass = () => {
    switch (result.status) {
      case 'Achieved':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800';
      case 'Achievable':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800';
      case 'Challenging':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800';
      case 'Impossible':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-1">
          <Target className="w-4 h-4" />
          <span>Predictive Academic Planning</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Target CGPA Estimator
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculate the exact SGPA required in your upcoming semester to achieve your dream CGPA
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Inputs Column */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-5 border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>Input Academic Parameters</span>
            <span className="text-xs text-indigo-500 font-medium">Auto-populates from dashboard</span>
          </h3>

          {/* Current CGPA */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Current CGPA
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={currentCGPA}
              onChange={(e) => setCurrentCGPA(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-bold"
            />
          </div>

          {/* Completed Credits */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Completed Credits
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={completedCredits}
              onChange={(e) => setCompletedCredits(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-bold"
            />
          </div>

          {/* Target CGPA */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Desired Target CGPA
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={targetCGPA}
              onChange={(e) => setTargetCGPA(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-bold text-indigo-600 dark:text-indigo-400"
            />
          </div>

          {/* Upcoming Semester Credits */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Upcoming Semester Credits
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={upcomingCredits}
              onChange={(e) => setUpcomingCredits(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        {/* Estimation Output Card */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel p-8 space-y-6 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Calculation Result
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Required SGPA in Next Semester
                </h3>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${getStatusBadgeClass()}`}>
                {result.status}
              </div>
            </div>

            {/* Giant Required SGPA Number */}
            <div className="text-center py-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Required Upcoming SGPA
              </span>
              <div className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                {result.requiredSGPA.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {result.message}
              </p>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>0.00 (Min)</span>
                <span>5.00</span>
                <span>8.00</span>
                <span>10.00 (Max)</span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    result.requiredSGPA > 10
                      ? 'bg-rose-500'
                      : result.requiredSGPA > 8
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (result.requiredSGPA / 10) * 100))}%`
                  }}
                />
              </div>
            </div>

          </div>

          {/* Mathematical Formula Explanation Card */}
          <div className="glass-panel p-6 border-l-4 border-l-purple-500 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Target SGPA Formula Applied</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              The required SGPA is derived strictly by setting up the credit-weighted equation:
            </p>
            <p className="font-mono text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-slate-800 dark:text-slate-200 overflow-x-auto my-2">
              Req SGPA = [ Target CGPA × (Completed Credits + Upcoming Credits) - Current CGPA × Completed Credits ] / Upcoming Credits
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
