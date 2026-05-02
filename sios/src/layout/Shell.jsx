import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Dashboard from '../pages/Dashboard';
import SeismicViewer from '../pages/SeismicViewer';
import Interpretation from '../pages/Interpretation';
import DataIngestion from '../pages/DataIngestion';
import DatasetRegistry from '../pages/DatasetRegistry';
import AIModels from '../pages/AIModels';
import DecisionSupport from '../pages/DecisionSupport';
import Reports from '../pages/Reports';
import Tracking from '../pages/Tracking';
import Admin from '../pages/Admin';
import ProtectedRoute from '../auth/ProtectedRoute';
import { useAuth } from '../auth/AuthContext';

export default function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const { auth } = useAuth();

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '/') { e.preventDefault(); document.getElementById('global-search')?.focus(); }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar />
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-base)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/seismic" element={<SeismicViewer />} />
            <Route path="/interpretation" element={
              <ProtectedRoute permission="canInterpret"><Interpretation /></ProtectedRoute>
            } />
            <Route path="/ingestion" element={
              <ProtectedRoute permission="canUploadData"><DataIngestion /></ProtectedRoute>
            } />
            <Route path="/datasets" element={<DatasetRegistry />} />
            <Route path="/models" element={
              <ProtectedRoute permission="canRunModels"><AIModels /></ProtectedRoute>
            } />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/decision" element={<DecisionSupport />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/activity" element={<Tracking />} />
            <Route path="/admin" element={
              <ProtectedRoute permission="canAccessAdmin"><Admin /></ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}
