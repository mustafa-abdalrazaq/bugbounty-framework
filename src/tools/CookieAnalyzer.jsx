import React, { useState } from 'react';
import { decodeJWT } from '../lib/tools.js';

function parseCookies(setCookieHeader) {
  // Split on comma not preceded by "expires=..." day name
  const cookies = [];
  let current = '';
  let parts = setCookieHeader.split(/,(?=\s*[^,;\s]+=)/);
  for (const p of parts) {
    const segs = p.split(';').map(s => s.trim());
    const [name, ...rest] = segs[0].split('=');
    const value = rest.join('=');
    const attrs = {};
    segs.slice(1).forEach(seg => {
      const [k, v] = seg.split('=');
      attrs[k.toLowerCase()] = v || true;
    });
    cookies.push({ name, value, attrs });
  }
  return cookies;
}

export default function CookieAnalyzer() {
  const [url, setUrl] = useState('https://');
  const [raw, setRaw] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchCookies = async () => {
    setBusy(true);
    try {
      const res = await fetch(url, { mode: 'cors', credentials: 'include' });
      const sc = res.headers.get('set-cookie') || '[No Set-Cookie header readable — most browsers hide this; paste manually below]';
      setRaw(sc);
    } catch (e) { setRaw('[error: ' + e.message + ']'); }
    setBusy(false);
  };

  const cookies = raw && !raw.startsWith('[') ? parseCookies(raw) : [];

  return (
    <>
      <div className="panel">
        <h2>Cookie Analyzer</h2>
        <div className="row">
          <input style={{flex:1}} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
          <button disabled={busy} onClick={fetchCookies}>{busy ? '…' : 'Try Fetch'}</button>
        </div>
        <label style={{marginTop:10}}>Or paste Set-Cookie header(s) directly</label>
        <textarea style={{minHeight:100,fontFamily:'monospace',fontSize:12}} value={raw} onChange={e => setRaw(e.target.value)} placeholder="session=abc123; Path=/; HttpOnly, csrf=xyz; Secure" />
      </div>
      {cookies.length > 0 && (
        <div className="panel">
          <h2>Cookies ({cookies.length})</h2>
          {cookies.map((c, i) => {
            const issues = [];
            if (!c.attrs.secure) issues.push({ sev: 'medium', msg: 'No Secure flag' });
            if (!c.attrs.httponly) issues.push({ sev: 'medium', msg: 'No HttpOnly flag' });
            if (!c.attrs.samesite) issues.push({ sev: 'low', msg: 'No SameSite attribute' });
            if (c.attrs.samesite === 'none' && !c.attrs.secure) issues.push({ sev: 'high', msg: 'SameSite=None without Secure' });
            let jwt = null;
            try { if (c.value && c.value.startsWith('eyJ')) jwt = decodeJWT(c.value); } catch {}
            return (
              <div key={i} style={{padding:12,borderBottom:'1px solid var(--border)'}}>
                <div className="row"><strong>{c.name}</strong>{jwt && <span className="tag sev-low">JWT</span>}</div>
                <code style={{fontSize:11,wordBreak:'break-all',color:'var(--muted)'}}>{c.value.slice(0, 200)}</code>
                <div className="row" style={{marginTop:6,gap:6,flexWrap:'wrap'}}>
                  {Object.entries(c.attrs).map(([k, v]) => <span key={k} className="tag">{k}{v === true ? '' : '=' + v}</span>)}
                </div>
                {issues.map((iss, j) => (
                  <div key={j} style={{marginTop:6}}><span className={`tag sev-${iss.sev}`}>{iss.sev}</span> {iss.msg}</div>
                ))}
                {jwt && <pre style={{background:'#0a0d14',padding:8,borderRadius:4,marginTop:6,fontSize:11}}>{JSON.stringify(jwt.payload, null, 2)}</pre>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
