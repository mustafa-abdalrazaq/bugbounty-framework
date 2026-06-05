import React, { useState } from 'react';
import { WAF_SIGS } from '../lib/wordlists.js';

export default function WafDetector() {
  const [url, setUrl] = useState('https://');
  const [busy, setBusy] = useState(false);
  const [r, setR] = useState(null);

  const run = async () => {
    setBusy(true); setR(null);
    try {
      // Send a "malicious-looking" request to trip the WAF
      const res = await fetch(url + (url.includes('?') ? '&' : '?') + "bbftest=' OR 1=1-- <script>alert(1)</script>", { mode: 'cors' });
      const headers = {};
      res.headers.forEach((v, k) => headers[k.toLowerCase()] = v);
      const detected = new Set();
      for (const sig of WAF_SIGS) {
        if (sig.match.test(headers[sig.headerKey] || '')) detected.add(sig.name);
      }
      setR({ status: res.status, headers, detected: [...detected] });
    } catch (e) {
      setR({ error: e.message });
    }
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>WAF / CDN Detector</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Sends a suspicious request and fingerprints response headers against Cloudflare, AWS WAF, Akamai, Sucuri, Imperva, F5 BIG-IP, Barracuda, ModSecurity, Fastly.</p>
        <div className="row">
          <input style={{flex:1}} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
          <button disabled={busy} onClick={run}>{busy ? '…' : 'Detect'}</button>
        </div>
      </div>
      {r && (
        <div className="panel">
          {r.error ? <div style={{color:'var(--red)'}}>{r.error}</div> : (
            <>
              <h2>Detected: {r.detected.length === 0 ? <span style={{color:'var(--muted)'}}>None</span> : r.detected.map(d => <span key={d} className="tag sev-high" style={{marginRight:6}}>{d}</span>)}</h2>
              <div style={{color:'var(--muted)',fontSize:12,margin:'6px 0 14px'}}>Response status: {r.status}</div>
              <label>Response headers</label>
              <pre style={{background:'#0a0d14',padding:10,borderRadius:6,fontSize:12,maxHeight:300,overflow:'auto'}}>{Object.entries(r.headers).map(([k,v]) => `${k}: ${v}`).join('\n')}</pre>
            </>
          )}
        </div>
      )}
    </>
  );
}
