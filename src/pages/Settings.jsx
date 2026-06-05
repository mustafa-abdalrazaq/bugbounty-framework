import React, { useState } from 'react';
import { exportAll, importAll, resetAll } from '../store.js';

export default function Settings() {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  const doExport = () => {
    const data = exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bbf-export-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    setMsg('Exported.');
  };
  const doImport = () => {
    try { importAll(text); setMsg('Imported successfully.'); setText(''); }
    catch (e) { setMsg('Invalid JSON: ' + e.message); }
  };
  const doReset = () => {
    if (confirm('Erase all local data?')) { resetAll(); setMsg('Reset complete.'); }
  };

  return (
    <>
      <div className="panel">
        <h2>Data Management</h2>
        <p style={{color:'var(--muted)',fontSize:13}}>All data stored locally in your browser (localStorage). Export regularly to back up.</p>
        <div className="row">
          <button onClick={doExport}>Export JSON</button>
          <button className="danger" onClick={doReset}>Reset All Data</button>
        </div>
      </div>
      <div className="panel">
        <h2>Import</h2>
        <textarea placeholder="Paste exported JSON here…" value={text} onChange={e => setText(e.target.value)} style={{minHeight:180}} />
        <div className="row" style={{marginTop:10}}><div className="spacer"/><button onClick={doImport}>Import</button></div>
        {msg && <div style={{marginTop:10,color:'var(--accent2)'}}>{msg}</div>}
      </div>
      <div className="panel">
        <h2>About</h2>
        <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.6}}>
          <strong style={{color:'var(--accent)'}}>BBFramework</strong> — a 100% in-browser bug bounty workbench. No external tools, no servers, no installs beyond Node for the dev server.
          <br/><br/>
          All scanning, fuzzing, hashing, JWT cracking, and recon happens client-side using <code>fetch</code>, Web Crypto, and built-in wordlists.
          <br/><br/>
          <strong>Authorized use only.</strong> Test only what you have permission to test.
        </p>
      </div>
    </>
  );
}
