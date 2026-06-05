import React, { useState } from 'react';
import { probeUrl, gradeHeaders, detectTech } from '../lib/api.js';

export default function HttpInspector() {
  const [url, setUrl] = useState('https://');
  const [busy, setBusy] = useState(false);
  const [r, setR] = useState(null);

  const run = async () => {
    setBusy(true); setR(null);
    const probe = await probeUrl(url);
    let html = '';
    if (probe.ok && probe.corsAllowed) {
      try {
        const res = await fetch(url);
        html = (await res.text()).slice(0, 50000);
      } catch {}
    }
    const grade = probe.headers && Object.keys(probe.headers).length ? gradeHeaders(probe.headers) : null;
    const tech = probe.headers ? detectTech(probe.headers, html) : [];
    setR({ probe, grade, tech });
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>HTTP Inspector & Security Header Grader</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Probes the URL with fetch and analyzes response headers. CORS-blocked endpoints show limited data.</p>
        <div className="row">
          <input style={{flex:1}} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
          <button disabled={busy} onClick={run}>{busy ? 'Probing…' : 'Inspect'}</button>
        </div>
      </div>

      {r && (
        <>
          <div className="panel">
            <h2>Response</h2>
            {!r.probe.ok ? <div style={{color:'var(--red)'}}>Failed: {r.probe.error}</div> : (
              <div className="grid3">
                <div><label>Status</label><div style={{fontSize:24,fontWeight:700}}>{r.probe.status || '?'}</div></div>
                <div><label>Response Time</label><div style={{fontSize:24,fontWeight:700}}>{r.probe.time}ms</div></div>
                <div><label>CORS</label><div style={{fontSize:24,fontWeight:700,color: r.probe.corsAllowed ? 'var(--green)' : 'var(--orange)'}}>{r.probe.corsAllowed ? 'Allowed' : 'Blocked'}</div></div>
              </div>
            )}
            {r.probe.note && <div style={{color:'var(--orange)',marginTop:8,fontSize:12}}>Note: {r.probe.note}</div>}
          </div>

          {r.grade && (
            <div className="panel">
              <div className="row"><h2 style={{margin:0}}>Security Headers</h2><div className="spacer"/><div style={{fontSize:48,fontWeight:800,color:r.grade.grade==='A'?'var(--green)':r.grade.grade==='F'?'var(--red)':'var(--yellow)'}}>{r.grade.grade}</div></div>
              {r.grade.checks.map(c => (
                <div key={c.name} className="row" style={{padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{color: c.present ? 'var(--green)' : 'var(--red)'}}>{c.present ? '✓' : '✗'}</span>
                  <span>{c.name}</span>
                  <div className="spacer"/>
                  <span style={{color:'var(--muted)',fontSize:12}}>weight {c.weight}</span>
                </div>
              ))}
            </div>
          )}

          {r.tech.length > 0 && (
            <div className="panel">
              <h2>Tech Stack</h2>
              <div className="row">{r.tech.map((t,i) => <span key={i} className="tag" style={{padding:'6px 10px'}}>{t.name} <span style={{color:'var(--muted)',marginLeft:4}}>· {t.category}</span></span>)}</div>
            </div>
          )}

          {r.probe.headers && Object.keys(r.probe.headers).length > 0 && (
            <div className="panel">
              <h2>Raw Headers</h2>
              <pre style={{background:'#0a0d14',padding:12,borderRadius:6,fontSize:12,overflow:'auto'}}>{Object.entries(r.probe.headers).map(([k,v]) => `${k}: ${v}`).join('\n')}</pre>
            </div>
          )}
        </>
      )}
    </>
  );
}
