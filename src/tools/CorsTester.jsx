import React, { useState } from 'react';

const ORIGINS = [
  'https://evil.com',
  'https://attacker.example.com',
  'null',
  'https://example.com.attacker.com'
];

export default function CorsTester() {
  const [url, setUrl] = useState('https://');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);

  const run = async () => {
    setBusy(true); setResults([]);
    const out = [];
    for (const origin of ORIGINS) {
      try {
        const res = await fetch(url, { method: 'GET', mode: 'cors', headers: { Origin: origin } });
        const acao = res.headers.get('access-control-allow-origin');
        const acac = res.headers.get('access-control-allow-credentials');
        let issue = null;
        if (acao === '*' && acac === 'true') issue = 'CRITICAL: * with credentials';
        else if (acao === origin) issue = 'Origin reflected (potentially exploitable)';
        else if (acao === '*') issue = 'Wildcard (low risk unless credentials)';
        else if (acao === 'null' && origin === 'null') issue = 'null origin allowed (sandboxed iframe attack)';
        out.push({ origin, acao, acac, issue });
      } catch (e) {
        out.push({ origin, error: e.message });
      }
      setResults([...out]);
    }
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>CORS Misconfiguration Tester</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Sends requests with various Origin headers and inspects ACAO/ACAC responses for trust-boundary issues.</p>
        <div className="row">
          <input style={{flex:1}} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" />
          <button disabled={busy} onClick={run}>{busy ? '…' : 'Test'}</button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="panel">
          <table>
            <thead><tr><th>Origin sent</th><th>ACAO returned</th><th>Credentials</th><th>Issue</th></tr></thead>
            <tbody>
              {results.map((r,i) => (
                <tr key={i}>
                  <td><code style={{fontSize:11}}>{r.origin}</code></td>
                  <td><code style={{fontSize:11}}>{r.acao || '—'}</code></td>
                  <td>{r.acac || '—'}</td>
                  <td>{r.issue ? <span className="tag sev-high">{r.issue}</span> : r.error ? <span style={{color:'var(--muted)',fontSize:11}}>{r.error}</span> : <span style={{color:'var(--green)'}}>safe</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
