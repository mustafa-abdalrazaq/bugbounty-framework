import React, { useState } from 'react';
import { useStore, setState, uid } from '../store.js';

export default function Recon() {
  const { subdomains, endpoints } = useStore();
  const [tab, setTab] = useState('subdomains');
  const [bulk, setBulk] = useState('');

  const addBulk = () => {
    const lines = bulk.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setState(s => {
      if (tab === 'subdomains') {
        const existing = new Set(s.subdomains.map(x => x.host));
        const next = lines.filter(l => !existing.has(l)).map(l => ({ id: uid(), host: l, alive: null, tech: '', createdAt: Date.now() }));
        return { ...s, subdomains: [...s.subdomains, ...next] };
      }
      const existing = new Set(s.endpoints.map(x => x.url));
      const next = lines.filter(l => !existing.has(l)).map(l => ({ id: uid(), url: l, method: 'GET', status: null, params: '', createdAt: Date.now() }));
      return { ...s, endpoints: [...s.endpoints, ...next] };
    });
    setBulk('');
  };

  const delSub = (id) => setState(s => ({ ...s, subdomains: s.subdomains.filter(x => x.id !== id) }));
  const delEp = (id) => setState(s => ({ ...s, endpoints: s.endpoints.filter(x => x.id !== id) }));
  const updSub = (id, patch) => setState(s => ({ ...s, subdomains: s.subdomains.map(x => x.id === id ? { ...x, ...patch } : x) }));

  return (
    <>
      <div className="panel">
        <div className="row">
          <button className={tab==='subdomains'?'':'ghost'} onClick={()=>setTab('subdomains')}>Subdomains ({subdomains.length})</button>
          <button className={tab==='endpoints'?'':'ghost'} onClick={()=>setTab('endpoints')}>Endpoints ({endpoints.length})</button>
        </div>
      </div>

      <div className="panel">
        <h2>Bulk import ({tab})</h2>
        <textarea placeholder={tab==='subdomains' ? 'admin.example.com\napi.example.com' : 'https://example.com/api/users?id=1\nhttps://example.com/login'} value={bulk} onChange={e => setBulk(e.target.value)} />
        <div className="row" style={{marginTop:8}}><div className="spacer"/><button onClick={addBulk}>Import</button></div>
      </div>

      <div className="panel">
        {tab === 'subdomains' ? (
          subdomains.length === 0 ? <div className="empty">No subdomains yet.</div> : (
            <table>
              <thead><tr><th>Host</th><th>Alive</th><th>Tech</th><th></th></tr></thead>
              <tbody>
                {subdomains.map(x => (
                  <tr key={x.id}>
                    <td><a href={`https://${x.host}`} target="_blank" rel="noreferrer">{x.host}</a></td>
                    <td>
                      <select value={x.alive ?? ''} onChange={e => updSub(x.id, { alive: e.target.value || null })}>
                        <option value="">?</option>
                        <option value="yes">Up</option>
                        <option value="no">Down</option>
                      </select>
                    </td>
                    <td><input style={{width:'100%'}} value={x.tech} onChange={e => updSub(x.id, { tech: e.target.value })} placeholder="nginx, php..." /></td>
                    <td style={{textAlign:'right'}}><button className="danger sm" onClick={() => delSub(x.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          endpoints.length === 0 ? <div className="empty">No endpoints yet.</div> : (
            <table>
              <thead><tr><th>URL</th><th>Method</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {endpoints.map(x => (
                  <tr key={x.id}>
                    <td><code style={{fontSize:12}}>{x.url}</code></td>
                    <td><span className="tag">{x.method}</span></td>
                    <td>{x.status || '—'}</td>
                    <td style={{textAlign:'right'}}><button className="danger sm" onClick={() => delEp(x.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </>
  );
}
