import React, { useState } from 'react';
import { useOmni } from '../context/OmniContext';
import { Save, RefreshCw, Upload, Download, Smartphone, LogOut, LogIn } from 'lucide-react';
import { loginWithGoogle, logout } from '../firebase';

const Settings = () => {
  const { user, forceSync, lastSynced, getExportData, importData } = useOmni();
  const [syncStatus, setSyncStatus] = useState('');

  const handleLogin = async () => {
    setSyncStatus('Logging in...');
    const resultUser = await loginWithGoogle();
    if (resultUser) {
      setSyncStatus(`Welcome, ${resultUser.displayName}!`);
    } else {
      setSyncStatus('Login failed or cancelled.');
    }
    setTimeout(() => setSyncStatus(''), 3000);
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
            <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem' }}>
              {user.photoURL && <img src={user.photoURL} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '1rem' }} />}
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{user.displayName}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>{user.email}</p>
              
              <button className="btn btn-outline" onClick={handleLogout} style={{ width: '100%', borderColor: '#ffccc7', color: '#ff4d4f' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleLogin} style={{ width: '100%', marginBottom: '1.5rem', background: '#4285F4', color: 'white' }}>
              <LogIn size={16} /> Sign in with Google
            </button>
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
