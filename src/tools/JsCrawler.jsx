import React, { useState } from 'react';
import { scanSecrets, extractEndpoints } from '../lib/api.js';
import { parallel } from '../lib/tools.js';

export default function JsCrawler() {
  const [url, setUrl] = useState('https://');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);

  const run = async () => {
    setBusy(true); setLog([]); setResult(null);
    const add = (m) => setLog(l => [...l, m]);
    try {
      add(`Fetching ${url}`);
      const res = await fetch(url, { mode: 'cors' });
      const html = await res.text();
      add(`  → ${html.length} bytes`);

      const scriptUrls = new Set();
      const reSrc = /<script[^>]+src=["']([^"']+)["']/gi;
      let m;
      while ((m = reSrc.exec(html))) {
        try {
          const abs = new URL(m[1], url).href;
          scriptUrls.add(abs);
        } catch {}
      }
      add(`Found ${scriptUrls.size} script files`);

      const scriptBodies = await parallel([...scriptUrls], async (s) => {
        try {
          const r = await fetch(s, { mode: 'cors' });
          const t = await r.text();
          return { url: s, body: t, size: t.length };
        } catch (e) {
          return { url: s, error: e.message };
        }
      }, 6, (d, t) => add(`  Fetched ${d}/${t} scripts…`));

      const combined = html + '\n' + scriptBodies.filter(s => s.body).map(s => s.body).join('\n');
      const secrets = scanSecrets(combined);
      const endpoints = extractEndpoints(combined);
      add(`Done. ${secrets.length} secrets, ${endpoints.length} endpoints.`);
      setResult({ scriptBodies, secrets, endpoints });
    } catch (e) {
      add('Error: ' + e.message);
    }
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>JS Crawler & Recursive Scanner</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Fetches HTML, extracts all <code>&lt;script src&gt;</code> URLs, downloads them, scans the combined source for secrets and endpoints.</p>
        <div className="row">
          <input style={{flex:1}} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
          <button disabled={busy} onClick={run}>{busy ? '…' : 'Crawl'}</button>
        </div>
      </div>
      {log.length > 0 && (
        <div className="panel">
          <pre style={{background:'#0a0d14',padding:10,borderRadius:6,fontSize:12,color:'var(--green)',maxHeight:200,overflow:'auto'}}>{log.join('\n')}</pre>
        </div>
      )}
      {result && (
        <>
          <div className="panel">
            <h2>Scripts ({result.scriptBodies.length})</h2>
            <table>
              <thead><tr><th>URL</th><th>Size</th></tr></thead>
              <tbody>{result.scriptBodies.map((s, i) => (
                <tr key={i}>
                  <td><a href={s.url} target="_blank" rel="noreferrer" style={{fontSize:12}}>{s.url}</a></td>
                  <td style={{color:'var(--muted)'}}>{s.size ? s.size + ' B' : s.error}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {result.secrets.length > 0 && (
            <div className="panel">
              <h2>Secrets ({result.secrets.length})</h2>
              <table><thead><tr><th>Type</th><th>Match</th></tr></thead>
                <tbody>{result.secrets.map((s, i) => <tr key={i}><td><span className="tag sev-critical">{s.type}</span></td><td><code style={{fontSize:11}}>{s.match}</code></td></tr>)}</tbody>
              </table>
            </div>
          )}
          {result.endpoints.length > 0 && (
            <div className="panel">
              <h2>Endpoints ({result.endpoints.length})</h2>
              <div style={{maxHeight:300,overflow:'auto',background:'#0a0d14',padding:10,fontFamily:'monospace',fontSize:12,borderRadius:6}}>
                {result.endpoints.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
