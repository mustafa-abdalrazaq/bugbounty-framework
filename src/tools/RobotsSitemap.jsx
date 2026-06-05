import React, { useState } from 'react';
import { setState, uid } from '../store.js';

export default function RobotsSitemap() {
  const [base, setBase] = useState('https://');
  const [busy, setBusy] = useState(false);
  const [robots, setRobots] = useState(null);
  const [sitemaps, setSitemaps] = useState([]);
  const [urls, setUrls] = useState([]);

  const parseRobots = (txt) => {
    const out = { allows: [], disallows: [], sitemaps: [], userAgents: [] };
    let ua = '*';
    txt.split('\n').forEach(line => {
      line = line.replace(/#.*$/, '').trim();
      if (!line) return;
      const [k, ...rest] = line.split(':');
      const v = rest.join(':').trim();
      const key = k.toLowerCase();
      if (key === 'user-agent') { ua = v; out.userAgents.push(v); }
      else if (key === 'allow') out.allows.push({ ua, path: v });
      else if (key === 'disallow') out.disallows.push({ ua, path: v });
      else if (key === 'sitemap') out.sitemaps.push(v);
    });
    return out;
  };

  const parseSitemap = (xml) => {
    const out = [];
    const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
    let m;
    while ((m = re.exec(xml))) out.push(m[1]);
    return out;
  };

  const run = async () => {
    setBusy(true); setRobots(null); setSitemaps([]); setUrls([]);
    const root = base.replace(/\/+$/, '');
    try {
      const r = await fetch(root + '/robots.txt', { mode: 'cors' });
      if (r.ok) {
        const txt = await r.text();
        const parsed = parseRobots(txt);
        setRobots({ raw: txt, parsed });
        const smaps = parsed.sitemaps.length ? parsed.sitemaps : [root + '/sitemap.xml'];
        const allUrls = [];
        for (const s of smaps) {
          try {
            const sr = await fetch(s, { mode: 'cors' });
            if (sr.ok) {
              const xml = await sr.text();
              const us = parseSitemap(xml);
              setSitemaps(prev => [...prev, { url: s, count: us.length }]);
              allUrls.push(...us);
            }
          } catch {}
        }
        setUrls(allUrls);
      }
    } catch (e) { setRobots({ error: e.message }); }
    setBusy(false);
  };

  const importUrls = () => {
    setState(s => {
      const existing = new Set(s.endpoints.map(x => x.url));
      const next = urls.filter(u => !existing.has(u)).map(u => ({ id: uid(), url: u, method: 'GET', status: null, params: '', createdAt: Date.now() }));
      return { ...s, endpoints: [...s.endpoints, ...next] };
    });
    alert(`Imported ${urls.length} URLs into Recon DB.`);
  };

  return (
    <>
      <div className="panel">
        <h2>Robots.txt & Sitemap Parser</h2>
        <div className="row">
          <input style={{flex:1}} value={base} onChange={e => setBase(e.target.value)} placeholder="https://example.com" />
          <button disabled={busy} onClick={run}>{busy ? '…' : 'Parse'}</button>
        </div>
      </div>
      {robots && !robots.error && (
        <>
          <div className="panel">
            <h2>robots.txt</h2>
            <div className="grid2">
              <div>
                <label>Disallowed ({robots.parsed.disallows.length})</label>
                <div style={{background:'#0a0d14',padding:10,borderRadius:6,maxHeight:200,overflow:'auto',fontFamily:'monospace',fontSize:12}}>
                  {robots.parsed.disallows.map((d, i) => <div key={i}><span style={{color:'var(--muted)'}}>[{d.ua}]</span> {d.path}</div>)}
                </div>
              </div>
              <div>
                <label>Allowed ({robots.parsed.allows.length})</label>
                <div style={{background:'#0a0d14',padding:10,borderRadius:6,maxHeight:200,overflow:'auto',fontFamily:'monospace',fontSize:12,color:'var(--green)'}}>
                  {robots.parsed.allows.map((d, i) => <div key={i}>{d.path}</div>)}
                </div>
              </div>
            </div>
          </div>
          {sitemaps.length > 0 && (
            <div className="panel">
              <div className="row"><h2 style={{margin:0}}>Sitemaps ({sitemaps.length}) → {urls.length} URLs</h2><div className="spacer"/>{urls.length > 0 && <button onClick={importUrls}>Import to Recon</button>}</div>
              {sitemaps.map((s, i) => <div key={i} style={{padding:'6px 0',color:'var(--muted)',fontSize:12}}>{s.url} <strong style={{color:'var(--text)'}}>({s.count} URLs)</strong></div>)}
              {urls.length > 0 && <div style={{background:'#0a0d14',padding:10,borderRadius:6,marginTop:10,maxHeight:300,overflow:'auto',fontFamily:'monospace',fontSize:11}}>{urls.slice(0, 200).map((u, i) => <div key={i}>{u}</div>)}</div>}
            </div>
          )}
        </>
      )}
    </>
  );
}
