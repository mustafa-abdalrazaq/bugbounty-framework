import React, { useState } from 'react';
import { XSS_PAYLOADS, SQLI_PAYLOADS, SQLI_ERRORS, parallel } from '../lib/tools.js';

export default function XssSqliTester() {
  const [url, setUrl] = useState('https://example.com/search?q=test');
  const [mode, setMode] = useState('xss');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);

  const test = async (payload) => {
    const target = url.replace(/=[^&]*/, '=' + encodeURIComponent(payload));
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const start = performance.now();
      const res = await fetch(target, { mode: 'cors', signal: ctrl.signal });
      const time = Math.round(performance.now() - start);
      clearTimeout(t);
      const body = await res.text();
      let signal = null;
      if (mode === 'xss' && body.includes(payload)) signal = 'reflected verbatim';
      else if (mode === 'sqli' && SQLI_ERRORS.test(body)) signal = 'SQL error in response';
      else if (mode === 'sqli' && payload.includes('SLEEP') && time > 4500) signal = `time-based (${time}ms)`;
      return { payload, status: res.status, time, signal, bodySize: body.length };
    } catch (e) {
      return { payload, error: e.message };
    }
  };

  const run = async () => {
    setBusy(true); setResults([]);
    const list = mode === 'xss' ? XSS_PAYLOADS : SQLI_PAYLOADS;
    const out = await parallel(list, test, 4);
    setResults(out);
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>XSS / SQLi Reflection Tester</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Fires built-in payloads at the URL, replacing the first parameter value. Detects verbatim reflection (XSS), SQL error messages, and time-based blind SQLi.</p>
        <div className="row">
          <input style={{flex:1}} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://target/page?param=value" />
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="xss">XSS</option>
            <option value="sqli">SQLi</option>
          </select>
          <button disabled={busy} onClick={run}>{busy ? '…' : 'Test'}</button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="panel">
          <table>
            <thead><tr><th>Payload</th><th>Status</th><th>Time</th><th>Signal</th></tr></thead>
            <tbody>
              {results.map((r,i) => (
                <tr key={i}>
                  <td><code style={{fontSize:11}}>{r.payload}</code></td>
                  <td>{r.status || '—'}</td>
                  <td style={{color:'var(--muted)'}}>{r.time || '—'}{r.time && 'ms'}</td>
                  <td>{r.signal ? <span className="tag sev-critical">{r.signal}</span> : r.error ? <span style={{color:'var(--muted)',fontSize:11}}>{r.error}</span> : <span style={{color:'var(--muted)'}}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
