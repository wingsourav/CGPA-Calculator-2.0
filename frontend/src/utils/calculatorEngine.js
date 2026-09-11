/**
 * Reusable Calculation Engine for SGPA & CGPA Calculator
 * Semester-specific grading system mapping:
 * - 1st & 2nd Semester: O (10), E (9), A (8), B (7), C (6), D (5), F (2), SA (0), M (0), T (0)
 * - 3rd Semester and above: O (10), A (9), B (8), C (7), D (6), P (5), F (2), SA (0), M (0), T (0)
 */

export const FIRST_TWO_SEMS_GRADE_SCALE = {
  O: 10,
  E: 9,
  A: 8,
  B: 7,
  C: 6,
  D: 5,
  F: 2,
  SA: 0,
  M: 0,
  T: 0
};

export const REMAINING_SEMS_GRADE_SCALE = {
  O: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  P: 5,
  F: 2,
  SA: 0,
  M: 0,
  T: 0
};

// Legacy exports for backwards compatibility
export const STANDARD_GRADE_SCALE = REMAINING_SEMS_GRADE_SCALE;
export const GENERAL_GRADE_SCALE = FIRST_TWO_SEMS_GRADE_SCALE;

/**
 * Automatically determine the correct grade scale based on semester number/name and batch/regulation year.
 * - 'before-2026': 1st & 2nd sem use FIRST_TWO_SEMS_GRADE_SCALE (O, E, A, B, C, D, F, SA, M, T)
 * - 'after-2026': 1st & 2nd sem use REMAINING_SEMS_GRADE_SCALE (O, A, B, C, D, P, F, SA, M, T)
 * - 3rd sem and above always use REMAINING_SEMS_GRADE_SCALE (O, A, B, C, D, P, F, SA, M, T)
 */
export function getGradeScaleForSemester(sem, batchYear = 'before-2026') {
  if (!sem) return REMAINING_SEMS_GRADE_SCALE;
  const semId = typeof sem === 'object' ? sem.id : sem;
  const semName = typeof sem === 'object' ? (sem.name || '') : String(sem);

  const isFirstTwo = semId === 1 || semId === 2 || semName.startsWith('1st') || semName.startsWith('2nd');

  if (isFirstTwo) {
    if (batchYear === 'after-2026') {
      return REMAINING_SEMS_GRADE_SCALE;
    }
    return FIRST_TWO_SEMS_GRADE_SCALE;
  }
  return REMAINING_SEMS_GRADE_SCALE;
}

/**
 * Get grade point for a given grade string under a specified scale
 */
export function getGradePoint(grade, scale = REMAINING_SEMS_GRADE_SCALE) {
  if (!grade || typeof grade !== 'string') return 0;
  const cleanGrade = grade.trim().toUpperCase();
  return scale.hasOwnProperty(cleanGrade) ? scale[cleanGrade] : 0;
}

/**
 * Calculate single subject points
 */
export function calculateSubjectPoints(subject, scale = REMAINING_SEMS_GRADE_SCALE) {
  const credits = Number(subject.credits) || 0;
  const gradePoint = getGradePoint(subject.grade, scale);
  const points = credits * gradePoint;
  return {
    credits,
    gradePoint,
    points: Number(points.toFixed(2))
  };
}

/**
 * Calculate Semester SGPA
 * SGPA = Σ(Credit × Grade Point) / Σ(Credits)
 */
export function calculateSGPA(subjects = [], scaleOrSem = REMAINING_SEMS_GRADE_SCALE, batchYear = 'before-2026') {
  const scale = typeof scaleOrSem === 'object' && !Array.isArray(scaleOrSem) && scaleOrSem.O
    ? scaleOrSem
    : getGradeScaleForSemester(scaleOrSem, batchYear);

  let totalCredits = 0;
  let totalPoints = 0;

  for (const subject of subjects) {
    const credits = Number(subject.credits) || 0;
    const gradePoint = getGradePoint(subject.grade, scale);
    totalCredits += credits;
    totalPoints += credits * gradePoint;
  }

  if (totalCredits <= 0) {
    return {
      sgpa: 0,
      totalCredits: 0,
      totalPoints: 0,
      subjectCount: subjects.length
    };
  }

  const rawSGPA = totalPoints / totalCredits;
  const sgpa = Number(rawSGPA.toFixed(2));

  return {
    sgpa,
    rawSGPA,
    totalCredits: Number(totalCredits.toFixed(2)),
    totalPoints: Number(totalPoints.toFixed(2)),
    subjectCount: subjects.length
  };
}

