import React, { useState } from 'react';
import { scanSecrets, extractEndpoints } from '../lib/api.js';

export default function SecretScanner() {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [secrets, setSecrets] = useState([]);
  const [endpoints, setEndpoints] = useState([]);

  const scan = (content) => {
    setSecrets(scanSecrets(content));
    setEndpoints(extractEndpoints(content));
  };

  const fetchAndScan = async () => {
    if (!url) return;
    setBusy(true);
    try {
      const res = await fetch(url);
      const body = await res.text();
      setText(body.slice(0, 200000));
      scan(body);
    } catch (e) {
      alert('Fetch failed (likely CORS): ' + e.message);
    }
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>JS Secret Scanner & Endpoint Extractor</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Paste JS/HTML/source, or fetch a URL (CORS permitting), to scan for API keys, tokens, secrets, and embedded endpoints.</p>
        <div className="row">
          <input style={{flex:1}} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/main.js" />
          <button disabled={busy} onClick={fetchAndScan}>{busy ? '…' : 'Fetch & Scan'}</button>
        </div>
      </div>
      <div className="panel">
        <h2>Paste content</h2>
        <textarea style={{minHeight:200}} value={text} onChange={e => { setText(e.target.value); scan(e.target.value); }} placeholder="Paste JavaScript, HTML, or any source code…" />
      </div>

      {secrets.length > 0 && (
        <div className="panel">
          <h2>Secrets ({secrets.length})</h2>
          <table>
            <thead><tr><th>Type</th><th>Match</th><th>Confidence</th></tr></thead>
            <tbody>
              {secrets.map((s,i) => (
                <tr key={i}>
                  <td><span className={`tag ${s.confidence==='high'?'sev-critical':'sev-medium'}`}>{s.type}</span></td>
                  <td><code style={{fontSize:11}}>{s.match}</code></td>
                  <td>{s.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {endpoints.length > 0 && (
        <div className="panel">
          <h2>Endpoints found ({endpoints.length})</h2>
          <div style={{maxHeight:300,overflow:'auto',background:'#0a0d14',padding:10,borderRadius:6,fontFamily:'monospace',fontSize:12}}>
            {endpoints.map((e,i) => <div key={i}>{e}</div>)}
          </div>
        </div>
      )}
    </>
  );
}
