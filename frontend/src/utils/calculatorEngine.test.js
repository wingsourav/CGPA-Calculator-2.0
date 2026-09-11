import { describe, it, expect } from 'vitest';
import {
  STANDARD_GRADE_SCALE,
  GENERAL_GRADE_SCALE,
  FIRST_TWO_SEMS_GRADE_SCALE,
  REMAINING_SEMS_GRADE_SCALE,
  getGradeScaleForSemester,
  getGradePoint,
  calculateSubjectPoints,
  calculateSGPA,
  calculateCGPA,
  calculateTargetSGPA,
  analyzeGradeDistribution
} from './calculatorEngine.js';

describe('Calculator Engine Core Logic', () => {
  describe('Regulation Batch Year Mappings (Before 2026 vs After 2026)', () => {
    it('returns FIRST_TWO_SEMS_GRADE_SCALE (Image 2) for 1st & 2nd sem in before-2026', () => {
      const sem1Scale = getGradeScaleForSemester(1, 'before-2026');
      const sem2Scale = getGradeScaleForSemester(2, 'before-2026');
      expect(sem1Scale).toEqual(FIRST_TWO_SEMS_GRADE_SCALE);
      expect(sem2Scale).toEqual(FIRST_TWO_SEMS_GRADE_SCALE);
      expect(sem1Scale.E).toBe(9);
      expect(sem1Scale.A).toBe(8);
      expect(sem1Scale.P).toBeUndefined();
    });

    it('returns REMAINING_SEMS_GRADE_SCALE (Image 3) for 1st & 2nd sem in after-2026', () => {
      const sem1Scale = getGradeScaleForSemester(1, 'after-2026');
      const sem2Scale = getGradeScaleForSemester(2, 'after-2026');
      expect(sem1Scale).toEqual(REMAINING_SEMS_GRADE_SCALE);
      expect(sem2Scale).toEqual(REMAINING_SEMS_GRADE_SCALE);
      expect(sem1Scale.A).toBe(9);
      expect(sem1Scale.B).toBe(8);
      expect(sem1Scale.P).toBe(5);
      expect(sem1Scale.E).toBeUndefined();
    });

    it('returns REMAINING_SEMS_GRADE_SCALE for 3rd semester and above in both regulations', () => {
      expect(getGradeScaleForSemester(3, 'before-2026')).toEqual(REMAINING_SEMS_GRADE_SCALE);
      expect(getGradeScaleForSemester(3, 'after-2026')).toEqual(REMAINING_SEMS_GRADE_SCALE);
      expect(getGradeScaleForSemester(4, 'after-2026')).toEqual(REMAINING_SEMS_GRADE_SCALE);
    });
  });

  describe('Grade Point Mappings', () => {
    it('maps standard grades correctly', () => {
      expect(getGradePoint('O', STANDARD_GRADE_SCALE)).toBe(10);
      expect(getGradePoint('A', STANDARD_GRADE_SCALE)).toBe(9);
      expect(getGradePoint('B', STANDARD_GRADE_SCALE)).toBe(8);
      expect(getGradePoint('C', STANDARD_GRADE_SCALE)).toBe(7);
      expect(getGradePoint('D', STANDARD_GRADE_SCALE)).toBe(6);
      expect(getGradePoint('P', STANDARD_GRADE_SCALE)).toBe(5);
      expect(getGradePoint('F', STANDARD_GRADE_SCALE)).toBe(2);
      expect(getGradePoint('SA', STANDARD_GRADE_SCALE)).toBe(0);
      expect(getGradePoint('M', STANDARD_GRADE_SCALE)).toBe(0);
    });

    it('maps general grades correctly (with E grade)', () => {
      expect(getGradePoint('O', GENERAL_GRADE_SCALE)).toBe(10);
      expect(getGradePoint('E', GENERAL_GRADE_SCALE)).toBe(9);
      expect(getGradePoint('A', GENERAL_GRADE_SCALE)).toBe(8);
      expect(getGradePoint('B', GENERAL_GRADE_SCALE)).toBe(7);
      expect(getGradePoint('C', GENERAL_GRADE_SCALE)).toBe(6);
      expect(getGradePoint('D', GENERAL_GRADE_SCALE)).toBe(5);
      expect(getGradePoint('F', GENERAL_GRADE_SCALE)).toBe(2);
      expect(getGradePoint('S', GENERAL_GRADE_SCALE)).toBe(0);
    });

    it('handles lowercase and whitespace inputs gracefully', () => {
      expect(getGradePoint('  a  ', STANDARD_GRADE_SCALE)).toBe(9);
      expect(getGradePoint('o', STANDARD_GRADE_SCALE)).toBe(10);
      expect(getGradePoint('invalid', STANDARD_GRADE_SCALE)).toBe(0);
    });
  });

  describe('Subject Points Calculation', () => {
    it('calculates subject points correctly', () => {
      const subject = { name: 'Math', credits: 4, grade: 'A' };
      const res = calculateSubjectPoints(subject, STANDARD_GRADE_SCALE);
      expect(res.credits).toBe(4);
      expect(res.gradePoint).toBe(9);
      expect(res.points).toBe(36);
    });
  });

  describe('SGPA Calculation', () => {
    it('calculates semester SGPA matching Excel reference formula', () => {
      // Example matching Excel row 47 Diploma sem 3
      const subjects = [
        { credits: 3, grade: 'A' }, // 3 * 9 = 27
        { credits: 4, grade: 'O' }, // 4 * 10 = 40
        { credits: 3, grade: 'B' }  // 3 * 8 = 24
      ];
      // Total credits: 10, Total points: 91 => SGPA = 9.10
      const res = calculateSGPA(subjects, STANDARD_GRADE_SCALE);
      expect(res.totalCredits).toBe(10);
      expect(res.totalPoints).toBe(91);
      expect(res.sgpa).toBe(9.10);
    });

    it('handles zero total credits safely', () => {
      const res = calculateSGPA([], STANDARD_GRADE_SCALE);
      expect(res.sgpa).toBe(0);
      expect(res.totalCredits).toBe(0);
    });
  });

  describe('Credit-Weighted CGPA Calculation', () => {
    it('calculates credit-weighted CGPA across multiple semesters', () => {
      const semesters = [
        {
          name: 'Sem 1',
          subjects: [
            { credits: 22, grade: 'B' } // 22 * 8 = 176 => SGPA 8.00
          ]
        },
        {
          name: 'Sem 2',
          subjects: [
            { credits: 22, grade: 'A' } // 22 * 9 = 198 => SGPA 9.00
          ]
        }
      ];
      // Total Credits = 44, Total Points = 374 => CGPA = 8.50
      const res = calculateCGPA(semesters, STANDARD_GRADE_SCALE);
      expect(res.totalCredits).toBe(44);
      expect(res.cgpa).toBe(8.50);
    });
  });

  describe('Target CGPA Estimator', () => {
    it('calculates achievable target SGPA', () => {
      const res = calculateTargetSGPA({
        currentCGPA: 8.0,
        completedCredits: 60,
        targetCGPA: 8.5,
        upcomingCredits: 20
      });
      // Req points = 8.5 * 80 - 8.0 * 60 = 680 - 480 = 200
      // Req SGPA = 200 / 20 = 10.0
      expect(res.requiredSGPA).toBe(10.0);
      expect(res.status).toBe('Challenging');
    });

    it('identifies impossible target SGPA (> 10.0)', () => {
      const res = calculateTargetSGPA({
        currentCGPA: 6.0,
        completedCredits: 80,
        targetCGPA: 9.0,
        upcomingCredits: 20
      });
      // Req points = 9.0 * 100 - 6.0 * 80 = 900 - 480 = 420
      // Req SGPA = 420 / 20 = 21.0
      expect(res.requiredSGPA).toBe(21.0);
      expect(res.status).toBe('Impossible');
    });
  });

  describe('Grade Distribution Analysis', () => {
    it('aggregates grade counts correctly across semesters', () => {
      const semesters = [
        {
          subjects: [
            { grade: 'O' },
            { grade: 'A' },
            { grade: 'A' }
          ]
        }
      ];
      const dist = analyzeGradeDistribution(semesters, STANDARD_GRADE_SCALE);
      expect(dist.counts.O).toBe(1);
      expect(dist.counts.A).toBe(2);
      expect(dist.totalSubjects).toBe(3);
    });
  });
});
