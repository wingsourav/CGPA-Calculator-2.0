import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  STANDARD_GRADE_SCALE,
  GENERAL_GRADE_SCALE,
  calculateSGPA,
  calculateCGPA,
  calculateTargetSGPA
} from '../frontend/src/utils/calculatorEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SGPA & CGPA Calculator API',
    timestamp: new Date().toISOString()
  });
});

// Grade Scales Info
app.get('/api/grade-scales', (req, res) => {
  res.json({
    standard: STANDARD_GRADE_SCALE,
    general: GENERAL_GRADE_SCALE
  });
});

// Calculate SGPA
app.post('/api/calculate/sgpa', (req, res) => {
  try {
    const { subjects, scaleType = 'standard', customScale } = req.body;
    const scale = customScale || (scaleType === 'general' ? GENERAL_GRADE_SCALE : STANDARD_GRADE_SCALE);
    const result = calculateSGPA(subjects || [], scale);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Calculate CGPA
app.post('/api/calculate/cgpa', (req, res) => {
  try {
    const { semesters, scaleType = 'standard', customScale } = req.body;
    const scale = customScale || (scaleType === 'general' ? GENERAL_GRADE_SCALE : STANDARD_GRADE_SCALE);
    const result = calculateCGPA(semesters || [], scale);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Calculate Target SGPA
app.post('/api/calculate/target', (req, res) => {
  try {
    const { currentCGPA, completedCredits, targetCGPA, upcomingCredits } = req.body;
    const result = calculateTargetSGPA({
      currentCGPA,
      completedCredits,
      targetCGPA,
      upcomingCredits
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SGPA/CGPA Calculator Backend running on port ${PORT}`);
});
