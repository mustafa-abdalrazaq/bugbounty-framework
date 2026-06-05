import React, { useState } from 'react';
import { VULN_TEMPLATES } from '../lib/wordlists.js';
import { parallel } from '../lib/tools.js';
import { setState, uid } from '../store.js';

export default function VulnScanner() {
  const [base, setBase] = useState('https://');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);

  const test = async (tpl) => {
    const url = base.replace(/\/$/, '') + tpl.path;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, {
        method: tpl.method || 'GET',
        mode: 'cors',
        redirect: 'manual',
        signal: ctrl.signal,
        headers: tpl.body ? { 'Content-Type': 'application/json' } : undefined,
        body: tpl.body
      });
      clearTimeout(t);
      let hit = false;
      if (tpl.status && tpl.status.includes(res.status)) hit = true;
      if (tpl.checkLocation && res.headers.get('location')?.includes(tpl.checkLocation)) hit = true;
      if (tpl.match) {
        const body = await res.text();
        if (tpl.match.test(body)) hit = true;
      }
      if (tpl.matchBytes) {
        const buf = new Uint8Array(await res.arrayBuffer());
        hit = tpl.matchBytes.every((b, i) => buf[i] === b);
      }
      return { ...tpl, url, status: res.status, vulnerable: hit };
    } catch (e) {
      return { ...tpl, url, status: 'error', error: e.message };
    }
  };

  const run = async () => {
    setBusy(true); setResults([]);
    const out = await parallel(VULN_TEMPLATES, test, 6);
    setResults(out);
    setBusy(false);
  };

  const importVulns = () => {
    const hits = results.filter(r => r.vulnerable);
    setState(s => ({
      ...s,
      vulns: [
        ...s.vulns,
        ...hits.map(h => ({
          id: uid(), title: h.name, type: 'Info Disclosure', severity: h.severity, status: 'open',
          target: '', url: h.url, description: `Auto-detected by template ${h.id}`, steps: `Visit ${h.url}`,
          impact: '', remediation: '', poc: '', createdAt: Date.now()
        }))
      ]
    }));
    alert(`Imported ${hits.length} findings into Vulnerabilities.`);
  };

  const vulns = results.filter(r => r.vulnerable);

  return (
    <>
      <div className="panel">
        <h2>Template-Based Vulnerability Scanner</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>{VULN_TEMPLATES.length} built-in templates: exposed .git/.env, phpinfo, Spring actuator, GraphQL introspection, SQL errors, open redirect, server-status, admin panels, and more. Pure browser fetch — no install.</p>
        <div className="row">
          <input style={{flex:1}} value={base} onChange={e => setBase(e.target.value)} placeholder="https://example.com" />
          <button disabled={busy} onClick={run}>{busy ? 'Scanning…' : 'Scan'}</button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="panel">
          <div className="row" style={{marginBottom:10}}>
            <strong>{vulns.length} vulnerable / {results.length} checked</strong>
            <div className="spacer"/>
            {vulns.length > 0 && <button onClick={importVulns}>Import findings to DB</button>}
          </div>
          <table>
            <thead><tr><th></th><th>Template</th><th>Severity</th><th>URL</th><th>Status</th></tr></thead>
            <tbody>
              {results.map((r,i) => (
                <tr key={i}>
                  <td>{r.vulnerable ? <span style={{color:'var(--red)'}}>●</span> : <span style={{color:'var(--muted)'}}>○</span>}</td>
                  <td>{r.name}</td>
                  <td><span className={`tag sev-${r.severity}`}>{r.severity}</span></td>
                  <td><a href={r.url} target="_blank" rel="noreferrer" style={{fontSize:12}}>{r.path}</a></td>
                  <td style={{color: r.vulnerable ? 'var(--red)' : 'var(--muted)'}}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
