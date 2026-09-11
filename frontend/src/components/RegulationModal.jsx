import React from 'react';
import {
  Calendar,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  X,
  BookOpen
} from 'lucide-react';
import { useCalculator } from '../contexts/CalculatorContext.jsx';

export default function RegulationModal({ isOpen, onClose }) {
  const { batchYear, setBatchYear, setShowRegulationModal } = useCalculator();

  if (!isOpen) return null;

  const handleSelect = (selectedYear) => {
    setBatchYear(selectedYear);
    setShowRegulationModal(false);
    if (onClose) onClose();
  };

  const hasAlreadyChosen = !!localStorage.getItem('batchYearChosen');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
        
        {/* Top Decorative Header Accent */}
        <div className="h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full" />

        {/* Close Button (if user has already chosen previously) */}
        {hasAlreadyChosen && (
          <button
            onClick={() => {
              setShowRegulationModal(false);
              if (onClose) onClose();
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-5 sm:p-8 space-y-6">
          
          {/* Header Title Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Academic Regulation Setup</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Select Your Regulation / Batch
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Please choose your admission period to apply the exact grading system and point scales for your semesters:
            </p>
          </div>

          {/* Cards Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Option 1: Before 2026 */}
            <div
              onClick={() => handleSelect('before-2026')}
              className={`group relative rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left hover:shadow-lg ${
                batchYear === 'before-2026'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-indigo-100 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Legacy Regulation
                  </span>
                  {batchYear === 'before-2026' && (
                    <span className="flex items-center gap-1 text-[11px] font-black text-indigo-600">
                      <CheckCircle2 className="w-4 h-4 fill-indigo-600 text-white" />
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Before 2026
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    For students enrolled prior to 2026. Semesters 1 & 2 include the <strong className="text-indigo-600 font-bold">E grade (9 pts)</strong>.
                  </p>
                </div>

                {/* Grade Scale Snapshot */}
                <div className="bg-slate-50 group-hover:bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5 transition-colors">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Sem 1 & 2 Grading:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[11px] font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">O (10)</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 ring-1 ring-indigo-400">E (9)</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">A (8)</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">B (7)</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">C (6)</span>
                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">D (5)</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">F (2)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                <span>Select Before 2026</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Option 2: After 2026 */}
            <div
              onClick={() => handleSelect('after-2026')}
              className={`group relative rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left hover:shadow-lg ${
                batchYear === 'after-2026'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-indigo-100 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    New Regulation
                  </span>
                  {batchYear === 'after-2026' && (
                    <span className="flex items-center gap-1 text-[11px] font-black text-indigo-600">
                      <CheckCircle2 className="w-4 h-4 fill-indigo-600 text-white" />
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    After 2026
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    For batches from 2026 onwards. Semesters 1 & 2 use <strong className="text-indigo-600 font-bold">A (9 pts)</strong> and <strong className="text-indigo-600 font-bold">P (5 pts)</strong>.
                  </p>
                </div>

                {/* Grade Scale Snapshot */}
                <div className="bg-slate-50 group-hover:bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5 transition-colors">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Sem 1 & 2 Grading:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[11px] font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">O (10)</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">A (9)</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">B (8)</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">C (7)</span>
                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">D (6)</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 ring-1 ring-purple-400">P (5)</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">F (2)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                <span>Select After 2026</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* Footer Note */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-500">
              💡 You can also switch regulations anytime using the <strong>Before 2026 / After 2026</strong> dropdown in the top navigation bar.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
