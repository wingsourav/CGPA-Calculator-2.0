import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useCalculator } from '../contexts/CalculatorContext.jsx';
import { calculateSGPA, getGradePoint, getGradeScaleForSemester } from '../utils/calculatorEngine.js';

export default function ExcelModal({ isOpen, onClose }) {
  const { semesters, importSemesters, cgpaResult, activeScale, batchYear } = useCalculator();

  const [importStatus, setImportStatus] = useState(null); // { type: 'success'|'error', message: '' }
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  // Handle Excel File Upload & Parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const importedSemesters = [];
        let semCounter = 1;

        // Iterate sheets or main sheet
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Parse row structures
          let currentSemester = {
            id: semCounter,
            name: sheetName.includes('Sem') ? sheetName : `${semCounter}th Semester`,
            subjects: []
          };

          jsonRows.forEach((row, idx) => {
            if (!row || row.length < 2) return;

            // Header line skip
            const firstCell = String(row[0] || '').toLowerCase();
            if (firstCell.includes('credit') || firstCell.includes('subject') || firstCell.includes('semester') || firstCell.includes('marksheet')) {
              return;
            }

            // Detect Subject row pattern: [Name/Code, Credits, Grade] or [Credits, Grade]
            let credits = 0;
            let grade = '';
            let subjectName = `Subject ${currentSemester.subjects.length + 1}`;

            if (typeof row[0] === 'number' && typeof row[1] === 'string') {
              // Pattern like Excel reference: [Total credit, Grade, ...]
              credits = Number(row[0]);
              grade = String(row[1]).toUpperCase();
            } else if (typeof row[0] === 'string' && typeof row[1] === 'number') {
              // Pattern: [Subject Name, Credits, Grade]
              subjectName = String(row[0]);
              credits = Number(row[1]);
              grade = String(row[2] || 'O').toUpperCase();
            }

            if (credits > 0 && grade) {
              currentSemester.subjects.push({
                id: `imp_${idx}_${Math.random().toString(36).substr(2, 4)}`,
                name: subjectName,
                code: '',
                credits,
                grade
              });
            }
          });

          if (currentSemester.subjects.length > 0) {
            importedSemesters.push(currentSemester);
            semCounter++;
          }
        });

        if (importedSemesters.length > 0) {
          importSemesters(importedSemesters);
          setImportStatus({
            type: 'success',
            message: `Successfully imported ${importedSemesters.length} semester(s) with ${importedSemesters.reduce((s, sem) => s + sem.subjects.length, 0)} subjects!`
          });
        } else {
          setImportStatus({
            type: 'error',
            message: 'Could not detect valid subject rows in uploaded file. Please ensure rows have numeric Credits and valid Grade letters.'
          });
        }
      } catch (err) {
        console.error('Excel Parsing Error:', err);
        setImportStatus({
          type: 'error',
          message: `Failed to parse Excel file: ${err.message}`
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle Exporting Current Data to Excel
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: CGPA Summary
      const summaryData = [
        ['ACADEMIC PERFORMANCE REPORT'],
        ['Generated via GradeCalc 2.0'],
        [],
        ['Overall CGPA', cgpaResult.cgpa],
        ['Total Completed Credits', cgpaResult.totalCredits],
        ['Completed Semesters', cgpaResult.completedSemestersCount],
        [],
        ['SEMESTER SUMMARY BREAKDOWN'],
        ['Semester Name', 'Credits', 'SGPA', 'Total Points']
      ];

      cgpaResult.semesterSummaries.forEach((s) => {
        summaryData.push([s.name, s.credits, s.sgpa, s.points]);
      });

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'CGPA Summary');

      // Sheet 2: Detailed Subject Marksheets
      const detailedData = [
        ['DETAILED SUBJECT MARKSHEETS'],
        []
      ];

      semesters.forEach((sem) => {
        detailedData.push([`=== ${sem.name} ===`]);
        detailedData.push(['Subject Name', 'Subject Code', 'Credits', 'Grade', 'Grade Point', 'Credit × Grade Point']);

        let semCredits = 0;
        let semPoints = 0;

        const semScale = getGradeScaleForSemester(sem, batchYear);
        (sem.subjects || []).forEach((sub) => {
          const cred = Number(sub.credits) || 0;
          const gp = getGradePoint(sub.grade, semScale);
          const pts = cred * gp;
          semCredits += cred;
          semPoints += pts;

          detailedData.push([
            sub.name,
            sub.code || '-',
            cred,
            (sub.grade || '').toUpperCase(),
            gp,
            pts
          ]);
        });

        const semSGPA = semCredits > 0 ? Number((semPoints / semCredits).toFixed(2)) : 0;
        detailedData.push(['TOTALS', '', semCredits, 'SGPA', semSGPA, semPoints]);
        detailedData.push([]);
      });

      const wsDetailed = XLSX.utils.aoa_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, wsDetailed, 'Detailed Marksheets');

      // Download file
      XLSX.writeFile(wb, 'SGPA_CGPA_Calculation_Report.xlsx');

      setImportStatus({
        type: 'success',
        message: 'Calculation report exported to SGPA_CGPA_Calculation_Report.xlsx successfully!'
      });
    } catch (err) {
      console.error('Export Error:', err);
      setImportStatus({
        type: 'error',
        message: `Export failed: ${err.message}`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-xl p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Excel Import & Export Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seamlessly upload existing marksheets or export calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-6 space-y-6">

          {/* Import Box */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group cursor-pointer relative bg-slate-50/50 dark:bg-slate-900/40">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {fileName ? fileName : 'Click or Drag & Drop Excel file (.xlsx)'}
              </p>
              <p className="text-xs text-slate-400">
                Supports reference spreadsheet layout & standard subject lists
              </p>
            </div>
          </div>

          {/* Status Alert */}
          {importStatus && (
            <div
              className={`p-4 rounded-xl flex items-start space-x-3 text-xs font-medium ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Export Action Card */}
          <div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Export Website Calculations
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download current semester marksheets & CGPA summary as formatted `.xlsx`
              </p>
            </div>
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Excel processing is done client-side cleanly without remote server exposure</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
