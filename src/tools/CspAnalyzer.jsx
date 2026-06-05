import React, { useState } from 'react';

const DANGEROUS = {
  "'unsafe-inline'": 'Allows inline scripts/styles — enables XSS',
  "'unsafe-eval'": 'Allows eval() and similar — enables XSS',
  "'unsafe-hashes'": 'Allows specific inline event handlers — risky',
  'data:': 'data: URIs allowed — can be used to inject scripts',
  '*': 'Wildcard — allows ANY origin',
  'http:': 'Insecure scheme allowed',
  'https:': 'All HTTPS sources allowed (very broad)'
};

function parseCsp(csp) {
  const dirs = {};
  csp.split(';').forEach(part => {
    const [name, ...vals] = part.trim().split(/\s+/);
    if (name) dirs[name.toLowerCase()] = vals;
  });
  return dirs;
}

export default function CspAnalyzer() {
  const [url, setUrl] = useState('https://');
  const [csp, setCsp] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchCsp = async () => {
    setBusy(true);
    try {
      const res = await fetch(url, { mode: 'cors' });
      const header = res.headers.get('content-security-policy') || res.headers.get('content-security-policy-report-only');
      setCsp(header || '[No CSP header found]');
    } catch (e) {
      setCsp('[CORS-blocked or error: ' + e.message + ']');
    }
    setBusy(false);
  };

  const dirs = csp && !csp.startsWith('[') ? parseCsp(csp) : null;
  const issues = [];
  if (dirs) {
    if (!dirs['default-src'] && !dirs['script-src']) issues.push({ sev: 'high', msg: 'No default-src or script-src — falls back to "anything goes"' });
    Object.entries(dirs).forEach(([dir, vals]) => {
      vals.forEach(v => {
        if (DANGEROUS[v]) issues.push({ sev: v === '*' || v === "'unsafe-inline'" ? 'high' : 'medium', msg: `${dir}: ${v} → ${DANGEROUS[v]}` });
      });
    });
    if (!dirs['object-src']) issues.push({ sev: 'medium', msg: 'No object-src — Flash/plugin content not restricted' });
    if (!dirs['base-uri']) issues.push({ sev: 'medium', msg: 'No base-uri — base-tag injection possible' });
    if (!dirs['frame-ancestors']) issues.push({ sev: 'low', msg: 'No frame-ancestors — clickjacking possible' });
    if (!dirs['form-action']) issues.push({ sev: 'low', msg: 'No form-action — form hijacking possible' });
  }

  return (
    <>
      <div className="panel">
        <h2>CSP Analyzer</h2>
        <div className="row">
          <input style={{flex:1}} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
          <button disabled={busy} onClick={fetchCsp}>{busy ? '…' : 'Fetch CSP'}</button>
        </div>
        <label style={{marginTop:10}}>Or paste a CSP header directly</label>
        <textarea style={{minHeight:80,fontFamily:'monospace',fontSize:12}} value={csp} onChange={e => setCsp(e.target.value)} placeholder="default-src 'self'; script-src 'unsafe-inline' …" />
      </div>
      {dirs && (
        <>
          <div className="panel">
            <h2>Directives ({Object.keys(dirs).length})</h2>
            <table>
              <thead><tr><th>Directive</th><th>Sources</th></tr></thead>
              <tbody>{Object.entries(dirs).map(([d, vs]) => <tr key={d}><td><code>{d}</code></td><td><code style={{fontSize:11}}>{vs.join(' ')}</code></td></tr>)}</tbody>
            </table>
          </div>
          <div className="panel">
            <h2>Issues ({issues.length})</h2>
            {issues.length === 0 ? <div className="empty">No common issues detected.</div> : issues.map((i, k) => (
              <div key={k} className="row" style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <span className={`tag sev-${i.sev}`}>{i.sev}</span>
                <span>{i.msg}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
