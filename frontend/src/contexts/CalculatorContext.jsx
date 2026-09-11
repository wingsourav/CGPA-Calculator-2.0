import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FIRST_TWO_SEMS_GRADE_SCALE,
  REMAINING_SEMS_GRADE_SCALE,
  getGradeScaleForSemester,
  calculateSGPA,
  calculateCGPA,
  analyzeGradeDistribution
} from '../utils/calculatorEngine.js';
import { db, doc, setDoc, getDoc } from '../firebase/firebase-config.js';
import { useAuth } from './AuthContext.jsx';

const CalculatorContext = createContext();

// Empty semester structure for NEW users (up to 6th semester!)
const EMPTY_DIPLOMA_SEMESTERS = [
  { id: 3, name: '3rd Semester', credits: '', sgpa: '', subjects: [{ id: 'sub_301', name: '', code: '', credits: '', grade: '' }] },
  { id: 4, name: '4th Semester', credits: '', sgpa: '', subjects: [{ id: 'sub_401', name: '', code: '', credits: '', grade: '' }] },
  { id: 5, name: '5th Semester', credits: '', sgpa: '', subjects: [{ id: 'sub_501', name: '', code: '', credits: '', grade: '' }] },
  { id: 6, name: '6th Semester', credits: '', sgpa: '', subjects: [] }
];

const EMPTY_GENERAL_SEMESTERS = [
  { id: 1, name: '1st Semester', credits: '', sgpa: '', subjects: [{ id: 'sub_101', name: '', code: '', credits: '', grade: '' }] },
  { id: 2, name: '2nd Semester', credits: '', sgpa: '', subjects: [{ id: 'sub_201', name: '', code: '', credits: '', grade: '' }] },
  { id: 3, name: '3rd Semester', credits: '', sgpa: '', subjects: [{ id: 'sub_301', name: '', code: '', credits: '', grade: '' }] },
  { id: 4, name: '4th Semester', credits: '', sgpa: '', subjects: [{ id: 'sub_401', name: '', code: '', credits: '', grade: '' }] },
  { id: 5, name: '5th Semester', credits: '', sgpa: '', subjects: [] },
  { id: 6, name: '6th Semester', credits: '', sgpa: '', subjects: [] }
];

