import React, { useState, useMemo } from 'react';
import { useStore, setState, uid } from '../store.js';

export default function Payloads() {
  const payloads = useStore(s => s.payloads);
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ category: 'XSS', title: '', code: '', desc: '' });
  const [adding, setAdding] = useState(false);

  const categories = useMemo(() => [...new Set(payloads.map(p => p.category))].sort(), [payloads]);
  const filtered = payloads.filter(p =>
    (!cat || p.category === cat) &&
    (!q || (p.title + p.code + p.desc).toLowerCase().includes(q.toLowerCase()))
  );

  const add = () => {
    if (!form.title || !form.code) return;
    setState(s => ({ ...s, payloads: [...s.payloads, { ...form, id: uid() }] }));
    setForm({ category: 'XSS', title: '', code: '', desc: '' });
    setAdding(false);
  };
  const del = (id) => setState(s => ({ ...s, payloads: s.payloads.filter(p => p.id !== id) }));
  const copy = (code) => navigator.clipboard?.writeText(code);

  return (
    <>
      <div className="panel">
        <div className="row">
          <select value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="Search payloads…" value={q} onChange={e => setQ(e.target.value)} style={{flex:1}} />
          <button onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : '+ Add Payload'}</button>
        </div>
        {adding && (
          <div style={{marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)'}}>
            <div className="grid2">
              <div className="field"><label>Category</label><input style={{width:'100%'}} value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
              <div className="field"><label>Title</label><input style={{width:'100%'}} value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            </div>
            <div className="field"><label>Payload</label><textarea value={form.code} onChange={e => setForm({...form, code: e.target.value})} /></div>
            <div className="field"><label>Description</label><input style={{width:'100%'}} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} /></div>
            <div className="row"><div className="spacer"/><button onClick={add}>Save</button></div>
          </div>
        )}
      </div>
      <div className="panel" style={{padding:0}}>
        {filtered.length === 0 ? <div className="empty">No payloads match.</div> : filtered.map(p => (
          <div className="payload" key={p.id}>
            <div className="row">
              <span className="tag">{p.category}</span>
              <h4>{p.title}</h4>
              <div className="spacer" />
              <button className="ghost sm" onClick={() => copy(p.code)}>Copy</button>
              <button className="danger sm" onClick={() => del(p.id)}>×</button>
            </div>
            {p.desc && <div className="desc">{p.desc}</div>}
            <code style={{display:'block',background:'#0a0d14',padding:10,borderRadius:6,fontFamily:'Consolas, monospace',fontSize:12.5,color:'var(--green)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{p.code}</code>
          </div>
        ))}
      </div>
    </>
  );
}
