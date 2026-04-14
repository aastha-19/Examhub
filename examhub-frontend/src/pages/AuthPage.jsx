import { useState } from 'react';
import { request } from '../api';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export default function AuthPage({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '', sapid: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin) {
        if (!formData.role) {
            return setError("Please select a role.");
        }
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match!");
        }
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
        if (!passwordRegex.test(formData.password)) {
            return setError("Password must contain at least one number and one special character (!@#$%^&*).");
        }
    }

    try {
      if (isLogin) {
        const token = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        onAuth(token);
      } else {
        await request('/auth/register', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        // Auto login after register
        const token = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        onAuth(token);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
  return (
    <div className="container flex items-center justify-between" style={{ height: '100vh', padding: '0', position: 'relative' }}>
      {/* Theme Toggle Floating Button */}
      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
         <button onClick={toggleTheme} className="btn btn-secondary" style={{padding: '0.5rem', border: 'none', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', fontSize: '1.5rem', width: 'auto', borderRadius: '50%'}} title="Toggle Theme">
            {isDarkMode ? '🌞' : '🌙'}
         </button>
      </div>

      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '4rem', lineHeight: '1.2' }}>Master Your<br/>Future with ExamHub</h1>
        <p style={{ fontSize: '1.2rem', marginTop: '1rem', maxWidth: '400px' }}>
          The premium platform for educators and students to seamlessly conduct and take examinations.
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
          <h2 className="text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          
          {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', lineHeight: '1.4' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" required placeholder="Enter your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
            )}
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required placeholder="Enter your college email id" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Password</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  required placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginTop: '20px', padding: '0.4rem' }}>
                  {showPassword ? <EyeIcon/> : <EyeOffIcon/>}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" required placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value, sapid: ''})} required>
                    <option value="" disabled>Select</option>
                    <option value="ROLE_STUDENT">Student</option>
                    <option value="ROLE_TEACHER">Teacher</option>
                  </select>
                </div>
                
                {formData.role === 'ROLE_STUDENT' && (
                  <div className="form-group">
                    <label>SAP ID</label>
                    <input type="text" required placeholder="Enter your SAPID" value={formData.sapid} onChange={e => setFormData({...formData, sapid: e.target.value})} />
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn btn-primary mt-4">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}>
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
