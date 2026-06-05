import React, { useState } from 'react';
import { useStore } from '../store.js';

function buildMarkdown(v) {
  return `# ${v.title}

**Severity:** ${v.severity.toUpperCase()}
**Type:** ${v.type}
**Target:** ${v.target || 'N/A'}
**Affected URL:** ${v.url || 'N/A'}
**Status:** ${v.status}
**Date:** ${new Date(v.createdAt).toISOString().slice(0,10)}

## Summary
${v.description || '_No description_'}

## Steps to Reproduce
${v.steps || '_No steps_'}

## Impact
${v.impact || '_No impact described_'}

## Proof of Concept
\`\`\`
${v.poc || '(none)'}
\`\`\`

## Remediation
${v.remediation || '_No remediation_'}
`;
}

function buildFullHtml(state) {
  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sortedVulns = [...state.vulns].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
  });
  const bySev = sortedVulns.reduce((a, v) => (a[v.severity] = (a[v.severity] || 0) + 1, a), {});

  return `<!doctype html><html><head><meta charset="utf-8"><title>BBF Engagement Report</title>
<style>
body{font-family:-apple-system,sans-serif;max-width:960px;margin:40px auto;padding:0 20px;color:#222;line-height:1.5}
h1{border-bottom:3px solid #ff5577;padding-bottom:8px}
h2{margin-top:36px;border-bottom:1px solid #eee;padding-bottom:6px}
h3{margin-top:24px}
.sev{display:inline-block;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#fff}
.critical{background:#dc2626}.high{background:#ea580c}.medium{background:#ca8a04}.low{background:#0284c7}.info{background:#6b7280}
.meta{color:#666;font-size:13px;margin:8px 0}
.summary{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:20px 0}
.summary div{background:#f3f4f6;padding:14px;border-radius:6px;text-align:center}
.summary .n{font-size:28px;font-weight:bold}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:13px}
th,td{text-align:left;padding:8px;border-bottom:1px solid #eee}
th{background:#f9fafb;font-weight:600;font-size:12px}
pre{background:#f3f4f6;padding:12px;border-radius:4px;overflow:auto;font-size:12px}
code{background:#f3f4f6;padding:2px 5px;border-radius:3px;font-size:12px}
.finding{border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:16px 0}
@media print { .finding{break-inside:avoid} }
</style></head><body>
<h1>Bug Bounty Engagement Report</h1>
<div class="meta">Generated ${new Date().toLocaleString()} · ${state.targets.length} programs · ${state.scope.length} scope items · ${state.vulns.length} findings</div>

<h2>Executive Summary</h2>
<div class="summary">
${['critical','high','medium','low','info'].map(s => `<div><div class="n">${bySev[s]||0}</div><div><span class="sev ${s}">${s}</span></div></div>`).join('')}
</div>

<h2>Programs (${state.targets.length})</h2>
<table><thead><tr><th>Name</th><th>Platform</th><th>URL</th><th>Payout</th></tr></thead><tbody>
${state.targets.map(t => `<tr><td>${esc(t.name)}</td><td>${esc(t.platform)}</td><td>${esc(t.url)}</td><td>${esc(t.payout)}</td></tr>`).join('')}
</tbody></table>

<h2>Scope (${state.scope.length})</h2>
<table><thead><tr><th>Asset</th><th>Type</th><th>Program</th><th>Status</th></tr></thead><tbody>
${state.scope.map(s => `<tr><td><code>${esc(s.asset)}</code></td><td>${esc(s.type)}</td><td>${esc(s.program)}</td><td>${s.inScope ? 'In Scope' : 'Out'}</td></tr>`).join('')}
</tbody></table>

<h2>Findings (${state.vulns.length})</h2>
${sortedVulns.map(v => `
<div class="finding">
  <h3>${esc(v.title)} <span class="sev ${v.severity}">${v.severity}</span></h3>
  <div class="meta"><strong>Type:</strong> ${esc(v.type)} · <strong>Target:</strong> ${esc(v.target)} · <strong>Status:</strong> ${esc(v.status)} · <strong>Date:</strong> ${new Date(v.createdAt).toISOString().slice(0,10)}</div>
  <div class="meta"><strong>URL:</strong> <code>${esc(v.url)}</code></div>
  <h4>Description</h4><p>${esc(v.description) || '<em>None</em>'}</p>
  <h4>Steps to Reproduce</h4><pre>${esc(v.steps) || '<em>None</em>'}</pre>
  <h4>Impact</h4><p>${esc(v.impact) || '<em>None</em>'}</p>
  <h4>Proof of Concept</h4><pre>${esc(v.poc) || '<em>None</em>'}</pre>
  <h4>Remediation</h4><p>${esc(v.remediation) || '<em>None</em>'}</p>
</div>
`).join('')}

<h2>Recon Summary</h2>
<p><strong>${state.subdomains.length}</strong> subdomains · <strong>${state.endpoints.length}</strong> endpoints discovered.</p>

</body></html>`;
}

export default function Reports() {
  const state = useStore();
  const vulns = state.vulns;
  const [sel, setSel] = useState(vulns[0]?.id || null);
  const v = vulns.find(x => x.id === sel);
  const md = v ? buildMarkdown(v) : '';

  const copy = () => navigator.clipboard?.writeText(md);
  const download = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  const downloadMd = () => download(md, `${v.title.replace(/[^a-z0-9]+/gi,'_')}.md`, 'text/markdown');
  const downloadFullHtml = () => download(buildFullHtml(state), `bbf-report-${Date.now()}.html`, 'text/html');
  const printHtml = () => {
    const w = window.open('', '_blank');
    w.document.write(buildFullHtml(state));
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <>
      <div className="panel">
        <h2>Full Engagement Report</h2>
        <p style={{color:'var(--muted)',fontSize:13}}>One self-contained HTML report with all programs, scope, and findings (sorted by severity). Print to PDF from your browser.</p>
        <div className="row">
          <button onClick={downloadFullHtml}>Download HTML Report</button>
          <button className="ghost" onClick={printHtml}>Print / Save as PDF</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18,height:'calc(100vh - 280px)'}}>
        <div className="panel" style={{overflow:'auto',padding:0}}>
          <div style={{padding:10,borderBottom:'1px solid var(--border)',color:'var(--muted)',fontSize:12}}>Single finding → Markdown</div>
          {vulns.length === 0 ? <div className="empty">No findings.</div> : vulns.map(x => (
            <div key={x.id} onClick={() => setSel(x.id)} style={{padding:12,borderBottom:'1px solid var(--border)',cursor:'pointer',background:sel===x.id?'var(--panel2)':'transparent'}}>
              <div style={{fontWeight:600,fontSize:13}}>{x.title}</div>
              <div style={{marginTop:4}}><span className={`tag sev-${x.severity}`}>{x.severity}</span></div>
            </div>
          ))}
        </div>
        <div className="panel" style={{display:'flex',flexDirection:'column'}}>
          {v ? (
            <>
              <div className="row" style={{marginBottom:10}}>
                <strong>{v.title}</strong>
                <div className="spacer"/>
                <button className="ghost" onClick={copy}>Copy</button>
                <button onClick={downloadMd}>Download .md</button>
              </div>
              <pre style={{flex:1,minHeight:0,overflow:'auto',background:'#0a0d14',padding:14,borderRadius:6,fontSize:12.5,whiteSpace:'pre-wrap'}}>{md}</pre>
            </>
          ) : <div className="empty">Select a finding for a single markdown report.</div>}
        </div>
      </div>
    </>
  );
}
