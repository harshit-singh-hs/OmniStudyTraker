import React, { useState, useEffect } from 'react';
import { useOmni } from '../context/OmniContext';
import { Target, Clock, Image as ImageIcon, Columns, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const VisionBoard = () => {
  const { 
    branches, 
    countdowns, setCountdowns, 
    macroGoals, setMacroGoals, 
    projects, setProjects 
  } = useOmni();

  // --- LIVE COUNTDOWN LOGIC ---
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeLeft = (targetDate) => {
    const difference = new Date(targetDate) - now;
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  // Helper to get branch
  const getBranch = (bId) => branches.find(b => b.id === bId) || { name: 'Unknown', color: '#ccc' };

  // --- ACTIONS ---
  const addCountdown = () => {
    const title = window.prompt("Event Name (e.g. GATE 2027):");
    if (!title) return;
    const dateStr = window.prompt("Target Date (YYYY-MM-DD):");
    if (!dateStr || isNaN(new Date(dateStr))) return alert("Invalid Date");
    setCountdowns([...countdowns, { id: Date.now().toString(), title, date: new Date(dateStr).toISOString() }]);
  };

  const addMacroGoal = () => {
    const title = window.prompt("Macro Goal:");
    if (!title) return;
    const imageUrl = window.prompt("Image URL (optional, leave blank for color gradient):") || '';
    setMacroGoals([...macroGoals, { id: Date.now().toString(), title, branchId: branches[0]?.id, imageUrl, progress: 0 }]);
  };

  const updateMacroGoalProgress = (id, newProgress) => {
    setMacroGoals(prev => prev.map(g => g.id === id ? { ...g, progress: newProgress } : g));
  };

  const addProject = () => {
    const title = window.prompt("Project Name:");
    if (!title) return;
    setProjects([...projects, { id: Date.now().toString(), title, branchId: branches[0]?.id, status: 'todo' }]);
  };

  const moveProject = (id, newStatus) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const deleteItem = (type, id) => {
    if (type === 'countdown') setCountdowns(prev => prev.filter(i => i.id !== id));
    if (type === 'goal') setMacroGoals(prev => prev.filter(i => i.id !== id));
    if (type === 'project') setProjects(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header className="dashboard-header">
        <h1><Target style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} /> Vision Board</h1>
        <p>Keep your eyes on the horizon.</p>
      </header>

      {/* 1. LIVE COUNTDOWNS */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Clock color="var(--color-gate)" /> Event Countdowns
          </h2>
          <button className="btn btn-primary" onClick={addCountdown}><Plus size={16} /> Add Event</button>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {countdowns.map(cd => {
            const left = calculateTimeLeft(cd.date);
            return (
              <div key={cd.id} className="card" style={{ flex: '1 1 300px', background: 'var(--card-bg)', borderTop: '4px solid var(--color-gate)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>{cd.title}</h3>
                  <button className="btn-icon" onClick={() => deleteItem('countdown', cd.id)}><Trash2 size={16} /></button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', textAlign: 'center' }}>
                  <div style={{ flex: 1, background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{left.days}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Days</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{left.hours}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Hrs</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{left.minutes}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mins</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-gate)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{left.seconds}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Secs</div>
                  </div>
                </div>
                <p style={{ margin: '1rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Target: {new Date(cd.date).toDateString()}
                </p>
              </div>
            );
          })}
          {countdowns.length === 0 && <p className="text-muted">No active countdowns.</p>}
        </div>
      </section>

      {/* 2. MACRO GOALS */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <ImageIcon color="var(--color-research)" /> Macro Goals
          </h2>
          <button className="btn btn-primary" style={{ background: 'var(--color-research)' }} onClick={addMacroGoal}>
            <Plus size={16} /> Add Goal
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {macroGoals.map(goal => {
            const branch = getBranch(goal.branchId);
            const currentProgress = goal.progress || 0;
            return (
              <div key={goal.id} className="card" style={{ 
                padding: 0, overflow: 'hidden', position: 'relative', minHeight: '200px', display: 'flex', flexDirection: 'column' 
              }}>
                {goal.imageUrl ? (
                  <div style={{ height: '120px', backgroundImage: `url(${goal.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ) : (
                  <div style={{ height: '120px', background: `linear-gradient(135deg, ${branch.color}88, ${branch.color})` }} />
                )}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{goal.title}</h3>
                    <div className="branch-tag" style={{ backgroundColor: branch.color }}>{branch.name}</div>
                  </div>
                  
                  {/* Progress Tracker inside Macro Goals */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <span>Progress</span>
                      <span>{currentProgress}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={currentProgress} 
                      onChange={(e) => updateMacroGoalProgress(goal.id, parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: branch.color, cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-icon" onClick={() => deleteItem('goal', goal.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}
          {macroGoals.length === 0 && <p className="text-muted">No macro goals set yet.</p>}
        </div>
      </section>

      {/* 3. PROJECT PROGRESS */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Columns color="var(--color-placement)" /> Project Progress
          </h2>
          <button className="btn btn-primary" style={{ background: 'var(--color-placement)' }} onClick={addProject}>
            <Plus size={16} /> Add Project
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {/* TO DO */}
          <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>To Do</span>
              <span style={{ color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                {projects.filter(p => p.status === 'todo').length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.filter(p => p.status === 'todo').map(p => {
                const branch = getBranch(p.branchId);
                return (
                  <div key={p.id} style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${branch.color}` }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{p.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="branch-tag" style={{ backgroundColor: branch.color, fontSize: '0.7rem' }}>{branch.name}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => deleteItem('project', p.id)}><Trash2 size={14} /></button>
                        <button className="btn-icon" onClick={() => moveProject(p.id, 'doing')}><ArrowRight size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IN PROGRESS */}
          <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', color: 'var(--color-placement)' }}>
              <span>In Progress</span>
              <span style={{ color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                {projects.filter(p => p.status === 'doing').length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.filter(p => p.status === 'doing').map(p => {
                const branch = getBranch(p.branchId);
                return (
                  <div key={p.id} style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${branch.color}` }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{p.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="branch-tag" style={{ backgroundColor: branch.color, fontSize: '0.7rem' }}>{branch.name}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => moveProject(p.id, 'todo')}><ArrowLeft size={14} /></button>
                        <button className="btn-icon" onClick={() => deleteItem('project', p.id)}><Trash2 size={14} /></button>
                        <button className="btn-icon" onClick={() => moveProject(p.id, 'done')}><ArrowRight size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DONE */}
          <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', color: 'var(--color-academics)' }}>
              <span>Done</span>
              <span style={{ color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                {projects.filter(p => p.status === 'done').length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.filter(p => p.status === 'done').map(p => {
                const branch = getBranch(p.branchId);
                return (
                  <div key={p.id} style={{ opacity: 0.7, background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${branch.color}` }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', textDecoration: 'line-through' }}>{p.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="branch-tag" style={{ backgroundColor: branch.color, fontSize: '0.7rem' }}>{branch.name}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => moveProject(p.id, 'doing')}><ArrowLeft size={14} /></button>
                        <button className="btn-icon" onClick={() => deleteItem('project', p.id)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default VisionBoard;
