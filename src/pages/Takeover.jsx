import React, { useState } from 'react';
import { dnsLookup, TAKEOVER_FINGERPRINTS } from '../lib/api.js';

export default function Takeover() {
  const [hosts, setHosts] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);

  const run = async () => {
    const list = hosts.split('\n').map(h => h.trim()).filter(Boolean);
    if (!list.length) return;
    setBusy(true); setResults([]);
    const out = [];
    for (const host of list) {
      try {
        const cname = await dnsLookup(host, 'CNAME');
        const cnameVal = cname[0]?.data || '';
        const match = TAKEOVER_FINGERPRINTS.find(f => f.cname.test(cnameVal));
        let bodyCheck = null;
        if (match) {
          try {
            const res = await fetch(`https://${host}`, { mode: 'cors' });
            const body = await res.text();
            bodyCheck = match.body.test(body) ? 'VULNERABLE' : 'pointing-but-claimed';
          } catch { bodyCheck = 'cors-blocked (check manually)'; }
        }
        out.push({ host, cname: cnameVal, service: match?.service || null, status: bodyCheck });
        setResults([...out]);
      } catch (e) {
        out.push({ host, error: e.message });
        setResults([...out]);
      }
    }
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>Subdomain Takeover Checker</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Resolves CNAME records, matches them against known takeover-prone services (GitHub Pages, Heroku, S3, Shopify, Vercel, Fastly…), and checks response bodies for fingerprint strings.</p>
        <textarea style={{minHeight:120}} value={hosts} onChange={e => setHosts(e.target.value)} placeholder="sub1.example.com&#10;sub2.example.com" />
        <div className="row" style={{marginTop:10}}><div className="spacer"/><button disabled={busy} onClick={run}>{busy ? 'Checking…' : 'Check'}</button></div>
      </div>

      {results.length > 0 && (
        <div className="panel">
          <h2>Results</h2>
          <table>
            <thead><tr><th>Host</th><th>CNAME</th><th>Service</th><th>Status</th></tr></thead>
            <tbody>
              {results.map((r,i) => (
                <tr key={i}>
                  <td>{r.host}</td>
                  <td><code style={{fontSize:11}}>{r.cname || '—'}</code></td>
                  <td>{r.service ? <span className="tag sev-high">{r.service}</span> : <span style={{color:'var(--muted)'}}>—</span>}</td>
                  <td>{r.error ? <span style={{color:'var(--red)'}}>{r.error}</span> : r.status === 'VULNERABLE' ? <span className="tag sev-critical">VULNERABLE</span> : r.status || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
