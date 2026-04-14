import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthPage from './pages/AuthPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TakeExam from './pages/TakeExam';

function App() {
  const [user, setUser] = useState(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ name: decoded.name || decoded.sub, role: decoded.role });
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleAuth = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setUser({ name: decoded.name || decoded.sub, role: decoded.role });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
    return (
      <>
        <nav className="navbar">
          <h2>ExamHub</h2>
          <div className="nav-links" style={{alignItems: 'center'}}>
            <button onClick={toggleTheme} className="btn btn-secondary" style={{padding: '0.4rem', border: 'none', background: 'transparent', fontSize: '1.2rem', width: 'auto'}} title="Toggle Theme">
               {isDarkMode ? '🌞' : '🌙'}
            </button>
            <span style={{color: 'var(--text-secondary)'}}>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{padding: '0.4rem 1rem', width: 'auto'}}>Logout</button>
          </div>
        </nav>
        {children}
      </>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <AuthPage onAuth={handleAuth} /> : <Navigate to={user.role === 'ROLE_TEACHER' ? '/teacher' : '/student'} />} />
        
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student/exam/:id" element={
          <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
            <TakeExam />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
