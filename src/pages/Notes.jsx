import React, { useState } from 'react';
import { useStore, setState, uid } from '../store.js';

export default function Notes() {
  const notes = useStore(s => s.notes);
  const [sel, setSel] = useState(notes[0]?.id || null);
  const current = notes.find(n => n.id === sel);

  const add = () => {
    const n = { id: uid(), title: 'New note', body: '', createdAt: Date.now() };
    setState(s => ({ ...s, notes: [n, ...s.notes] }));
    setSel(n.id);
  };
  const upd = (patch) => setState(s => ({ ...s, notes: s.notes.map(n => n.id === sel ? { ...n, ...patch } : n) }));
  const del = (id) => {
    setState(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));
    if (sel === id) setSel(null);
  };

  return (
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18,height:'calc(100vh - 130px)'}}>
      <div className="panel" style={{overflow:'auto',padding:0}}>
        <div style={{padding:12,borderBottom:'1px solid var(--border)'}}>
          <button style={{width:'100%'}} onClick={add}>+ New Note</button>
        </div>
        {notes.length === 0 ? <div className="empty">No notes.</div> : notes.map(n => (
          <div key={n.id} onClick={() => setSel(n.id)} style={{padding:12,borderBottom:'1px solid var(--border)',cursor:'pointer',background: sel===n.id ? 'var(--panel2)' : 'transparent'}}>
            <div style={{fontWeight:600,fontSize:13}}>{n.title || 'Untitled'}</div>
            <div style={{color:'var(--muted)',fontSize:11,marginTop:2}}>{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="panel" style={{display:'flex',flexDirection:'column'}}>
        {current ? (
          <>
            <div className="row" style={{marginBottom:10}}>
              <input style={{flex:1}} value={current.title} onChange={e => upd({ title: e.target.value })} />
              <button className="danger" onClick={() => del(current.id)}>Delete</button>
            </div>
            <textarea style={{flex:1,minHeight:0}} value={current.body} onChange={e => upd({ body: e.target.value })} placeholder="Markdown notes, request samples, observations…" />
          </>
        ) : <div className="empty">Select or create a note.</div>}
      </div>
    </div>
  );
}
