import React, { useState } from 'react';
import { useOmni } from '../context/OmniContext';
import { Layers, Plus, Trash2, Undo2, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const Branches = () => {
  const { branches, addBranch, deleteBranch, trash, restoreFromTrash, permanentlyDeleteFromTrash } = useOmni();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchColor, setNewBranchColor] = useState('#e28743');

  // Available theme colors for selection
  const colorOptions = [
    { name: 'Terracotta', hex: '#e28743' },
    { name: 'Sage Green', hex: '#7a9e7e' },
    { name: 'Dusty Rose', hex: '#c98888' },
    { name: 'Warm Camel', hex: '#d4a373' },
    { name: 'Ocean Blue', hex: '#4299e1' },
    { name: 'Slate Gray', hex: '#718096' },
  ];

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    addBranch(newBranchName, newBranchColor);
    setNewBranchName('');
    setIsAdding(false);
  };

  // Only show branch trash items
  const branchTrash = trash.filter(item => item.type === 'branch');

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1><Layers style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} /> Your Branches</h1>
          <p>Manage your life domains here.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> New Branch
        </button>
      </header>

      {/* Active Branches Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {branches.map(branch => (
          <div key={branch.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `4px solid ${branch.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: branch.color }}></div>
              <h3 style={{ margin: 0 }}>{branch.name}</h3>
            </div>
            
            <button 
              className="btn-icon" 
              style={{ width: 36, height: 36, border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}
              onClick={() => {
                if(window.confirm(`Are you sure you want to delete ${branch.name}? It will be moved to the Trash Bin for 90 days.`)) {
                  deleteBranch(branch.id);
                }
              }}
              title="Delete to Trash"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {branches.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No active branches found. Create one to get started!
          </div>
        )}
      </div>

      {/* 90-Day Trash Bin Section */}
      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Trash2 size={20} /> 90-Day Trash Bin
        </h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Items here are permanently deleted after 90 days.</p>
        
        {branchTrash.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.02)', borderStyle: 'dashed' }}>
            <p className="text-muted" style={{ margin: 0 }}>Trash is empty.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {branchTrash.map(item => {
              const daysLeft = 90 - differenceInDays(new Date(), new Date(item.deletedAt));
              
              return (
                <div key={item.data.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', opacity: 0.8 }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', textDecoration: 'line-through' }}>{item.data.name}</h4>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} color="var(--color-danger)" /> 
                      Deleted on {format(new Date(item.deletedAt), 'MMM dd, yyyy')} — Permanently erasing in {daysLeft} days
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn" 
                      style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      onClick={() => restoreFromTrash(item.data.id)}
                    >
                      <Undo2 size={16} /> Restore
                    </button>
                    <button 
                      className="btn" 
                      style={{ background: 'var(--bg-color)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)' }}
                      onClick={() => {
                        if(window.confirm(`Permanently delete ${item.data.name}? This cannot be undone.`)) {
                          permanentlyDeleteFromTrash(item.data.id);
                        }
                      }}
                      title="Delete Permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      {isAdding && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Branch</h3>
            <form onSubmit={handleAddBranch}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Branch Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="e.g., Fitness, Coding, Side Hustle" 
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Theme Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {colorOptions.map(color => (
                    <div 
                      key={color.hex}
                      onClick={() => setNewBranchColor(color.hex)}
                      style={{ 
                        width: 36, height: 36, borderRadius: '50%', backgroundColor: color.hex, cursor: 'pointer',
                        border: newBranchColor === color.hex ? '3px solid var(--text-primary)' : '2px solid transparent',
                        boxShadow: newBranchColor === color.hex ? '0 0 0 2px white inset' : 'none'
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setIsAdding(false)} style={{ background: 'var(--bg-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
