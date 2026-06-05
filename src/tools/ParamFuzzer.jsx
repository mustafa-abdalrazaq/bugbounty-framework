import React, { useState } from 'react';
import { parallel, probePath } from '../lib/tools.js';
import { COMMON_PARAMS } from '../lib/wordlists.js';

export default function ParamFuzzer() {
  const [base, setBase] = useState('https://example.com/page');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [baseline, setBaseline] = useState(null);

  const run = async () => {
    setBusy(true); setResults([]);
    const b = await probePath(base, '');
    setBaseline(b);
    const out = await parallel(COMMON_PARAMS, async (p) => {
      const sep = base.includes('?') ? '&' : '?';
      return probePath(base + sep + p + '=BBFTEST', '');
    }, 8);
    const interesting = out.filter(r => r.status !== b.status && typeof r.status === 'number');
    setResults(interesting);
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>Hidden Parameter Discovery</h2>
        <p style={{color:'var(--muted)',fontSize:13,marginTop:0}}>Tests {COMMON_PARAMS.length} common parameter names and shows ones that change the response (vs. baseline).</p>
        <div className="row">
          <input style={{flex:1}} value={base} onChange={e => setBase(e.target.value)} />
          <button disabled={busy} onClick={run}>{busy ? '…' : 'Discover'}</button>
        </div>
        {baseline && <div style={{marginTop:10,color:'var(--muted)',fontSize:12}}>Baseline: status {baseline.status} · {baseline.time}ms</div>}
      </div>
      {results.length > 0 && (
        <div className="panel">
          <h2>Parameters that changed the response ({results.length})</h2>
          <table>
            <thead><tr><th>Status</th><th>URL</th></tr></thead>
            <tbody>{results.map((r,i) => <tr key={i}><td><strong>{r.status}</strong></td><td><a href={r.url} target="_blank" rel="noreferrer">{r.url}</a></td></tr>)}</tbody>
          </table>
        </div>
      )}
      {results.length === 0 && baseline && !busy && <div className="panel"><div className="empty">No parameters affected the response.</div></div>}
    </>
  );
}
