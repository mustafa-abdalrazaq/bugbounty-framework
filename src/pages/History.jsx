import React, { useState } from 'react';
import { useStore, setState } from '../store.js';

export default function History() {
  const history = useStore(s => s.history);
  const [filter, setFilter] = useState('');
  const filtered = history.filter(h => !filter || (h.url + h.method).toLowerCase().includes(filter.toLowerCase()));
  const clear = () => setState(s => ({ ...s, history: [] }));

  return (
    <>
      <div className="panel">
        <div className="row">
          <input style={{flex:1}} placeholder="Filter URL / method…" value={filter} onChange={e => setFilter(e.target.value)} />
          <strong>{filtered.length} / {history.length}</strong>
          <button className="danger" onClick={clear}>Clear</button>
        </div>
      </div>
      <div className="panel">
        {filtered.length === 0 ? <div className="empty">No requests logged yet. Tools that hit endpoints will log here.</div> : (
          <table>
            <thead><tr><th>Time</th><th>Method</th><th>URL</th><th>Status</th><th>Latency</th></tr></thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id}>
                  <td style={{color:'var(--muted)',fontSize:12}}>{new Date(h.ts).toLocaleTimeString()}</td>
                  <td><span className="tag">{h.method}</span></td>
                  <td><code style={{fontSize:11,wordBreak:'break-all'}}>{h.url}</code></td>
                  <td><strong style={{color: h.status >= 200 && h.status < 300 ? 'var(--green)' : h.status >= 400 ? 'var(--orange)' : 'var(--muted)'}}>{h.status ?? (h.err ? 'ERR' : '?')}</strong></td>
                  <td style={{color:'var(--muted)'}}>{h.time}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
