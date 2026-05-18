import React, { useState } from 'react';
import { useOmni } from '../context/OmniContext';
import { Save, RefreshCw, Upload, Download, Smartphone, LogOut, LogIn, Mail } from 'lucide-react';
import { loginWithGoogle, logout, loginWithEmail, registerWithEmail } from '../firebase';

const Settings = () => {
  const { user, forceSync, lastSynced, getExportData, importData } = useOmni();
  const [syncStatus, setSyncStatus] = useState('');
  
  // Email Auth states
  const [authMode, setAuthMode] = useState('google'); // 'google' or 'email'
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleLogin = async () => {
    setSyncStatus('Logging in...');
    const { user: resultUser, redirectTriggered, error } = await loginWithGoogle();
    
    if (resultUser) {
      setSyncStatus(`Welcome, ${resultUser.displayName}!`);
      setTimeout(() => setSyncStatus(''), 3000);
    } else if (redirectTriggered) {
      setSyncStatus('Redirecting to Google Sign-in...');
    } else {
      if (error) {
        setSyncStatus(`Login failed: ${error.code || error.message}`);
      } else {
        setSyncStatus('Login failed or cancelled.');
      }
      setTimeout(() => setSyncStatus(''), 15000); // 15 seconds to view error
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setSyncStatus(isSignUp ? 'Creating account...' : 'Signing in...');
    
    let result;
    if (isSignUp) {
      if (!displayName.trim()) {
        setSyncStatus('Please enter a display name.');
        return;
      }
      result = await registerWithEmail(email, password, displayName);
    } else {
      result = await loginWithEmail(email, password);
    }

    if (result.user) {
      setSyncStatus(`Welcome, ${result.user.displayName || result.user.email}!`);
      setEmail('');
      setPassword('');
      setDisplayName('');
      setTimeout(() => setSyncStatus(''), 3000);
    } else {
      setSyncStatus(`Auth failed: ${result.error.code || result.error.message}`);
      setTimeout(() => setSyncStatus(''), 15000);
    }
  };

  const handleLogout = async () => {
    await logout();
    setSyncStatus('Logged out successfully.');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleForceSync = async () => {
    if (!user) return;
    setSyncStatus('Syncing to cloud...');
    await forceSync();
    setSyncStatus('Synced successfully!');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleDownloadAPK = () => {
    window.open('https://github.com/harshit-singh-hs/OmniStudyTraker/releases/tag/latest', '_blank');
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <h1>Settings & Sync</h1>
        <p>Manage your data, sync across devices, and configure preferences.</p>
      </header>

      <div className="settings-grid" style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Device Sync Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Smartphone size={20} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Cloud Sync (Firebase)</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Sign in with Google to enable real-time, instantaneous cloud syncing across all your devices.
          </p>
          
          {user ? (
            <div style={{ background: 'rgba(232, 222, 211, 0.25)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '1rem', border: '2px solid var(--color-gate)' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-gate)', color: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{user.displayName || 'Omni Scholar'}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>{user.email}</p>
              
              <button className="btn btn-outline" onClick={handleLogout} style={{ width: '100%', borderColor: '#ffccc7', color: '#ff4d4f' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <>
              {/* Segmented Control */}
              <div style={{ display: 'flex', background: 'rgba(232, 222, 211, 0.3)', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem' }}>
                <button 
                  onClick={() => setAuthMode('google')} 
                  style={{ 
                    flex: 1, 
                    padding: '8px', 
                    border: 'none', 
                    background: authMode === 'google' ? 'white' : 'transparent', 
                    borderRadius: '6px', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    boxShadow: authMode === 'google' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    color: authMode === 'google' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    fontSize: '0.85rem'
                  }}
                >
                  Google Auth
                </button>
                <button 
                  onClick={() => setAuthMode('email')} 
                  style={{ 
                    flex: 1, 
                    padding: '8px', 
                    border: 'none', 
                    background: authMode === 'email' ? 'white' : 'transparent', 
                    borderRadius: '6px', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    boxShadow: authMode === 'email' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    color: authMode === 'email' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    fontSize: '0.85rem'
                  }}
                >
                  Email & Password
                </button>
              </div>

              {authMode === 'google' ? (
                <button className="btn btn-primary" onClick={handleLogin} style={{ width: '100%', marginBottom: '1.5rem', background: '#4285F4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <LogIn size={16} /> Sign in with Google
                </button>
              ) : (
                <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {isSignUp && (
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      required
                      style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
                    />
                  )}
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                    style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
                  />
                  <input 
                    type="password" 
                    placeholder="Password (min 6 chars)" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                    style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
                  />
                  
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Mail size={16} /> {isSignUp ? 'Create Account' : 'Sign In'}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', margin: 0 }}>
                    {isSignUp ? "Already have an account?" : "New to OmniStudy?"}{' '}
                    <span 
                      onClick={() => setIsSignUp(!isSignUp)} 
                      style={{ color: 'var(--color-gate)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </span>
                  </p>
                </form>
              )}
            </>
          )}

          {syncStatus && <p style={{ marginTop: '1rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '500', textAlign: 'center' }}>{syncStatus}</p>}

          {user && (
            <button className="btn btn-outline" onClick={handleForceSync} style={{ width: '100%', marginTop: '1rem' }}>
              <Save size={16} /> Force Cloud Sync
            </button>
          )}
          {user && lastSynced && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>Last synced: {lastSynced.toLocaleTimeString()}</p>
          )}
        </div>

        {/* Android App Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Download size={20} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Android App</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Download the native Android APK to use OmniStudy Tracker on your phone. Changes will instantly sync to your web app.
          </p>

          <button className="btn btn-primary" onClick={handleDownloadAPK} style={{ width: '100%', marginBottom: '1rem' }}>
            <Download size={16} /> Download APK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
