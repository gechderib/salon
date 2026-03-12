import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SalonDetail from './components/SalonDetail';
import Profile from './components/Profile';
import MyBookings from './components/MyBookings';
import AdminDashboard from './components/AdminDashboard';
import { User, LogOut, Scissors, Menu, X, Briefcase } from 'lucide-react';
import './App.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100 transform group-hover:rotate-12 transition-transform">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tighter">GLAM<span className="text-indigo-600">HUB</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Explore</Link>
              {user.is_customer && <Link to="/my-bookings" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">My Bookings</Link>}
              <Link to="/profile" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Profile</Link>
              {user.is_business && (
                <Link to="/admin" className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-100 transition-all">
                  <Briefcase className="w-4 h-4" />
                  Business Hub
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all group/user">
              {user.profile_picture ? (
                <img src={user.profile_picture as string} className="w-8 h-8 rounded-full border border-indigo-100" />
              ) : (
                <User className="w-5 h-5 text-indigo-400 group-hover/user:text-indigo-600 transition-colors" />
              )}
              <span className="text-sm font-black text-gray-900 group-hover/user:text-indigo-600 transition-colors">{user.username}</span>
            </Link>
            <button
              onClick={logout}
              className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-500">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <Link to="/" onClick={() => setIsOpen(false)} className="block font-bold text-gray-900">Explore</Link>
          {user.is_customer && <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="block font-bold text-gray-900">My Bookings</Link>}
          <Link to="/profile" onClick={() => setIsOpen(false)} className="block font-bold text-gray-900">Profile</Link>
          {user.is_business && <Link to="/admin" onClick={() => setIsOpen(false)} className="block font-bold text-indigo-600">Business Hub</Link>}
          <button onClick={logout} className="w-full text-left font-bold text-rose-500 pt-4 border-t border-gray-50">Sign Out</button>
        </div>
      )}
    </nav>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-[#fafafa]">
            <Navigation />
            <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/salon/:id" element={<ProtectedRoute><SalonDetail /></ProtectedRoute>} />
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
