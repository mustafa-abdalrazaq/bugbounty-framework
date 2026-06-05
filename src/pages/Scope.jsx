import React, { useState } from 'react';
import { useStore, setState, uid } from '../store.js';

export default function Scope() {
  const { scope, targets } = useStore();
  const [asset, setAsset] = useState('');
  const [type, setType] = useState('Domain');
  const [program, setProgram] = useState('');
  const [inScope, setInScope] = useState(true);

  const add = () => {
    if (!asset) return;
    setState(s => ({ ...s, scope: [...s.scope, { id: uid(), asset, type, program, inScope, createdAt: Date.now() }] }));
    setAsset('');
  };
  const toggle = (id) => setState(s => ({ ...s, scope: s.scope.map(x => x.id === id ? { ...x, inScope: !x.inScope } : x) }));
  const del = (id) => setState(s => ({ ...s, scope: s.scope.filter(x => x.id !== id) }));

  return (
    <>
      <div className="panel">
        <h2>Add Scope Item</h2>
        <div className="row">
          <input style={{flex:2}} placeholder="example.com or *.example.com" value={asset} onChange={e => setAsset(e.target.value)} />
          <select value={type} onChange={e => setType(e.target.value)}>
            {['Domain','Wildcard','IP','URL','Mobile','API','Hardware','Source Code'].map(x => <option key={x}>{x}</option>)}
          </select>
          <select value={program} onChange={e => setProgram(e.target.value)}>
            <option value="">— Program —</option>
            {targets.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <label style={{display:'flex',alignItems:'center',gap:6,margin:0}}>
            <input type="checkbox" checked={inScope} onChange={e => setInScope(e.target.checked)} /> In scope
          </label>
          <button onClick={add}>Add</button>
        </div>
      </div>
      <div className="panel">
        {scope.length === 0 ? <div className="empty">No assets defined.</div> : (
          <table>
            <thead><tr><th>Asset</th><th>Type</th><th>Program</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {scope.map(x => (
                <tr key={x.id}>
                  <td><code>{x.asset}</code></td>
                  <td><span className="tag">{x.type}</span></td>
                  <td>{x.program || '—'}</td>
                  <td><span className={`tag ${x.inScope ? 'status-resolved' : 'sev-high'}`}>{x.inScope ? 'In Scope' : 'Out'}</span></td>
                  <td style={{textAlign:'right'}}>
                    <button className="ghost sm" onClick={() => toggle(x.id)}>Toggle</button>{' '}
                    <button className="danger sm" onClick={() => del(x.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
