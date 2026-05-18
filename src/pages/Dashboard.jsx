import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Circle, Flame, Calendar, CalendarDays, Plus, Trash2, Coffee } from 'lucide-react';
import { useOmni } from '../context/OmniContext';

const Dashboard = () => {
  // --- GLOBAL STATE ---
  const { branches, tasks, toggleTask, addTask, deleteTask, streak, editTaskTime, user } = useOmni();

  // --- POMODORO TIMER STATE ---
  const [customDurationMinutes, setCustomDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      alert(`Awesome job! You focused for ${customDurationMinutes} minutes.`);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, customDurationMinutes]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customDurationMinutes * 60);
  };

  const handleCustomDurationChange = (e) => {
    const mins = parseInt(e.target.value) || 25;
    setCustomDurationMinutes(mins);
    if (!isActive) {
      setTimeLeft(mins * 60);
    }
  };

  // --- BREAK TIMER STATE ---
  const [customBreakMinutes, setCustomBreakMinutes] = useState(5);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60);
  const [isBreakActive, setIsBreakActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isBreakActive && breakTimeLeft > 0) {
      interval = setInterval(() => {
        setBreakTimeLeft((time) => time - 1);
      }, 1000);
    } else if (breakTimeLeft === 0 && isBreakActive) {
      setIsBreakActive(false);
      alert(`Break over! Time to get back to work.`);
    }
    return () => clearInterval(interval);
  }, [isBreakActive, breakTimeLeft]);

  const toggleBreakTimer = () => setIsBreakActive(!isBreakActive);
  const resetBreakTimer = () => {
    setIsBreakActive(false);
    setBreakTimeLeft(customBreakMinutes * 60);
  };

  const handleBreakDurationChange = (e) => {
    const mins = parseInt(e.target.value) || 5;
    setCustomBreakMinutes(mins);
    if (!isBreakActive) {
      setBreakTimeLeft(mins * 60);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatMinsToHrMin = (totalMins) => {
    if (!totalMins) return '0m';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  // --- LOCAL UI STATE ---
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskType, setNewTaskType] = useState('daily');
  const [newTaskBranch, setNewTaskBranch] = useState('');
  const [newTaskHrs, setNewTaskHrs] = useState(0);
  const [newTaskMins, setNewTaskMins] = useState(30);

  // Auto-select first branch when modal opens if none selected
  useEffect(() => {
    if (isAddingTask && branches.length > 0 && !newTaskBranch) {
      setNewTaskBranch(branches[0].id);
    }
  }, [isAddingTask, branches]);

  // Add New Task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    const totalMinutes = (parseInt(newTaskHrs) || 0) * 60 + (parseInt(newTaskMins) || 0);

    addTask({
      title: newTaskInput,
      branchId: newTaskBranch,
      type: newTaskType,
      tentativeTime: totalMinutes > 0 ? totalMinutes : 30 // fallback to 30 if 0
    });

    setNewTaskInput('');
    setNewTaskHrs(0);
    setNewTaskMins(30);
    setIsAddingTask(false);
  };

  // Filter tasks for rendering (exclude archived tasks so they don't clutter the dashboard)
  const dailyTasks = tasks.filter(t => t.type === 'daily' && !t.archived);
  const weeklyTasks = tasks.filter(t => t.type === 'weekly' && !t.archived);

  // Helper to get branch details
  const getBranch = (branchId) => branches.find(b => b.id === branchId) || { name: 'Unknown', color: '#ccc' };

  // Reusable Task Renderer
  const handleEditTime = (taskId, currentTime) => {
    const newTime = window.prompt("Enter new tentative time (in minutes):", currentTime);
    if (newTime && !isNaN(parseInt(newTime))) {
      editTaskTime(taskId, parseInt(newTime));
    }
  };

  const renderTaskList = (taskList) => (
    <div className="task-list">
      {taskList.map(task => {
        const branch = getBranch(task.branchId);
        return (
          <div key={task.id} className="task-item" style={{ opacity: task.done ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            <div className="checkbox" onClick={() => toggleTask(task.id)}>
              {task.done ? <CheckCircle2 color={branch.color} fill={branch.color + '33'} /> : <Circle color="var(--border-color)" />}
            </div>
            <div className="task-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ textDecoration: task.done ? 'line-through' : 'none', margin: 0 }}>{task.title}</h4>
              <span 
                className="text-muted" 
                style={{ fontSize: '0.8rem', cursor: 'pointer', marginTop: '2px', display: 'inline-block' }}
                onClick={(e) => { e.stopPropagation(); handleEditTime(task.id, task.tentativeTime || 0); }}
                title="Click to edit tentative time"
              >
                ⏳ {formatMinsToHrMin(task.tentativeTime)}
              </span>
            </div>
            <div className="branch-tag" style={{ backgroundColor: branch.color }}>
              {branch.name}
            </div>
            <button 
              className="btn-icon" 
              style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}
              onClick={() => deleteTask(task.id)}
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
      {taskList.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>No tasks found.</p>}
    </div>
  );

  // Find the next upcoming incomplete task dynamically for default state
  const firstIncompleteTask = tasks.find(t => !t.done);
  
  // Custom Up Next state
  const [isEditingUpNext, setIsEditingUpNext] = useState(false);
  const [customUpNextText, setCustomUpNextText] = useState('');
  // The displayed text is either the custom text, or the first incomplete task title, or a default string.
  const displayedUpNext = customUpNextText || (firstIncompleteTask ? firstIncompleteTask.title : '🎉 All caught up!');

  // Calculate Ring Data based on Tentative Time
  const sumTentativeTime = (taskList) => taskList.reduce((acc, t) => acc + (t.tentativeTime || 0), 0);
  
  const dailyTotalTime = sumTentativeTime(dailyTasks);
  const dailyDoneTime = sumTentativeTime(dailyTasks.filter(t => t.done));
  
  const weeklyTotalTime = sumTentativeTime(weeklyTasks);
  const weeklyDoneTime = sumTentativeTime(weeklyTasks.filter(t => t.done));

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome back, {user ? user.displayName.split(' ')[0] : 'Guest'} 👋</h1>
        <p>You have a {streak}-day study streak going! <Flame color="var(--color-gate)" size={18} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /></p>
      </header>

      {/* Top Activity Rings */}
      <div className="activity-rings">
        <div className="card ring-card">
          <div className="ring-chart" style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(var(--color-gate) ${(dailyDoneTime / Math.max(dailyTotalTime, 1)) * 100}%, var(--bg-color) 0)` }}></div>
          <div className="ring-info">
            <h4>Daily Volume</h4>
            <p className="value">{Math.floor(dailyDoneTime/60)}h {dailyDoneTime%60}m</p>
          </div>
        </div>
        <div className="card ring-card">
          <div className="ring-chart" style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(var(--color-placement) ${(tasks.filter(t => t.done && t.type === 'daily').length / Math.max(dailyTasks.length, 1)) * 100}%, var(--bg-color) 0)` }}></div>
          <div className="ring-info">
            <h4>Daily Tasks</h4>
            <p className="value">{tasks.filter(t => t.done && t.type === 'daily').length} / {dailyTasks.length}</p>
          </div>
        </div>
        <div className="card ring-card">
          <div className="ring-chart" style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(var(--color-research) ${(tasks.filter(t => t.done && t.type === 'weekly').length / Math.max(weeklyTasks.length, 1)) * 100}%, var(--bg-color) 0)` }}></div>
          <div className="ring-info">
            <h4>Weekly Tasks</h4>
            <p className="value">{tasks.filter(t => t.done && t.type === 'weekly').length} / {weeklyTasks.length}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Dual Timelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Daily Timeline */}
          <div className="card timeline-card">
            <div className="timeline-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar color="var(--color-placement)" size={24} />
                <h2 style={{ margin: 0 }}>Today's Focus</h2>
              </div>
              <button className="btn btn-primary" onClick={() => { setIsAddingTask(true); setNewTaskType('daily'); }}>
                <Plus size={16} /> Add Daily
              </button>
            </div>
            {renderTaskList(dailyTasks)}
          </div>

          {/* Weekly Timeline */}
          <div className="card timeline-card">
            <div className="timeline-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarDays color="var(--color-research)" size={24} />
                <h2 style={{ margin: 0 }}>This Week's Macro Goals</h2>
              </div>
              <button className="btn btn-primary" style={{ background: 'var(--color-research)' }} onClick={() => { setIsAddingTask(true); setNewTaskType('weekly'); }}>
                <Plus size={16} /> Add Weekly
              </button>
            </div>
            {renderTaskList(weeklyTasks)}
          </div>

        </div>

        {/* Right Column: Widgets */}
        <div className="widget-sidebar">
          {/* Pomodoro Timer */}
          <div className="card pomodoro-card">
            <h3>Focus Timer</h3>
            <p className="text-muted">Stay in the zone.</p>
            
            <div className="timer-display">
              {formatTime(timeLeft)}
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Duration (min):</label>
              <input 
                type="number" 
                value={customDurationMinutes} 
                onChange={handleCustomDurationChange}
                disabled={isActive}
                min="1"
                max="120"
                style={{ width: '60px', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }}
              />
            </div>
            
            <div className="timer-controls">
              <button className="btn-icon" onClick={resetTimer}>
                <RotateCcw size={20} />
              </button>
              <button className={`btn-icon ${isActive ? '' : 'play'}`} onClick={toggleTimer}>
                {isActive ? <Pause size={24} /> : <Play size={24} fill="white" />}
              </button>
            </div>
          </div>

          {/* Break Timer Mini Card */}
          <div className="card pomodoro-card" style={{ background: 'var(--bg-color)', border: '1px dashed var(--border-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Coffee size={18} /> Break Timer
            </h3>
            
            <div className="timer-display" style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
              {formatTime(breakTimeLeft)}
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Min:</label>
              <input 
                type="number" 
                value={customBreakMinutes} 
                onChange={handleBreakDurationChange}
                disabled={isBreakActive}
                min="1"
                max="60"
                style={{ width: '50px', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem' }}
              />
            </div>
            
            <div className="timer-controls">
              <button className="btn-icon" onClick={resetBreakTimer} style={{ width: 36, height: 36 }}>
                <RotateCcw size={16} />
              </button>
              <button className={`btn-icon ${isBreakActive ? '' : 'play'}`} onClick={toggleBreakTimer} style={{ width: 36, height: 36, background: isBreakActive ? 'var(--card-bg)' : 'var(--text-secondary)' }}>
                {isBreakActive ? <Pause size={18} /> : <Play size={18} fill="white" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Task Modal Overlay */}
      {isAddingTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1rem' }}>Add New {newTaskType === 'daily' ? 'Daily' : 'Weekly'} Task</h3>
            <form onSubmit={handleAddTask}>
              <input 
                type="text" 
                autoFocus
                placeholder="What do you need to do?" 
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <select 
                  value={newTaskBranch} 
                  onChange={(e) => setNewTaskBranch(e.target.value)}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'inherit', background: 'var(--bg-color)' }}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 0.5rem', background: 'var(--bg-color)' }}>
                    <input 
                      type="number" 
                      value={newTaskHrs} 
                      onChange={(e) => setNewTaskHrs(e.target.value)}
                      min="0"
                      max="23"
                      style={{ width: '40px', border: 'none', background: 'transparent', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>h</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 0.5rem', background: 'var(--bg-color)' }}>
                    <input 
                      type="number" 
                      value={newTaskMins} 
                      onChange={(e) => setNewTaskMins(e.target.value)}
                      min="0"
                      max="59"
                      style={{ width: '40px', border: 'none', background: 'transparent', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>m</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setIsAddingTask(false)} style={{ background: 'var(--bg-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
