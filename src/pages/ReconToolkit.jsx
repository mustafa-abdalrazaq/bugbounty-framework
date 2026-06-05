import React, { useState } from 'react';
import { crtSubdomains, dnsLookup, waybackUrls, hackerTargetSubs } from '../lib/api.js';
import { setState, uid } from '../store.js';

export default function ReconToolkit() {
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [results, setResults] = useState({ subs: [], dns: [], wayback: [] });

  const append = (msg) => setLog(l => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const run = async () => {
    if (!domain) return;
    setBusy(true); setLog([]); setResults({ subs: [], dns: [], wayback: [] });
    append(`Starting passive recon on ${domain}`);

    const allSubs = new Set();
    try {
      append('Querying crt.sh (Certificate Transparency)…');
      const c = await crtSubdomains(domain);
      c.forEach(s => allSubs.add(s));
      append(`  → ${c.length} subdomains from crt.sh`);
    } catch (e) { append(`  ✗ crt.sh failed: ${e.message}`); }

    try {
      append('Querying HackerTarget…');
      const h = await hackerTargetSubs(domain);
      h.forEach(s => allSubs.add(s));
      append(`  → ${h.length} subdomains from HackerTarget`);
    } catch (e) { append(`  ✗ HackerTarget failed: ${e.message}`); }

    try {
      append('Resolving DNS records (A, MX, NS, TXT)…');
      const dns = [];
      for (const t of ['A','AAAA','MX','NS','TXT','CNAME']) {
        const r = await dnsLookup(domain, t);
        r.forEach(rr => dns.push({ type: t, ...rr }));
      }
      append(`  → ${dns.length} DNS records`);
      setResults(r => ({ ...r, dns }));
    } catch (e) { append(`  ✗ DNS failed: ${e.message}`); }

    try {
      append('Fetching Wayback Machine URLs…');
      const w = await waybackUrls(domain);
      append(`  → ${w.length} historical URLs`);
      setResults(r => ({ ...r, wayback: w }));
    } catch (e) { append(`  ✗ Wayback failed: ${e.message}`); }

    const subs = [...allSubs].sort();
    setResults(r => ({ ...r, subs }));
    append(`Done. ${subs.length} unique subdomains.`);
    setBusy(false);
  };

  const importSubs = () => {
    setState(s => {
      const existing = new Set(s.subdomains.map(x => x.host));
      const next = results.subs.filter(h => !existing.has(h)).map(h => ({ id: uid(), host: h, alive: null, tech: '', createdAt: Date.now() }));
      return { ...s, subdomains: [...s.subdomains, ...next] };
    });
    alert(`Imported ${results.subs.length} subdomains into Recon page.`);
  };
  const importUrls = () => {
    setState(s => {
      const existing = new Set(s.endpoints.map(x => x.url));
      const next = results.wayback.filter(u => !existing.has(u)).map(u => ({ id: uid(), url: u, method: 'GET', status: null, params: '', createdAt: Date.now() }));
      return { ...s, endpoints: [...s.endpoints, ...next] };
    });
    alert(`Imported ${results.wayback.length} URLs into Recon page.`);
  };

  return (
    <>
      <div className="panel">
        <h2>Passive Recon (browser-side)</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Uses public APIs: crt.sh, Google DNS-over-HTTPS, HackerTarget, Wayback Machine. No tools needed.</p>
        <div className="row">
          <input style={{flex:1}} placeholder="example.com" value={domain} onChange={e => setDomain(e.target.value.trim())} />
          <button disabled={busy} onClick={run}>{busy ? 'Running…' : 'Run Recon'}</button>
        </div>
      </div>

      {log.length > 0 && (
        <div className="panel">
          <h2>Output</h2>
          <pre style={{background:'#0a0d14',padding:12,borderRadius:6,maxHeight:240,overflow:'auto',fontSize:12.5,color:'var(--green)'}}>{log.join('\n')}</pre>
        </div>
      )}

      {results.subs.length > 0 && (
        <div className="panel">
          <div className="row"><h2 style={{margin:0}}>Subdomains ({results.subs.length})</h2><div className="spacer"/><button className="ghost" onClick={importSubs}>Import to Recon</button></div>
          <div style={{maxHeight:300,overflow:'auto',marginTop:10,background:'#0a0d14',padding:10,borderRadius:6,fontFamily:'monospace',fontSize:12.5}}>
            {results.subs.map(s => <div key={s}><a href={`https://${s}`} target="_blank" rel="noreferrer">{s}</a></div>)}
          </div>
        </div>
      )}

      {results.dns.length > 0 && (
        <div className="panel">
          <h2>DNS Records</h2>
          <table>
            <thead><tr><th>Type</th><th>Value</th><th>TTL</th></tr></thead>
            <tbody>{results.dns.map((r,i) => <tr key={i}><td><span className="tag">{r.type}</span></td><td><code>{r.data}</code></td><td>{r.ttl}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {results.wayback.length > 0 && (
        <div className="panel">
          <div className="row"><h2 style={{margin:0}}>Wayback URLs ({results.wayback.length})</h2><div className="spacer"/><button className="ghost" onClick={importUrls}>Import to Recon</button></div>
          <div style={{maxHeight:300,overflow:'auto',marginTop:10,background:'#0a0d14',padding:10,borderRadius:6,fontFamily:'monospace',fontSize:11.5}}>
            {results.wayback.slice(0, 300).map((u,i) => <div key={i} style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u}</div>)}
            {results.wayback.length > 300 && <div style={{color:'var(--muted)',marginTop:6}}>… {results.wayback.length - 300} more</div>}
          </div>
        </div>
      )}
    </>
  );
}
