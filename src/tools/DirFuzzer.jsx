import React, { useState } from 'react';
import { parallel, probePath } from '../lib/tools.js';
import { COMMON_PATHS } from '../lib/wordlists.js';

export default function DirFuzzer() {
  const [base, setBase] = useState('https://');
  const [extra, setExtra] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('interesting');

  const run = async () => {
    setBusy(true); setResults([]); setProgress({ done: 0, total: 0 });
    const list = [...COMMON_PATHS, ...extra.split('\n').map(s => s.trim()).filter(Boolean)];
    setProgress({ done: 0, total: list.length });
    const out = await parallel(list, async (p) => probePath(base, p), 10, (d, t) => setProgress({ done: d, total: t }));
    setResults(out);
    setBusy(false);
  };

  const show = results.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'interesting') return [200, 201, 301, 302, 401, 403].includes(r.status);
    if (filter === '200') return r.status === 200;
    if (filter === '301-2') return [301, 302].includes(r.status);
    if (filter === '401-3') return [401, 403].includes(r.status);
    return true;
  });

  const statusColor = (s) => s === 200 ? 'var(--green)' : s === 403 || s === 401 ? 'var(--orange)' : s === 301 || s === 302 ? 'var(--accent2)' : 'var(--muted)';

  return (
    <>
      <div className="panel">
        <h2>Directory Fuzzer</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Tries {COMMON_PATHS.length} common paths against the base URL using browser fetch. CORS-blocked results show as "cors" (host reachable). Built-in wordlist — no install needed.</p>
        <div className="row">
          <input style={{flex:1}} value={base} onChange={e => setBase(e.target.value)} placeholder="https://example.com" />
          <button disabled={busy || !base} onClick={run}>{busy ? `${progress.done}/${progress.total}` : 'Start Fuzzing'}</button>
        </div>
        <label style={{marginTop:10,display:'block'}}>Extra paths (one per line, optional)</label>
        <textarea style={{minHeight:60,fontFamily:'monospace',fontSize:12}} value={extra} onChange={e => setExtra(e.target.value)} placeholder="custom/path&#10;v3/api/secret" />
      </div>

      {results.length > 0 && (
        <div className="panel">
          <div className="row" style={{marginBottom:10}}>
            <strong>{results.length} probed · {show.length} shown</strong>
            <div className="spacer"/>
            {['interesting','200','301-2','401-3','all'].map(f => (
              <button key={f} className={f===filter?'':'ghost'} onClick={()=>setFilter(f)}>{f}</button>
            ))}
          </div>
          <table>
            <thead><tr><th>Status</th><th>Path</th><th>Time</th></tr></thead>
            <tbody>
              {show.map((r,i) => (
                <tr key={i}>
                  <td><strong style={{color:statusColor(r.status)}}>{r.status}</strong></td>
                  <td><a href={r.url} target="_blank" rel="noreferrer">{r.url}</a></td>
                  <td style={{color:'var(--muted)'}}>{r.time}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
