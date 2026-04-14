import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadExams = async () => {
      try {
        const data = await request('/api/exams');
        setExams(data);
      } catch (err) {
        console.error("Failed to load exams", err);
      }
    };
    loadExams();
  }, []);

  const subjects = [...new Set(exams.map(e => e.subject || 'Uncategorized'))];

  if (!selectedSubject) {
    return (
      <div className="container">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Available Subjects</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Select a subject folder below to view available exams.</p>
        
        <div className="dashboard-grid mt-4">
          {subjects.map(sub => (
            <div key={sub} className="glass-panel" style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem' }} onClick={() => setSelectedSubject(sub)}>
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</h1>
              <h3>{sub}</h3>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                 {exams.filter(e => (e.subject || 'Uncategorized') === sub).length} Exams
              </div>
            </div>
          ))}
          {subjects.length === 0 && (
            <div style={{ color: 'var(--text-secondary)' }}>No subjects are currently published.</div>
          )}
        </div>
      </div>
    );
  }

  const filteredExams = exams.filter(e => (e.subject || 'Uncategorized') === selectedSubject);

  return (
    <div className="container">
      <button className="btn btn-secondary mb-4" onClick={() => setSelectedSubject(null)} style={{width: 'auto', padding: '0.5rem 1rem'}}>
        ⬅ Back to Subjects
      </button>
      
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{selectedSubject} Exams</h2>
      
      <div className="dashboard-grid">
        {filteredExams.map(exam => (
          <div key={exam.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3>{exam.title}</h3>
            <p className="mt-4" style={{ flex: 1 }}>{exam.description}</p>
            
            <div className="flex justify-between items-center mt-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
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
                style={{ width: '100%' }}
            >
              Start Exam
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