export function CalculatorProvider({ children }) {
  const { currentUser } = useAuth();

  const [studentType, setStudentTypeState] = useState(() => {
    return localStorage.getItem('studentType') || 'general';
  });

  const [viewMode, setViewModeState] = useState(() => {
    return localStorage.getItem('viewMode') || 'semester'; // 'semester' | 'cgpa'
  });

  const [batchYear, setBatchYearState] = useState(() => {
    return localStorage.getItem('batchYear') || 'before-2026'; // 'before-2026' | 'after-2026'
  });

  // Track Unsaved Changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize semesters dynamically
  const [semesters, setSemesters] = useState(() => {
    localStorage.removeItem('semesters_data_v3');
    localStorage.removeItem('semesters_data_v4');
    const saved = localStorage.getItem('semesters_data_v5');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved semesters:', e);
      }
    }
    return studentType === 'diploma' ? EMPTY_DIPLOMA_SEMESTERS : EMPTY_GENERAL_SEMESTERS;
  });

  const [activeSemesterId, setActiveSemesterId] = useState(() => {
    return semesters[0]?.id || (studentType === 'diploma' ? 3 : 1);
  });

  // Dynamically compute the active grade scale based on the selected semester and batch year
  const activeScale = getGradeScaleForSemester(activeSemesterId, batchYear);

  // Warn on tab close / exit if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in your marksheet! Are you sure you want to exit without saving?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Sync with Firestore on Login
  useEffect(() => {
    if (!currentUser) return;

    async function syncFirestore() {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.semesters && Array.isArray(data.semesters)) {
            setSemesters(data.semesters);
          }
          if (data.studentType) setStudentTypeState(data.studentType);
          if (data.batchYear) setBatchYearState(data.batchYear);
        }
      } catch (err) {
        console.warn('Firestore sync note:', err.message);
      }
    }

    syncFirestore();
  }, [currentUser]);

  // Explicit Save Changes Action
  const saveChanges = async () => {
    const trimmedSems = semesters.slice(0, 6);
    localStorage.setItem('semesters_data_v5', JSON.stringify(trimmedSems));
    localStorage.setItem('studentType', studentType);
    localStorage.setItem('batchYear', batchYear);
    localStorage.setItem('viewMode', viewMode);

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userDocRef,
          {
            studentType,
            batchYear,
            semesters: trimmedSems,
            lastUpdated: new Date().toISOString()
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Cloud save error:', err);
      }
    }

    setHasUnsavedChanges(false);
    showToast('Marksheet saved successfully!');
  };

  // Clear All Data Action (Clears all inputs and auto-saves empty state!)
  const clearAllData = async () => {
    const emptySems = studentType === 'diploma' ? EMPTY_DIPLOMA_SEMESTERS : EMPTY_GENERAL_SEMESTERS;
    setSemesters(emptySems);
    setActiveSemesterId(emptySems[0]?.id || 1);

    localStorage.setItem('semesters_data_v5', JSON.stringify(emptySems));

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userDocRef,
          {
            studentType,
            semesters: emptySems,
            lastUpdated: new Date().toISOString()
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Cloud save clear error:', err);
      }
    }

    setHasUnsavedChanges(false);
    showToast('All marks data cleared & saved!');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const setStudentType = (type) => {
    setStudentTypeState(type);
    const emptySems = type === 'diploma' ? EMPTY_DIPLOMA_SEMESTERS : EMPTY_GENERAL_SEMESTERS;
    setSemesters(emptySems);
    setActiveSemesterId(emptySems[0]?.id || (type === 'diploma' ? 3 : 1));
    setHasUnsavedChanges(true);
  };

  const setViewMode = (mode) => {
    setViewModeState(mode);
    localStorage.setItem('viewMode', mode);
  };

  const setBatchYear = (year) => {
    setBatchYearState(year);
    localStorage.setItem('batchYear', year);
    setHasUnsavedChanges(true);
  };

  // CRUD Operations
  const addSubject = (semesterId) => {
    setSemesters(prev => {
      const updated = prev.map(sem => {
        if (sem.id === semesterId) {
          const newSub = {
            id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: '',
            code: '',
            credits: '',
            grade: ''
          };
          return {
            ...sem,
            subjects: [...(sem.subjects || []), newSub]
          };
        }
        return sem;
      });
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const updateSubject = (semesterId, subjectId, field, value) => {
    setSemesters(prev => {
      const updated = prev.map(sem => {
        if (sem.id === semesterId) {
          const updatedSubjects = (sem.subjects || []).map(sub => {
            if (sub.id === subjectId) {
              return { ...sub, [field]: value };
            }
            return sub;
          });
          return { ...sem, subjects: updatedSubjects };
        }
        return sem;
      });
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const deleteSubject = (semesterId, subjectId) => {
    setSemesters(prev => {
      const updated = prev.map(sem => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            subjects: (sem.subjects || []).filter(sub => sub.id !== subjectId)
          };
        }
        return sem;
      });
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const duplicateSubject = (semesterId, subjectId) => {
    setSemesters(prev => {
      const updated = prev.map(sem => {
        if (sem.id === semesterId) {
          const target = sem.subjects.find(s => s.id === subjectId);
          if (!target) return sem;
          const clone = {
            ...target,
            id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: target.name ? `${target.name} (Copy)` : ''
          };
          return { ...sem, subjects: [...sem.subjects, clone] };
        }
        return sem;
      });
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const resetSemester = (semesterId) => {
    setSemesters(prev => {
      const updated = prev.map(sem => {
        if (sem.id === semesterId) {
          return { ...sem, subjects: [], credits: '', sgpa: '' };
        }
        return sem;
      });
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const addSemester = () => {
    setSemesters(prev => {
      const maxId = prev.reduce((max, s) => (typeof s.id === 'number' ? Math.max(max, s.id) : max), 0);
      const newId = maxId + 1;
      const newSem = {
        id: newId,
        name: `${newId}th Semester`,
        credits: '',
        sgpa: '',
        subjects: [
          { id: 'sub_' + Date.now(), name: '', code: '', credits: '', grade: '' }
        ]
      };
      const updated = [...prev, newSem];
      setHasUnsavedChanges(true);
      setActiveSemesterId(newId);
      return updated;
    });
  };

  const deleteSemester = (semesterId) => {
    setSemesters(prev => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter(s => s.id !== semesterId);
      setHasUnsavedChanges(true);
      if (activeSemesterId === semesterId) {
        setActiveSemesterId(updated[0]?.id || 1);
      }
      return updated;
    });
  };

  const updateSemesterOverview = (semesterId, field, value) => {
    setSemesters(prev => {
      const updated = prev.map(sem => {
        if (sem.id === semesterId) {
          return { ...sem, [field]: value };
        }
        return sem;
      });
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const importSemesters = (importedData) => {
    if (!Array.isArray(importedData) || importedData.length === 0) return;
    setSemesters(importedData);
    if (importedData[0]?.id) setActiveSemesterId(importedData[0].id);
    setHasUnsavedChanges(true);
  };

  // Computations using semester-specific grading scales and selected batch regulation
  const cgpaResult = calculateCGPA(semesters, batchYear);
  const gradeDistribution = analyzeGradeDistribution(semesters, batchYear);

  return (
    <CalculatorContext.Provider
      value={{
        studentType,
        setStudentType,
        batchYear,
        setBatchYear,
        viewMode,
        setViewMode,
        hasUnsavedChanges,
        toastMessage,
        saveChanges,
        clearAllData,
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
        updateSemesterOverview,
        importSemesters,
        cgpaResult,
        gradeDistribution
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
