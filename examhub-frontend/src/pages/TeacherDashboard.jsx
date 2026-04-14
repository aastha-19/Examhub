import { useState, useEffect } from 'react';
import { request } from '../api';

const Dialog = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ minWidth: '300px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Notice</h3>
        <p style={{ marginBottom: '1.5rem' }}>{message}</p>
        <button className="btn btn-primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

// Results Modal Component
const ResultsModal = ({ results, onClose, examTitle }) => {
  if (!results) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontSize: '1.5rem' }}>Analytics & Leaderboard: {examTitle}</h3>
            <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.4rem 1rem' }} onClick={onClose}>Close</button>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <div className="glass-panel text-center" style={{ flex: 1, padding: '1rem' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Total Participants</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{results.analytics?.totalParticipants || 0}</div>
            </div>
            <div className="glass-panel text-center" style={{ flex: 1, padding: '1rem' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Average Score</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{results.analytics?.averageScore || 0}</div>
            </div>
        </div>

        <h4 className="mb-2">🏆 Top 10 Leaderboard</h4>
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Rank</th>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Student Name</th>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Correct</th>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {(!results.leaderboard || results.leaderboard.length === 0) && (
                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No submissions yet.</td></tr>
                    )}
                    {results.leaderboard && results.leaderboard.map((res, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)', background: i===0?'rgba(255,215,0,0.1)':'transparent' }}>
                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{i+1}</td>
                            <td style={{ padding: '1rem' }}><strong>{res.studentName || 'Unknown'}</strong></td>
                            <td style={{ padding: '1rem', color: 'var(--success)' }}>{res.correctAnswers}</td>
                            <td style={{ padding: '1rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{res.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [newExam, setNewExam] = useState({ title: '', subject: '', description: '', durationMinutes: 60, positiveMarksPerQuestion: 1, negativeMarksPerQuestion: 0.25 });
  const [selectedExam, setSelectedExam] = useState(null);
  const [dialogMessage, setDialogMessage] = useState(null);
  
  // Categorization
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Results Analytics
  const [examResults, setExamResults] = useState(null);
  const [viewingResultsExamName, setViewingResultsExamName] = useState("");
  
  // Question Form
  const [newQuestion, setNewQuestion] = useState({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', questionType: 'MULTIPLE_CHOICE' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await request('/api/exams');
      setExams(data);
    } catch (e) {
      setDialogMessage("Failed to load exams");
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await request('/api/exams/create', { method: 'POST', body: JSON.stringify(newExam) });
      setDialogMessage("Exam Created!");
      setNewExam({...newExam, title: '', description: ''})
      loadExams();
    } catch (err) {
      setDialogMessage(err.message);
    }
  };

  const handleDeleteExam = async (examId, e) => {
    e.stopPropagation(); // Prevents selection
    try {
      await request(`/api/exams/${examId}`, { method: 'DELETE' });
      setDialogMessage("Exam Deleted!");
      if (selectedExam?.id === examId) setSelectedExam(null);
      loadExams();
    } catch (err) {
      setDialogMessage(err.message);
    }
  };

  const handleViewResults = async (exam, e) => {
      e.stopPropagation();
      try {
          const res = await request(`/api/results/exam/${exam.id}`);
          const analyticsResponse = await request(`/api/results/exam/${exam.id}/analytics`);
          const leaderboardResponse = await request(`/api/results/exam/${exam.id}/leaderboard`);

          setExamResults({
              all: res,
              analytics: analyticsResponse,
              leaderboard: leaderboardResponse
          });
          setViewingResultsExamName(exam.title);
      } catch (err) {
          setDialogMessage("Failed to fetch results: " + err.message);
      }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const qData = await request(`/api/exams/${selectedExam.id}/questions`, {
        method: 'POST', body: JSON.stringify(newQuestion)
      });
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        await request(`/api/exams/questions/${qData.id}/image`, {
          method: 'POST',
          body: formData
        });
      }
      
      setDialogMessage("Question Added Successfully!");
      setNewQuestion({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', questionType: 'MULTIPLE_CHOICE' });
      setImageFile(null);
      
    } catch (err) {
      setDialogMessage("Failed to add question: " + err.message);
    }
  };

  const subjects = [...new Set(exams.map(e => e.subject || 'Uncategorized'))];
  const filteredExams = exams.filter(e => (e.subject || 'Uncategorized') === selectedSubject);

  return (
    <div className="container">
      <Dialog message={dialogMessage} onClose={() => setDialogMessage(null)} />
      <ResultsModal results={examResults} onClose={() => setExamResults(null)} examTitle={viewingResultsExamName} />
      
      <div className="flex justify-between items-center mb-4">
        <h2>Teacher Dashboard</h2>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Exam Management */}
        <div style={{ flex: 1 }}>
          <div className="glass-panel">
            <h3>Create New Exam</h3>
            <form onSubmit={handleCreateExam} className="mt-4">
              <div className="flex gap-4">
                <div className="form-group" style={{ flex: 1}}>
                  <input placeholder="Title" required value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1}}>
                  <input placeholder="Subject" required value={newExam.subject} onChange={e => setNewExam({...newExam, subject: e.target.value})} />
                </div>
              </div>
              
              <div className="form-group">
                <textarea placeholder="Description" required value={newExam.description} onChange={e => setNewExam({...newExam, description: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="form-group" style={{ flex: 1 }}>
                    <label>Duration (mins)</label>
                    <input type="number" required value={newExam.durationMinutes} onChange={e => setNewExam({...newExam, durationMinutes: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>+ Marks</label>
                    <input type="number" step="0.1" required value={newExam.positiveMarksPerQuestion} onChange={e => setNewExam({...newExam, positiveMarksPerQuestion: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>- Marks</label>
                    <input type="number" step="0.1" required value={newExam.negativeMarksPerQuestion} onChange={e => setNewExam({...newExam, negativeMarksPerQuestion: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Publish Exam</button>
            </form>
          </div>

          <h3 className="mt-4 mb-4">Your Exams</h3>
          
          {!selectedSubject ? (
            <div className="dashboard-grid">
               {subjects.map(sub => (
                   <div key={sub} className="glass-panel text-center" style={{cursor: 'pointer', padding: '2rem'}} onClick={() => setSelectedSubject(sub)}>
                       <h1>📁</h1>
                       <h3>{sub}</h3>
                       <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{exams.filter(e=>(e.subject || 'Uncategorized') === sub).length} Exams</p>
                   </div>
               ))}
               {subjects.length === 0 && <p>No exams created yet.</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-secondary mb-2" onClick={() => { setSelectedSubject(null); setSelectedExam(null); }} style={{width: 'auto', padding: '0.5rem'}}>⬅ Back to Map</button>
              {filteredExams.map(exam => (
                <div key={exam.id} className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer', border: selectedExam?.id === exam.id ? '2px solid var(--accent-primary)' : '' }} onClick={() => setSelectedExam(exam)}>
                  <div className="flex justify-between items-center">
                    <h4>{exam.title}</h4>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.8rem' }}
                        onClick={(e) => handleViewResults(exam, e)}
                        >
                        📊 Results
                        </button>
                        <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.8rem' }}
                        onClick={(e) => handleDeleteExam(exam.id, e)}
                        >
                        ❌ Delete
                        </button>
                    </div>
                  </div>
                  <p>{exam.description}</p>
                  <div className="flex gap-4 mt-4" style={{ fontSize: '0.8rem' }}>
                     <span>⏱️ {exam.durationMinutes} mins</span>
                     <span style={{color: 'var(--success)'}}>+{exam.positiveMarksPerQuestion}</span>
                     <span style={{color: 'var(--danger)'}}>-{exam.negativeMarksPerQuestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Management */}
        <div style={{ flex: 1 }}>
          {selectedExam ? (
            <div className="glass-panel">
              <h3>Add Question to "{selectedExam.title}"</h3>
              <form onSubmit={handleAddQuestion} className="mt-4">
                <div className="form-group">
                  <textarea placeholder="Question Text..." required value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} />
                </div>
                <div className="form-group flex gap-4">
                   <div style={{flex: 1}}><input placeholder="Option A" required value={newQuestion.optionA} onChange={e=>setNewQuestion({...newQuestion, optionA: e.target.value})} /></div>
                   <div style={{flex: 1}}><input placeholder="Option B" required value={newQuestion.optionB} onChange={e=>setNewQuestion({...newQuestion, optionB: e.target.value})} /></div>
                </div>
                <div className="form-group flex gap-4">
                   <div style={{flex: 1}}><input placeholder="Option C" required value={newQuestion.optionC} onChange={e=>setNewQuestion({...newQuestion, optionC: e.target.value})} /></div>
                   <div style={{flex: 1}}><input placeholder="Option D" required value={newQuestion.optionD} onChange={e=>setNewQuestion({...newQuestion, optionD: e.target.value})} /></div>
                </div>
                <div className="form-group">
                  <label>Correct Option</label>
                  <select value={newQuestion.correctOption} onChange={e => setNewQuestion({...newQuestion, correctOption: e.target.value})}>
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                   <label>Attach Diagram (Optional)</label>
                   <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ background: 'transparent', border: 'none', padding: 0 }} />
                </div>

                <button type="submit" className="btn btn-secondary mt-4">Add Question</button>
              </form>
            </div>
          ) : (
            <div className="glass-panel text-center" style={{ padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
               {selectedSubject ? 'Select an exam from the list to start adding questions!' : 'Select a subject first to view and manage its exams.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
