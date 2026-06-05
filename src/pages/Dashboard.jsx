import React from 'react';
import { useStore } from '../store.js';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const s = useStore();
  const byStatus = s.vulns.reduce((a, v) => (a[v.status] = (a[v.status] || 0) + 1, a), {});
  const bySev = s.vulns.reduce((a, v) => (a[v.severity] = (a[v.severity] || 0) + 1, a), {});
  const recent = [...s.vulns].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <>
      <div className="cards">
        <div className="card"><div className="label">Programs</div><div className="value accent">{s.targets.length}</div></div>
        <div className="card"><div className="label">In Scope</div><div className="value">{s.scope.filter(x => x.inScope).length}</div></div>
        <div className="card"><div className="label">Subdomains</div><div className="value">{s.subdomains.length}</div></div>
        <div className="card"><div className="label">Endpoints</div><div className="value">{s.endpoints.length}</div></div>
        <div className="card"><div className="label">Vulnerabilities</div><div className="value red">{s.vulns.length}</div></div>
        <div className="card"><div className="label">Resolved</div><div className="value green">{byStatus.resolved || 0}</div></div>
      </div>

      <div className="grid2" style={{ marginTop: 18 }}>
        <div className="panel">
          <h2>Severity Breakdown</h2>
          {['critical', 'high', 'medium', 'low', 'info'].map(sev => (
            <div key={sev} className="row" style={{ marginBottom: 8 }}>
              <span className={`tag sev-${sev}`}>{sev}</span>
              <div className="spacer" />
              <strong>{bySev[sev] || 0}</strong>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>Status Breakdown</h2>
          {['open', 'triaged', 'resolved', 'duplicate', 'na'].map(st => (
            <div key={st} className="row" style={{ marginBottom: 8 }}>
              <span className={`tag status-${st}`}>{st}</span>
              <div className="spacer" />
              <strong>{byStatus[st] || 0}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Recent Findings</h2>
        {recent.length === 0 ? <div className="empty">No vulnerabilities logged yet. <Link to="/vulns">Add one →</Link></div> : (
          <table>
            <thead><tr><th>Title</th><th>Target</th><th>Severity</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recent.map(v => (
                <tr key={v.id}>
                  <td>{v.title}</td>
                  <td>{v.target || '—'}</td>
                  <td><span className={`tag sev-${v.severity}`}>{v.severity}</span></td>
                  <td><span className={`tag status-${v.status}`}>{v.status}</span></td>
                  <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