/**
 * Calculate Cumulative CGPA across all semesters
 * Each semester uses its exact grading scale (1st/2nd vs 3rd+)
 */
export function calculateCGPA(semesters = [], batchYear = 'before-2026') {
  let grandTotalCredits = 0;
  let grandTotalPoints = 0;
  const semesterSummaries = [];

  for (const sem of semesters) {
    const scale = getGradeScaleForSemester(sem, batchYear);
    const subjects = sem.subjects || [];
    const semCalc = calculateSGPA(subjects, scale, batchYear);

    const semCredits = sem.credits !== undefined && sem.credits !== null && sem.credits !== ''
      ? Number(sem.credits)
      : semCalc.totalCredits;

    const semSGPA = sem.sgpa !== undefined && sem.sgpa !== null && sem.sgpa !== ''
      ? Number(sem.sgpa)
      : semCalc.sgpa;

    if (semCredits > 0) {
      const points = sem.subjects && sem.subjects.length > 0
        ? semCalc.totalPoints
        : semSGPA * semCredits;

      grandTotalCredits += semCredits;
      grandTotalPoints += points;

      semesterSummaries.push({
        id: sem.id || sem.name,
        name: sem.name || `Semester ${sem.id}`,
        credits: semCredits,
        sgpa: semSGPA,
        points: Number(points.toFixed(2))
      });
    }
  }

  if (grandTotalCredits <= 0) {
    return {
      cgpa: 0,
      totalCredits: 0,
      totalPoints: 0,
      completedSemestersCount: 0,
      semesterSummaries: []
    };
  }

  const rawCGPA = grandTotalPoints / grandTotalCredits;
  const cgpa = Number(rawCGPA.toFixed(2));

  return {
    cgpa,
    rawCGPA,
    totalCredits: Number(grandTotalCredits.toFixed(2)),
    totalPoints: Number(grandTotalPoints.toFixed(2)),
    completedSemestersCount: semesterSummaries.length,
    semesterSummaries
  };
}

/**
 * Calculate Target SGPA required for next semester
 */
export function calculateTargetSGPA({ currentCGPA, completedCredits, targetCGPA, upcomingCredits, maxGradePoint = 10 }) {
  const curCGPA = Number(currentCGPA) || 0;
  const compCred = Number(completedCredits) || 0;
  const targCGPA = Number(targetCGPA) || 0;
  const upcred = Number(upcomingCredits) || 0;

  if (upcred <= 0) {
    return {
      requiredSGPA: 0,
      status: 'Invalid',
      message: 'Upcoming credits must be greater than 0.'
    };
  }

  const totalRequiredPoints = targCGPA * (compCred + upcred);
  const currentEarnedPoints = curCGPA * compCred;
  const neededPoints = totalRequiredPoints - currentEarnedPoints;
  const rawRequiredSGPA = neededPoints / upcred;
  const requiredSGPA = Number(rawRequiredSGPA.toFixed(2));

  let status = 'Achievable';
  let badgeColor = 'emerald';
  let message = 'Target is realistic and well within reach!';

  if (requiredSGPA <= 0) {
    status = 'Achieved';
    badgeColor = 'cyan';
    message = 'You have already met or exceeded this target CGPA!';
  } else if (requiredSGPA <= 8.0) {
    status = 'Achievable';
    badgeColor = 'emerald';
    message = 'Smooth sailing! Attainable with standard performance.';
  } else if (requiredSGPA <= maxGradePoint) {
    status = 'Challenging';
    badgeColor = 'amber';
    message = `Demanding! Requires an SGPA of ${requiredSGPA.toFixed(2)} out of ${maxGradePoint}.`;
  } else {
    status = 'Impossible';
    badgeColor = 'rose';
    message = `Mathematically impossible under a ${maxGradePoint}-point scale (Requires ${requiredSGPA.toFixed(2)} SGPA).`;
  }

  return {
    requiredSGPA,
    rawRequiredSGPA,
    status,
    badgeColor,
    message,
    targetCGPA: targCGPA,
    currentCGPA: curCGPA,
    completedCredits: compCred,
    upcomingCredits: upcred
  };
}

export function analyzeGradeDistribution(semesters = [], batchYear = 'before-2026') {
  const counts = {};
  for (const sem of semesters) {
    const scale = getGradeScaleForSemester(sem, batchYear);
    for (const sub of sem.subjects || []) {
      const g = (sub.grade || '').trim().toUpperCase();
      if (scale.hasOwnProperty(g)) {
        counts[g] = (counts[g] || 0) + 1;
      }
    }
  }

  return {
    counts,
    totalSubjects: Object.values(counts).reduce((a, b) => a + b, 0)
  };
}
