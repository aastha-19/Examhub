import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { jwtDecode } from 'jwt-decode';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'results'
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const examsData = await request('/api/exams');
        setExams(examsData);

        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          const userId = decoded.userId || 1;
          const resultsData = await request(`/api/results/user/${userId}`);
          setResults(resultsData);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const subjects = [...new Set(exams.map(e => e.subject || 'Uncategorized'))];

  // Map result examId to exam data for display
  const richResults = results.map(res => {
    const examMatch = exams.find(e => e.id === res.examId);
    return {
      ...res,
      examTitle: examMatch ? examMatch.title : 'Unknown Exam',
      examSubject: examMatch ? examMatch.subject : 'Unknown Subject'
    };
  }).sort((a, b) => b.id - a.id); // roughly sort by latest if no date, or we can use attemptedAt

  const formatDateTime = (dateVal) => {
    if (!dateVal) return "N/A";
    // Spring Boot may return an array [yyyy, MM, dd, HH, mm, ss] or an ISO string
    if (Array.isArray(dateVal)) {
      const [y, m, d, h, min] = dateVal;
      return new Date(y, m-1, d, h, min).toLocaleString();
    }
    return new Date(dateVal).toLocaleString();
  };

  const getPassStatus = (res) => {
    // Arbitrary pass logic: score >= totalQuestions / 2 assuming 1 point each, 
    // or simply > 40% of max possible. We will just check correctAnswers vs total.
    const percentage = (res.correctAnswers / res.totalQuestions) * 100;
    return percentage >= 50 ? { label: 'Passed', color: 'var(--success)' } : { label: 'Needs Improvement', color: 'var(--danger)' };
  };

  if (loading) {
    return (
      <div className="container text-center" style={{ marginTop: '10vh' }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--glass-border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('subjects')}
          style={{
            background: 'transparent', border: 'none', padding: '1rem 2rem', cursor: 'pointer',
            fontSize: '1.2rem', fontWeight: '600',
            color: activeTab === 'subjects' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'subjects' ? '3px solid var(--accent-primary)' : '3px solid transparent'
          }}
        >
          Explore Subjects
        </button>
        <button 
          onClick={() => setActiveTab('results')}
          style={{
            background: 'transparent', border: 'none', padding: '1rem 2rem', cursor: 'pointer',
            fontSize: '1.2rem', fontWeight: '600',
            color: activeTab === 'results' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'results' ? '3px solid var(--accent-primary)' : '3px solid transparent'
          }}
        >
          My Results
        </button>
      </div>

      {activeTab === 'subjects' && (
        <>
          {!selectedSubject ? (
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Available Subjects</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Select a subject category below to view and undertake available exams.</p>
              
              <div className="dashboard-grid mt-4">
                {subjects.map(sub => (
                  <div key={sub} className="glass-panel" 
                    style={{ 
                      cursor: 'pointer', textAlign: 'center', padding: '3rem',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }} 
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(59,130,246,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.37)'; }}
                    onClick={() => setSelectedSubject(sub)}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'inline-block', background: 'rgba(59,130,246,0.2)', padding: '1rem', borderRadius: '50%' }}>
                      📚
                    </div>
                    <h3>{sub}</h3>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginTop: '0.5rem' }}>
                       {exams.filter(e => (e.subject || 'Uncategorized') === sub).length} Exams
                    </div>
                  </div>
                ))}
                {subjects.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)' }}>No subjects are currently published.</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <button className="btn btn-secondary mb-4" onClick={() => setSelectedSubject(null)} style={{width: 'auto', padding: '0.5rem 1rem'}}>
                ⬅ Back to Subjects
              </button>
              
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{selectedSubject} Exams</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Ready to test your knowledge? Select an exam to begin.</p>
              
              <div className="dashboard-grid">
                {exams.filter(e => (e.subject || 'Uncategorized') === selectedSubject).map(exam => (
                  <div key={exam.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem' }}>{exam.title}</h3>
                    <p className="mt-4" style={{ flex: 1 }}>{exam.description}</p>
                    
                    <div className="flex justify-between items-center mt-4" style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Duration</div>
                        <div style={{ fontWeight: '600' }}>{exam.durationMinutes} mins</div>
                      </div>
                      <div className="text-center">
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Marks</div>
                        <div style={{ fontWeight: '600' }}><span style={{color: 'var(--success)'}}>+{exam.positiveMarksPerQuestion}</span> / <span style={{color:'var(--danger)'}}>-{exam.negativeMarksPerQuestion}</span></div>
                      </div>
                    </div>

                    <button 
                        className="btn btn-primary mt-4" 
                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                        style={{ width: '100%', padding: '1rem' }}
                    >
                      Start Exam
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'results' && (
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>My Results</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>A detailed breakdown of all your attempted examinations.</p>
          
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Exam Name</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Subject</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Date Attempted</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Score</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Correct</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {richResults.length === 0 && (
                     <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>You haven't attempted any exams yet.</td></tr>
                  )}
                  {richResults.map(res => {
                    const status = getPassStatus(res);
                    return (
                      <tr key={res.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{res.examTitle}</td>
                        <td style={{ padding: '1rem' }}>{res.examSubject}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{formatDateTime(res.attemptedAt)}</td>
                        <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>{res.score}</td>
                        <td style={{ padding: '1rem', color: 'var(--success)' }}>{res.correctAnswers} / {res.totalQuestions}</td>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: status.color }}>{status.label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
