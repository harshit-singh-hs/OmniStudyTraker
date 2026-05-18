import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart3, Settings, Target, Layers } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Branches from './pages/Branches';
import StatsLab from './pages/StatsLab';
import VisionBoard from './pages/VisionBoard';
import './App.css';

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Hub' },
    { path: '/branches', icon: <Layers size={20} />, label: 'Branches' },
    { path: '/stats', icon: <BarChart3 size={20} />, label: 'Stats Lab' },
    { path: '/vision', icon: <Target size={20} />, label: 'Vision' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="app-container">
      {/* Sidebar for Desktop */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>OmniStudy Tracker</h2>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="mobile-nav">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

import { OmniProvider } from './context/OmniContext';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <OmniProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/stats" element={<StatsLab />} />
            <Route path="/vision" element={<VisionBoard />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </OmniProvider>
  );
}

export default App;
