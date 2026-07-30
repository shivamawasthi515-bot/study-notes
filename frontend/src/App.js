import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SubjectPage from './pages/SubjectPage';
import Dashboard from './pages/Dashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSubjects from './pages/admin/ManageSubjects';
import CreateSubject from './pages/admin/CreateSubject';
import UploadNote from './pages/admin/UploadNote';
import AddVideo from './pages/admin/AddVideo';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/subjects/:id" element={<SubjectPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/payment/success"
          element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/subjects"
          element={<ProtectedRoute adminOnly><ManageSubjects /></ProtectedRoute>}
        />
        <Route
          path="/admin/subjects/new"
          element={<ProtectedRoute adminOnly><CreateSubject /></ProtectedRoute>}
        />
        <Route
          path="/admin/subjects/:id/edit"
          element={<ProtectedRoute adminOnly><CreateSubject /></ProtectedRoute>}
        />
        <Route
          path="/admin/subjects/:id/upload-note"
          element={<ProtectedRoute adminOnly><UploadNote /></ProtectedRoute>}
        />
        <Route
          path="/admin/subjects/:id/add-video"
          element={<ProtectedRoute adminOnly><AddVideo /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
