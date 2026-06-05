import React, { useState } from 'react';
import { TOP_PORTS } from '../lib/wordlists.js';
import { parallel } from '../lib/tools.js';

export default function PortProbe() {
  const [host, setHost] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);

  const probe = async ({ port, scheme }) => {
    const url = `${scheme}://${host}:${port}/`;
    const start = performance.now();
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      await fetch(url, { mode: 'no-cors', signal: ctrl.signal });
      clearTimeout(t);
      return { port, scheme, status: 'open', time: Math.round(performance.now() - start) };
    } catch (e) {
      const elapsed = Math.round(performance.now() - start);
      if (e.name === 'AbortError') return { port, scheme, status: 'timeout', time: elapsed };
      // fast failure usually means closed/refused; slow = filtered
      return { port, scheme, status: elapsed < 200 ? 'closed' : 'unknown', time: elapsed };
    }
  };

  const run = async () => {
    setBusy(true); setResults([]);
    const out = await parallel(TOP_PORTS, probe, 6);
    setResults(out);
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>HTTP/S Port Probe</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Probes common web ports via browser fetch with timing heuristics. Browsers can't do raw TCP — this only detects HTTP-speaking services and uses response timing to guess closed vs filtered.</p>
        <div className="row">
          <input style={{flex:1}} value={host} onChange={e => setHost(e.target.value)} placeholder="example.com (no scheme)" />
          <button disabled={busy || !host} onClick={run}>{busy ? '…' : 'Probe'}</button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="panel">
          <table>
            <thead><tr><th>Port</th><th>Scheme</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {results.map((r,i) => (
                <tr key={i}>
                  <td><strong>{r.port}</strong></td>
                  <td><span className="tag">{r.scheme}</span></td>
                  <td><span className={`tag ${r.status==='open'?'status-resolved':r.status==='closed'?'status-na':'sev-medium'}`}>{r.status}</span></td>
                  <td style={{color:'var(--muted)'}}>{r.time}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
