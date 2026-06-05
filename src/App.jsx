import React from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Targets from './pages/Targets.jsx';
import Scope from './pages/Scope.jsx';
import Recon from './pages/Recon.jsx';
import ReconToolkit from './pages/ReconToolkit.jsx';
import HttpInspector from './pages/HttpInspector.jsx';
import SecretScanner from './pages/SecretScanner.jsx';
import Takeover from './pages/Takeover.jsx';
import Toolbox from './pages/Toolbox.jsx';
import Workflow from './pages/Workflow.jsx';
import History from './pages/History.jsx';
import Vulnerabilities from './pages/Vulnerabilities.jsx';
import Payloads from './pages/Payloads.jsx';
import Checklists from './pages/Checklists.jsx';
import Notes from './pages/Notes.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';

const nav = [
  { group: 'Overview', items: [
    { to: '/', label: 'Dashboard', ic: '▦' },
    { to: '/workflow', label: 'Auto Workflow', ic: '⟳' }
  ]},
  { group: 'Engagements', items: [
    { to: '/targets', label: 'Programs', ic: '◉' },
    { to: '/scope', label: 'Scope', ic: '◇' }
  ]},
  { group: 'Live Tools', items: [
    { to: '/toolkit', label: 'Passive Recon', ic: '⌕' },
    { to: '/http', label: 'HTTP Inspector', ic: '⇄' },
    { to: '/secrets', label: 'Secret Scanner', ic: '🗝' },
    { to: '/takeover', label: 'Takeover Check', ic: '⚑' },
    { to: '/toolbox', label: 'Toolbox (17)', ic: '⚒' }
  ]},
  { group: 'Hunting', items: [
    { to: '/recon', label: 'Recon DB', ic: '▤' },
    { to: '/vulns', label: 'Vulnerabilities', ic: '⚠' },
    { to: '/payloads', label: 'Payloads', ic: '⚡' },
    { to: '/checklists', label: 'Checklists', ic: '✓' },
    { to: '/history', label: 'Request History', ic: '⟲' }
  ]},
  { group: 'Output', items: [
    { to: '/notes', label: 'Notes', ic: '✎' },
    { to: '/reports', label: 'Reports', ic: '⎙' }
  ]},
  { group: 'System', items: [
    { to: '/settings', label: 'Settings', ic: '⚙' }
  ]}
];

const titles = {
  '/': 'Dashboard',
  '/workflow': 'Automated Workflow',
  '/targets': 'Bug Bounty Programs',
  '/scope': 'Scope Management',
  '/toolkit': 'Passive Recon Toolkit',
  '/http': 'HTTP Inspector',
  '/secrets': 'Secret & Endpoint Scanner',
  '/takeover': 'Subdomain Takeover Checker',
  '/toolbox': 'Toolbox',
  '/recon': 'Recon Database',
  '/vulns': 'Vulnerabilities',
  '/payloads': 'Payload Library',
  '/checklists': 'Testing Checklists',
  '/history': 'Request History',
  '/notes': 'Notes',
  '/reports': 'Reports',
  '/settings': 'Settings'
};

export default function App() {
  const loc = useLocation();
  const title = titles[loc.pathname] || 'Bug Bounty Framework';
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span className="dot" /> BBFramework</div>
        <nav className="nav">
          {nav.map(section => (
            <div key={section.group}>
              <div className="nav-section">{section.group}</div>
              {section.items.map(it => (
                <NavLink key={it.to} to={it.to} end={it.to === '/'}>
                  <span className="ic">{it.ic}</span> {it.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <h1>{title}</h1>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>
            v4.0 · for authorized testing only
          </div>
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/scope" element={<Scope />} />
            <Route path="/toolkit" element={<ReconToolkit />} />
            <Route path="/http" element={<HttpInspector />} />
            <Route path="/secrets" element={<SecretScanner />} />
            <Route path="/takeover" element={<Takeover />} />
            <Route path="/toolbox" element={<Toolbox />} />
            <Route path="/recon" element={<Recon />} />
            <Route path="/vulns" element={<Vulnerabilities />} />
            <Route path="/payloads" element={<Payloads />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/history" element={<History />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
