import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import PCOSPrediction from './pages/PCOSPrediction';
import ThyroidPrediction from './pages/ThyroidPrediction';
import BreastCancerPrediction from './pages/BreastCancerPrediction';
import Dashboard from './pages/Dashboard';
import PatientRecords from './pages/PatientRecords';

function App() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {isAuthenticated && <Navbar />}
        <main className="flex-grow">
          <Routes>
            {/* Login Route - Redirect to home if already authenticated */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Navigate to="/home" replace /> : <Login />
              } 
            />
            
            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pcos"
              element={
                <ProtectedRoute>
                  <PCOSPrediction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/thyroid"
              element={
                <ProtectedRoute>
                  <ThyroidPrediction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/breast-cancer"
              element={
                <ProtectedRoute>
                  <BreastCancerPrediction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <PatientRecords />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all - redirect to login or home */}
            <Route 
              path="*" 
              element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />} 
            />
          </Routes>
        </main>
        {isAuthenticated && <Footer />}
      </div>
    </Router>
  );
}

export default App;
