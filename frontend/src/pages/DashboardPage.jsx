import React from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Award,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  Calculator,
  Target,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import { useCalculator } from '../contexts/CalculatorContext.jsx';
import { calculateSGPA, getGradeScaleForSemester } from '../utils/calculatorEngine.js';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function DashboardPage() {
  const { semesters, cgpaResult, gradeDistribution, activeScale, studentType, batchYear } = useCalculator();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  // Prepare chart data
  const semesterChartData = semesters.map((sem) => {
    const semScale = getGradeScaleForSemester(sem, batchYear);
    const calc = calculateSGPA(sem.subjects || [], semScale);
    return {
      name: sem.name || `Sem ${sem.id}`,
      sgpa: calc.sgpa,
      credits: calc.totalCredits,
      points: calc.totalPoints,
      subjectCount: sem.subjects?.length || 0
    };
  });

  const validSgpas = semesterChartData.map(d => d.sgpa).filter(s => s > 0);
  const highestSGPA = validSgpas.length > 0 ? Math.max(...validSgpas) : 0;
  const lowestSGPA = validSgpas.length > 0 ? Math.min(...validSgpas) : 0;
  const latestSGPA = validSgpas.length > 0 ? validSgpas[validSgpas.length - 1] : 0;

  // Grade Distribution Pie Data
  const gradePieData = Object.keys(gradeDistribution.counts)
    .filter(g => gradeDistribution.counts[g] > 0)
    .map(g => ({
      name: `Grade ${g}`,
      value: gradeDistribution.counts[g]
    }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Academic Performance Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Performance Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time analytics for <strong className="capitalize">{studentType}</strong> stream semesters
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/calculator"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
          >
            <Calculator className="w-4 h-4" />
            <span>Manage Subjects</span>
          </Link>
          <Link
            to="/target"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <Target className="w-4 h-4" />
            <span>Target SGPA</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* CGPA Card */}
        <div className="col-span-2 glass-panel p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-200 dark:border-indigo-800/80">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall CGPA</span>
            <Award className="w-5 h-5" />
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">
            {cgpaResult.cgpa.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Credit-weighted across {cgpaResult.completedSemestersCount} semester(s)
          </p>
        </div>

        {/* Current SGPA Card */}
        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Latest SGPA</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {latestSGPA.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Recent Semester</span>
        </div>

        {/* Total Credits Card */}
        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Credits</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {cgpaResult.totalCredits}
          </div>
          <span className="text-[11px] text-slate-400">Earned Credits</span>
        </div>

        {/* Highest SGPA Card */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-xs font-semibold">Highest SGPA</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {highestSGPA.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Peak Performance</span>
        </div>

        {/* Lowest SGPA Card */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-xs font-semibold">Lowest SGPA</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            {lowestSGPA.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Base Performance</span>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Chart 1: SGPA Trend Line Chart */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SGPA Performance Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Semester-by-semester SGPA trajectory
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semesterChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#64748b'} fontSize={12} />
                <YAxis domain={[0, 10]} stroke={isDark ? '#9ca3af' : '#64748b'} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#cbd5e1',
                    borderRadius: '0.5rem',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sgpa"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#6366f1' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Credits vs Semester Bar Chart */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Credit Weightage Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Credits completed in each semester
              </p>
            </div>
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semesterChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#64748b'} fontSize={12} />
                <YAxis stroke={isDark ? '#9ca3af' : '#64748b'} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#cbd5e1',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="credits" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Grade Distribution Breakdown */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Grade Distribution Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total grades obtained across all subjects ({gradeDistribution.totalSubjects} subjects)
              </p>
            </div>
            <PieIcon className="w-5 h-5 text-pink-500" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {gradePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {gradePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#111827' : '#ffffff',
                      borderColor: isDark ? '#374151' : '#cbd5e1',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No grades recorded yet.</p>
            )}
          </div>
        </div>

        {/* Chart 4: Semester Points Comparison */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Earned Grade Points Overview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total (Credit × Grade Point) accrued per semester
              </p>
            </div>
            <Award className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semesterChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#64748b'} fontSize={12} />
                <YAxis stroke={isDark ? '#9ca3af' : '#64748b'} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#cbd5e1',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="points" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
