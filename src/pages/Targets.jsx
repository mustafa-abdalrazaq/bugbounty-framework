import React, { useState } from 'react';
import { useStore, setState, uid } from '../store.js';

export default function Targets() {
  const targets = useStore(s => s.targets);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const blank = { name: '', platform: 'HackerOne', url: '', payout: '', notes: '' };
  const [form, setForm] = useState(blank);

  const startNew = () => { setEdit(null); setForm(blank); setOpen(true); };
  const startEdit = (t) => { setEdit(t.id); setForm(t); setOpen(true); };
  const save = () => {
    if (!form.name) return;
    setState(s => {
      if (edit) return { ...s, targets: s.targets.map(t => t.id === edit ? { ...form, id: edit } : t) };
      return { ...s, targets: [...s.targets, { ...form, id: uid(), createdAt: Date.now() }] };
    });
    setOpen(false);
  };
  const del = (id) => setState(s => ({ ...s, targets: s.targets.filter(t => t.id !== id) }));

  return (
    <>
      <div className="panel">
        <div className="row">
          <strong>{targets.length} program(s)</strong>
          <div className="spacer" />
          <button onClick={startNew}>+ Add Program</button>
        </div>
      </div>
      <div className="panel">
        {targets.length === 0 ? <div className="empty">No programs yet. Add a bug bounty program to start tracking.</div> : (
          <table>
            <thead><tr><th>Name</th><th>Platform</th><th>URL</th><th>Payout</th><th></th></tr></thead>
            <tbody>
              {targets.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
                  <td><span className="tag">{t.platform}</span></td>
                  <td><a href={t.url} target="_blank" rel="noreferrer">{t.url}</a></td>
                  <td>{t.payout}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="ghost sm" onClick={() => startEdit(t)}>Edit</button>{' '}
                    <button className="danger sm" onClick={() => del(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{edit ? 'Edit' : 'Add'} Program</h2>
            <div className="field"><label>Program Name</label><input style={{width:'100%'}} value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="grid2">
              <div className="field"><label>Platform</label>
                <select style={{width:'100%'}} value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                  {['HackerOne','Bugcrowd','Intigriti','YesWeHack','Synack','Self-hosted','Other'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="field"><label>Max Payout</label><input style={{width:'100%'}} placeholder="$10,000" value={form.payout} onChange={e => setForm({...form, payout: e.target.value})} /></div>
            </div>
            <div className="field"><label>Program URL</label><input style={{width:'100%'}} value={form.url} onChange={e => setForm({...form, url: e.target.value})} /></div>
            <div className="field"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="row"><div className="spacer"/><button className="ghost" onClick={() => setOpen(false)}>Cancel</button><button onClick={save}>Save</button></div>
          </div>
        </div>
      )}
    </>
  );
}
