import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Analyze from './pages/Analyze';
import Recommendations from './pages/Recommendations';
import AnalysisDetail from './pages/AnalysisDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/analyze" element={
                <ProtectedRoute>
                    <Analyze />
                </ProtectedRoute>
            } />
            <Route path="/recommendations" element={
                <ProtectedRoute>
                    <Recommendations />
                </ProtectedRoute>
            } />
            <Route path="/analysis/:id" element={
                <ProtectedRoute>
                    <AnalysisDetail />
                </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

import { ToastProvider } from './context/ToastContext';

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
