import React from 'react';
import {
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useCalculator } from '../contexts/CalculatorContext.jsx';
import { calculateSGPA, getGradePoint } from '../utils/calculatorEngine.js';
import { handleGridKeyDown } from '../utils/keyboardNav.js';

export default function CalculatorPage({ onOpenExcelModal }) {
  const {
    semesters,
    activeSemesterId,
    setActiveSemesterId,
    activeScale,
    addSubject,
    updateSubject,
    deleteSubject,
    duplicateSubject,
    resetSemester,
    addSemester,
    deleteSemester,
    studentType,
    batchYear,
    cgpaResult
  } = useCalculator();

  const activeSem = semesters.find(s => s.id === activeSemesterId) || semesters[0];
  const activeCalc = calculateSGPA(activeSem?.subjects || [], activeScale);
  const availableGrades = Object.keys(activeScale);
  const totalSubCount = activeSem?.subjects?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4 sm:pb-6">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Semester-Wise Marks Engine</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Semester Subject Marksheet
          </h1>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Grading System: {batchYear === 'after-2026' ? 'After 2026' : 'Before 2026'}</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
          Real-time marks calculation for <strong className="capitalize text-indigo-600">{studentType}</strong> stream
        </p>
      </div>

      {/* Live CGPA & SGPA Overview Cards (Mobile Responsive 2x2 Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Overall CGPA */}
        <div className="glass-panel p-3.5 sm:p-5 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white border border-indigo-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-black uppercase text-indigo-600 tracking-wider block mb-1">
            Overall CGPA
          </span>
          <div className="text-2xl sm:text-4xl font-black text-slate-900 my-0.5">
            {cgpaResult.cgpa > 0 ? cgpaResult.cgpa.toFixed(2) : '-'}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block">
            Weighted across {cgpaResult.completedSemestersCount} sem(s)
          </span>
        </div>

        {/* Total Credits */}
        <div className="glass-panel p-3.5 sm:p-5 bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wider block mb-1">
            Total Credits
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 my-0.5">
            {cgpaResult.totalCredits > 0 ? cgpaResult.totalCredits : '-'}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block">Cumulative Credits</span>
        </div>

        {/* Current Tab SGPA */}
        <div className="glass-panel p-3.5 sm:p-5 bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wider truncate block mb-1">
            {activeSem?.name} SGPA
          </span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 my-0.5">
            {activeCalc.sgpa > 0 ? activeCalc.sgpa.toFixed(2) : '-'}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block">{activeCalc.totalCredits} Sem Credits</span>
        </div>

        {/* Total Points */}
        <div className="glass-panel p-3.5 sm:p-5 bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wider block mb-1">
            Grade Points
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 my-0.5">
            {cgpaResult.totalPoints > 0 ? cgpaResult.totalPoints : '-'}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block">Σ (Credit × Grade Pt)</span>
        </div>
      </div>

      {/* Semester Navigation Tabs (Smooth Mobile Horizontal Touch Scroll) */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 gap-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
          {semesters.map((sem) => {
            const isSelected = sem.id === activeSemesterId;
            return (
              <button
                key={sem.id}
                onClick={() => setActiveSemesterId(sem.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{sem.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {sem.subjects?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={addSemester}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Sem</span>
          <span className="sm:hidden">+ Sem</span>
        </button>
      </div>

      {/* Semester Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => addSubject(activeSemesterId)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>

          <button
            onClick={() => resetSemester(activeSemesterId)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Clear subjects in this semester"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Semester</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>

        {semesters.length > 1 && (
          <button
            onClick={() => deleteSemester(activeSemesterId)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>

      {/* Subjects Table Container with Smooth Touch Horizontal Scroll on Mobile */}
      <div className="glass-panel overflow-hidden bg-white border border-slate-200/80 shadow-md rounded-2xl -mx-3 sm:mx-0">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-3 w-28">Subject Code</th>
                <th className="py-3 px-3 w-24 text-center">Credits</th>
                <th className="py-3 px-3 w-32 text-center">Grade</th>
                <th className="py-3 px-3 w-24 text-center">Grade Pt</th>
                <th className="py-3 px-3 w-28 text-center">Cred × Grade</th>
                <th className="py-3 px-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-800">
              {activeSem?.subjects?.length > 0 ? (
                activeSem.subjects.map((subject, index) => {
                  const cred = Number(subject.credits) || 0;
                  const gp = getGradePoint(subject.grade, activeScale);
                  const totalPts = cred * gp;

                  return (
                    <tr
                      key={subject.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-3 text-center text-xs font-bold text-slate-400">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="text"
                          data-grid-id={`subject-grid-${index}-0`}
                          onKeyDown={(e) => handleGridKeyDown(e, index, 0, totalSubCount, 4, 'subject-grid', () => addSubject(activeSemesterId))}
                          value={subject.name}
                          onChange={(e) => updateSubject(activeSemesterId, subject.id, 'name', e.target.value)}
                          placeholder="e.g. Mathematics III"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-xs sm:text-sm font-semibold"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          data-grid-id={`subject-grid-${index}-1`}
                          onKeyDown={(e) => handleGridKeyDown(e, index, 1, totalSubCount, 4, 'subject-grid', () => addSubject(activeSemesterId))}
                          value={subject.code || ''}
                          onChange={(e) => updateSubject(activeSemesterId, subject.id, 'code', e.target.value)}
                          placeholder="CS-301"
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-xs font-mono"
                        />
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="30"
                          data-grid-id={`subject-grid-${index}-2`}
                          onKeyDown={(e) => handleGridKeyDown(e, index, 2, totalSubCount, 4, 'subject-grid', () => addSubject(activeSemesterId))}
                          value={subject.credits}
                          onChange={(e) => updateSubject(activeSemesterId, subject.id, 'credits', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1.5 text-center rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-xs sm:text-sm font-extrabold"
                        />
                      </td>

                      <td className="py-3 px-3 text-center">
                        <select
                          data-grid-id={`subject-grid-${index}-3`}
                          onKeyDown={(e) => handleGridKeyDown(e, index, 3, totalSubCount, 4, 'subject-grid', () => addSubject(activeSemesterId))}
                          value={subject.grade}
                          onChange={(e) => updateSubject(activeSemesterId, subject.id, 'grade', e.target.value)}
                          className="w-28 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-xs font-extrabold cursor-pointer"
                        >
                          <option value="">Select</option>
                          {subject.grade && !availableGrades.includes(subject.grade) && (
                            <option value={subject.grade}>
                              {subject.grade} (Legacy)
                            </option>
                          )}
                          {availableGrades.map((g) => (
                            <option key={g} value={g}>
                              {g} ({activeScale[g]} pts)
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {gp > 0 ? gp : '-'}
                      </td>

                      <td className="py-3 px-3 text-center font-black text-indigo-600">
                        {totalPts > 0 ? totalPts.toFixed(1) : '-'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => duplicateSubject(activeSemesterId, subject.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Duplicate Subject"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSubject(activeSemesterId, subject.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    <p className="text-xs sm:text-sm font-semibold">No subjects added to {activeSem?.name} yet.</p>
                    <button
                      onClick={() => addSubject(activeSemesterId)}
                      className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700"
                    >
                      Add First Subject
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
