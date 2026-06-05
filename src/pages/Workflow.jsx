import React, { useState } from 'react';
import { crtSubdomains, dnsLookup, waybackUrls, gradeHeaders, detectTech, scanSecrets, TAKEOVER_FINGERPRINTS } from '../lib/api.js';
import { parallel } from '../lib/tools.js';
import { VULN_TEMPLATES } from '../lib/wordlists.js';
import { setState, uid } from '../store.js';

export default function Workflow() {
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [summary, setSummary] = useState(null);

  const add = (m) => setLog(l => [...l, `[${new Date().toLocaleTimeString()}] ${m}`]);

  const run = async () => {
    if (!domain) return;
    setBusy(true); setLog([]); setSummary(null);
    const s = { subdomains: [], headers: null, grade: null, tech: [], secrets: [], takeovers: [], vulns: [] };

    add(`▶ Stage 1: Subdomain enumeration (crt.sh)`);
    try { s.subdomains = await crtSubdomains(domain); add(`  ✓ ${s.subdomains.length} subdomains`); }
    catch (e) { add(`  ✗ ${e.message}`); }

    add(`▶ Stage 2: Probe root + grade headers`);
    try {
      const res = await fetch(`https://${domain}`, { mode: 'cors' });
      const h = {}; res.headers.forEach((v, k) => h[k] = v);
      s.headers = h;
      s.grade = gradeHeaders(h);
      const html = await res.text().catch(() => '');
      s.tech = detectTech(h, html.slice(0, 50000));
      s.secrets = scanSecrets(html);
      add(`  ✓ Grade ${s.grade.grade} (${s.grade.score}%) · ${s.tech.length} tech · ${s.secrets.length} secrets in HTML`);
    } catch (e) { add(`  ✗ ${e.message}`); }

    add(`▶ Stage 3: Subdomain takeover check (top 20)`);
    const sample = s.subdomains.slice(0, 20);
    const cnameRes = await parallel(sample, async (h) => {
      try {
        const r = await dnsLookup(h, 'CNAME');
        const cname = r[0]?.data || '';
        const m = TAKEOVER_FINGERPRINTS.find(f => f.cname.test(cname));
        return m ? { host: h, service: m.service, cname } : null;
      } catch { return null; }
    }, 6);
    s.takeovers = cnameRes.filter(Boolean);
    add(`  ✓ ${s.takeovers.length} possible takeover candidates`);

    add(`▶ Stage 4: Vuln template scan (${VULN_TEMPLATES.length} checks)`);
    const vulnRes = await parallel(VULN_TEMPLATES, async (tpl) => {
      const url = `https://${domain}${tpl.path}`;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(url, { method: tpl.method || 'GET', mode: 'cors', redirect: 'manual', signal: ctrl.signal, body: tpl.body, headers: tpl.body ? { 'Content-Type': 'application/json' } : undefined });
        clearTimeout(t);
        let hit = false;
        if (tpl.status?.includes(res.status)) hit = true;
        if (tpl.checkLocation && res.headers.get('location')?.includes(tpl.checkLocation)) hit = true;
        if (tpl.match) { const body = await res.text(); if (tpl.match.test(body)) hit = true; }
        return hit ? { ...tpl, url, status: res.status } : null;
      } catch { return null; }
    }, 6);
    s.vulns = vulnRes.filter(Boolean);
    add(`  ✓ ${s.vulns.length} vulnerable templates matched`);

    add(`✓ Workflow complete.`);
    setSummary(s);
    setBusy(false);
  };

  const importAll = () => {
    if (!summary) return;
    setState(st => {
      const existing = new Set(st.subdomains.map(x => x.host));
      const newSubs = summary.subdomains.filter(h => !existing.has(h)).map(h => ({ id: uid(), host: h, alive: null, tech: '', createdAt: Date.now() }));
      const newVulns = summary.vulns.map(v => ({
        id: uid(), title: v.name, type: 'Info Disclosure', severity: v.severity, status: 'open',
        target: domain, url: v.url, description: `Auto-detected by workflow (template ${v.id})`,
        steps: `GET ${v.url}`, impact: '', remediation: '', poc: '', createdAt: Date.now()
      }));
      const newTakeovers = summary.takeovers.map(t => ({
        id: uid(), title: `Possible ${t.service} subdomain takeover: ${t.host}`, type: 'Subdomain Takeover',
        severity: 'high', status: 'open', target: domain, url: `https://${t.host}`,
        description: `CNAME → ${t.cname}`, steps: '', impact: '', remediation: '', poc: '', createdAt: Date.now()
      }));
      return {
        ...st,
        subdomains: [...st.subdomains, ...newSubs],
        vulns: [...st.vulns, ...newVulns, ...newTakeovers]
      };
    });
    alert(`Imported ${summary.subdomains.length} subs, ${summary.vulns.length + summary.takeovers.length} findings.`);
  };

  return (
    <>
      <div className="panel">
        <h2>Automated Workflow</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>One-click chain: Subdomain enum → HTTP probe + header grade + tech + secrets → Takeover check → {VULN_TEMPLATES.length}-template vuln scan. Results auto-importable into your engagement DB.</p>
        <div className="row">
          <input style={{flex:1}} value={domain} onChange={e => setDomain(e.target.value.trim())} placeholder="example.com" />
          <button disabled={busy} onClick={run}>{busy ? 'Running…' : '▶ Run Full Workflow'}</button>
        </div>
      </div>
      {log.length > 0 && (
        <div className="panel">
          <h2>Log</h2>
          <pre style={{background:'#0a0d14',padding:12,borderRadius:6,fontSize:12,color:'var(--green)',maxHeight:300,overflow:'auto'}}>{log.join('\n')}</pre>
        </div>
      )}
      {summary && (
        <div className="panel">
          <div className="row"><h2 style={{margin:0}}>Summary</h2><div className="spacer"/><button onClick={importAll}>Import All to DB</button></div>
          <div className="cards" style={{marginTop:14}}>
            <div className="card"><div className="label">Subdomains</div><div className="value">{summary.subdomains.length}</div></div>
            <div className="card"><div className="label">Header Grade</div><div className="value accent">{summary.grade?.grade || '—'}</div></div>
            <div className="card"><div className="label">Tech</div><div className="value">{summary.tech.length}</div></div>
            <div className="card"><div className="label">Secrets</div><div className="value red">{summary.secrets.length}</div></div>
            <div className="card"><div className="label">Takeovers</div><div className="value red">{summary.takeovers.length}</div></div>
            <div className="card"><div className="label">Vuln Hits</div><div className="value red">{summary.vulns.length}</div></div>
          </div>
        </div>
      )}
    </>
  );
}
