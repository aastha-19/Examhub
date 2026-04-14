import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../api';

const Dialog = ({ message, onClose, onConfirm, showCancel }) => {
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
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {showCancel && <button className="btn btn-secondary" onClick={onClose} style={{ width: 'auto' }}>Cancel</button>}
          <button className="btn btn-primary" onClick={onConfirm || onClose} style={{ width: 'auto' }}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [dialogState, setDialogState] = useState({ message: null, onConfirm: null, showCancel: false });

  const showDialog = (message, onConfirm = null, showCancel = false) => {
    setDialogState({ message, onConfirm, showCancel });
  };

  const closeDialog = () => setDialogState({ message: null, onConfirm: null, showCancel: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examData = await request(`/api/exams/${id}`);
        setExam(examData);
        const qData = await request(`/api/exams/${id}/questions`);
        setQuestions(qData);
      } catch (err) {
        showDialog("Failed to load exam details.");
      }
    };
    fetchData();
  }, [id]);

  const handleSelectAnswer = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const executeSubmit = async () => {
    closeDialog();
    
    // Extract Student details from Token
    let studentName = "Unknown";
    let studentEmail = "unknown@university.edu";
    const token = localStorage.getItem('token');
    if (token) {
       const { jwtDecode } = await import('jwt-decode');
       const decoded = jwtDecode(token);
       studentName = decoded.name || "Unknown";
       studentEmail = decoded.sub || "unknown@uni.edu";
    }

    const payload = {
        examId: Number(id),
        userId: 1, 
        studentName: studentName,
        studentEmail: studentEmail,
        answers: answers
    };

    try {
        const res = await request('/api/results/submit', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        setResult(res);
    } catch (err) {
        showDialog(err.message);
    }
  };

  const handleSubmit = () => {
    showDialog("Are you sure you want to submit?", executeSubmit, true);
  };

  if (result) {
      return (
          <div className="container" style={{maxWidth: '600px', marginTop: '10vh'}}>
              <div className="glass-panel text-center">
                  <h1 style={{fontSize: '4rem'}}>🏆</h1>
                  <h2>Exam Submitted!</h2>
                  <div className="flex justify-between" style={{marginTop: '2rem', fontSize: '1.2rem'}}>
                      <div><strong>Score:</strong> <span style={{color: 'var(--accent-primary)'}}>{result.score}</span></div>
                      <div><strong>Correct:</strong> <span style={{color: 'var(--success)'}}>{result.correctAnswers}</span></div>
                      <div><strong>Wrong:</strong> <span style={{color: 'var(--danger)'}}>{result.wrongAnswers}</span></div>
                  </div>
                  <button className="btn btn-primary mt-4" onClick={() => navigate('/student')}>Back to Dashboard</button>
              </div>
          </div>
      );
  }

  if (!exam) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <Dialog 
          message={dialogState.message} 
          onConfirm={dialogState.onConfirm} 
          showCancel={dialogState.showCancel} 
          onClose={closeDialog} 
      />

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2>{exam.title}</h2>
          <p>{exam.description}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ color: 'var(--text-secondary)' }}>Questions</div>
           <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{questions.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {questions.map((q, index) => (
          <div key={q.id} className="glass-panel">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{index + 1}. {q.text}</h3>
            
            {q.imageUrl && (
              <img src={q.imageUrl} alt="Question Diagram" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--glass-border)' }} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {['A', 'B', 'C', 'D'].map(opt => {
                const optText = q[`option${opt}`];
                const isSelected = answers[q.id] === opt;
                return (
                  <label key={opt} style={{ 
                      padding: '1rem', border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--glass-border)'}`, 
                      borderRadius: '8px', cursor: 'pointer', background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
                  }}>
                    <input 
                       type="radio" 
                       name={`q-${q.id}`} 
                       checked={isSelected}
                       onChange={() => handleSelectAnswer(q.id, opt)} 
                       style={{ width: 'auto' }}
                    />
                    <span><strong>{opt}:</strong> {optText}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
         <button className="btn btn-primary" onClick={handleSubmit} style={{ width: '200px' }}>Submit Exam</button>
      </div>
    </div>
  );
}
