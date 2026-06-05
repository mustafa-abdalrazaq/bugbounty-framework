import React, { useState } from 'react';
import { useStore, setState, uid } from '../store.js';

export default function Checklists() {
  const checklists = useStore(s => s.checklists);
  const [tab, setTab] = useState('recon');
  const [text, setText] = useState('');

  const tabs = Object.keys(checklists);
  const items = checklists[tab] || [];
  const done = items.filter(i => i.done).length;

  const toggle = (id) => setState(s => ({
    ...s,
    checklists: { ...s.checklists, [tab]: s.checklists[tab].map(i => i.id === id ? { ...i, done: !i.done } : i) }
  }));
  const add = () => {
    if (!text) return;
    setState(s => ({ ...s, checklists: { ...s.checklists, [tab]: [...s.checklists[tab], { id: uid(), text, done: false }] } }));
    setText('');
  };
  const del = (id) => setState(s => ({ ...s, checklists: { ...s.checklists, [tab]: s.checklists[tab].filter(i => i.id !== id) } }));
  const reset = () => setState(s => ({ ...s, checklists: { ...s.checklists, [tab]: s.checklists[tab].map(i => ({...i, done: false})) } }));

  return (
    <>
      <div className="panel">
        <div className="row">
          {tabs.map(t => (
            <button key={t} className={t===tab?'':'ghost'} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
          ))}
          <div className="spacer" />
          <span style={{color:'var(--muted)'}}>{done}/{items.length} done</span>
          <button className="ghost" onClick={reset}>Reset</button>
        </div>
      </div>
      <div className="panel">
        <div className="row" style={{marginBottom:14}}>
          <input style={{flex:1}} placeholder="Add new checklist item…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==='Enter' && add()} />
          <button onClick={add}>Add</button>
        </div>
        {items.map(i => (
          <div key={i.id} className={`checklist-item ${i.done ? 'done' : ''}`}>
            <input type="checkbox" checked={i.done} onChange={() => toggle(i.id)} />
            <span style={{flex:1}}>{i.text}</span>
            <button className="danger sm" onClick={() => del(i.id)}>×</button>
          </div>
        ))}
      </div>
    </>
  );
}
