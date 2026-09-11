import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CalculatorProvider, useCalculator } from './contexts/CalculatorContext.jsx';

import Navbar from './components/Navbar.jsx';
import ExcelModal from './components/ExcelModal.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import CalculatorPage from './pages/CalculatorPage.jsx';
import CGPAWiseView from './pages/CGPAWiseView.jsx';
import PlacementAnalyticsView from './pages/PlacementAnalyticsView.jsx';

function MainRouterContent() {
  const { viewMode } = useCalculator();
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-300">
      
      {/* Header Navigation Bar */}
      <Navbar />

      {/* Main Views */}
      <main className="flex-grow">
        <Routes>
          {/* Standalone Authentication Login Page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Main Protected Dashboard View */}
          <Route
            path="/calculator"
            element={
              <ProtectedRoute>
                {viewMode === 'placement' ? (
                  <PlacementAnalyticsView />
                ) : viewMode === 'cgpa' ? (
                  <CGPAWiseView />
                ) : (
                  <CalculatorPage onOpenExcelModal={() => setIsExcelModalOpen(true)} />
                )}
              </ProtectedRoute>
            }
          />

          {/* Default Routing */}
          <Route path="/" element={<Navigate to="/calculator" replace />} />
          <Route path="*" element={<Navigate to="/calculator" replace />} />
        </Routes>
      </main>

      {/* Excel Modal */}
      <ExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CalculatorProvider>
          <BrowserRouter>
            <MainRouterContent />
          </BrowserRouter>
        </CalculatorProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
