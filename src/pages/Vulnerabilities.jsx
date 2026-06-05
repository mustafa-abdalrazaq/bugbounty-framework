import React, { useState, useMemo } from 'react';
import { useStore, setState, uid } from '../store.js';

const SEVERITIES = ['critical','high','medium','low','info'];
const STATUSES = ['open','triaged','resolved','duplicate','na'];
const TYPES = ['XSS','SQLi','SSRF','IDOR','CSRF','RCE','LFI','XXE','Auth Bypass','Open Redirect','Info Disclosure','Subdomain Takeover','Business Logic','Other'];

export default function Vulnerabilities() {
  const { vulns, targets } = useStore();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [filter, setFilter] = useState({ severity: '', status: '', q: '' });

  const blank = {
    title: '', target: '', url: '', type: 'XSS', severity: 'medium', status: 'open',
    description: '', steps: '', impact: '', remediation: '', poc: ''
  };
  const [form, setForm] = useState(blank);

  const filtered = useMemo(() => vulns.filter(v =>
    (!filter.severity || v.severity === filter.severity) &&
    (!filter.status || v.status === filter.status) &&
    (!filter.q || (v.title + v.target + v.url).toLowerCase().includes(filter.q.toLowerCase()))
  ).sort((a,b) => b.createdAt - a.createdAt), [vulns, filter]);

  const startNew = () => { setEdit(null); setForm(blank); setOpen(true); };
  const startEdit = (v) => { setEdit(v.id); setForm(v); setOpen(true); };
  const save = () => {
    if (!form.title) return;
    setState(s => {
      if (edit) return { ...s, vulns: s.vulns.map(v => v.id === edit ? { ...form, id: edit } : v) };
      return { ...s, vulns: [...s.vulns, { ...form, id: uid(), createdAt: Date.now() }] };
    });
    setOpen(false);
  };
  const del = (id) => setState(s => ({ ...s, vulns: s.vulns.filter(v => v.id !== id) }));

  return (
    <>
      <div className="panel">
        <div className="row">
          <input placeholder="Search…" value={filter.q} onChange={e => setFilter({...filter, q: e.target.value})} />
          <select value={filter.severity} onChange={e => setFilter({...filter, severity: e.target.value})}>
            <option value="">All severity</option>
            {SEVERITIES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
            <option value="">All status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="spacer" />
          <button onClick={startNew}>+ Log Vulnerability</button>
        </div>
      </div>
      <div className="panel">
        {filtered.length === 0 ? <div className="empty">No findings.</div> : (
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Target</th><th>Severity</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} onClick={() => startEdit(v)} style={{cursor:'pointer'}}>
                  <td><strong>{v.title}</strong></td>
                  <td><span className="tag">{v.type}</span></td>
                  <td>{v.target || '—'}</td>
                  <td><span className={`tag sev-${v.severity}`}>{v.severity}</span></td>
                  <td><span className={`tag status-${v.status}`}>{v.status}</span></td>
                  <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td><button className="danger sm" onClick={(e) => { e.stopPropagation(); del(v.id); }}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{edit ? 'Edit' : 'Log'} Vulnerability</h2>
            <div className="field"><label>Title</label><input style={{width:'100%'}} value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="grid3">
              <div className="field"><label>Type</label><select style={{width:'100%'}} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="field"><label>Severity</label><select style={{width:'100%'}} value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>{SEVERITIES.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="field"><label>Status</label><select style={{width:'100%'}} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="grid2">
              <div className="field"><label>Program</label>
                <select style={{width:'100%'}} value={form.target} onChange={e => setForm({...form, target: e.target.value})}>
                  <option value="">—</option>
                  {targets.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Affected URL</label><input style={{width:'100%'}} value={form.url} onChange={e => setForm({...form, url: e.target.value})} /></div>
            </div>
            <div className="field"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="field"><label>Steps to Reproduce</label><textarea value={form.steps} onChange={e => setForm({...form, steps: e.target.value})} /></div>
            <div className="field"><label>Impact</label><textarea value={form.impact} onChange={e => setForm({...form, impact: e.target.value})} /></div>
            <div className="field"><label>Remediation</label><textarea value={form.remediation} onChange={e => setForm({...form, remediation: e.target.value})} /></div>
            <div className="field"><label>PoC / Payload</label><textarea value={form.poc} onChange={e => setForm({...form, poc: e.target.value})} /></div>
            <div className="row"><div className="spacer"/><button className="ghost" onClick={() => setOpen(false)}>Cancel</button><button onClick={save}>Save</button></div>
          </div>
        </div>
      )}
    </>
  );
}
