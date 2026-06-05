import React, { useState } from 'react';
import { hash, md5, identifyHash } from '../lib/tools.js';
import { COMMON_PASSWORDS } from '../lib/wordlists.js';

export default function HashTool() {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState({});
  const [toCrack, setToCrack] = useState('');
  const [cracked, setCracked] = useState('');
  const [busy, setBusy] = useState(false);

  const compute = async () => {
    setHashes({
      MD5: md5(text),
      'SHA-1': await hash(text, 'SHA-1'),
      'SHA-256': await hash(text, 'SHA-256'),
      'SHA-384': await hash(text, 'SHA-384'),
      'SHA-512': await hash(text, 'SHA-512')
    });
  };

  const crack = async () => {
    setBusy(true); setCracked('');
    const target = toCrack.trim().toLowerCase();
    const algos = identifyHash(target);
    for (const word of COMMON_PASSWORDS) {
      let h = '';
      if (algos.includes('MD5')) h = md5(word);
      else if (algos.includes('SHA-1')) h = await hash(word, 'SHA-1');
      else if (algos.includes('SHA-256')) h = await hash(word, 'SHA-256');
      else if (algos.includes('SHA-512')) h = await hash(word, 'SHA-512');
      if (h.toLowerCase() === target) { setCracked(`✓ Cracked: "${word}"`); setBusy(false); return; }
    }
    setCracked('✗ Not found in built-in wordlist (' + COMMON_PASSWORDS.length + ' tried)');
    setBusy(false);
  };

  return (
    <>
      <div className="panel">
        <h2>Hash Generator</h2>
        <div className="row">
          <input style={{flex:1}} value={text} onChange={e => setText(e.target.value)} placeholder="Text to hash" />
          <button onClick={compute}>Hash</button>
        </div>
        {Object.entries(hashes).map(([k, v]) => (
          <div key={k} style={{marginTop:10}}>
            <label>{k}</label>
            <code style={{display:'block',background:'#0a0d14',padding:8,borderRadius:4,fontSize:12,wordBreak:'break-all',color:'var(--green)'}}>{v}</code>
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>Hash Identifier & Cracker</h2>
        <input style={{width:'100%',marginBottom:8}} value={toCrack} onChange={e => setToCrack(e.target.value)} placeholder="Paste a hash…" />
        {toCrack && <div style={{color:'var(--muted)',fontSize:12,marginBottom:8}}>Possible: <strong style={{color:'var(--accent2)'}}>{identifyHash(toCrack).join(', ')}</strong></div>}
        <div className="row"><div className="spacer"/><button disabled={busy || !toCrack} onClick={crack}>{busy ? 'Cracking…' : 'Crack with built-in wordlist'}</button></div>
        {cracked && <div style={{marginTop:10,padding:10,background:'#0a0d14',borderRadius:6,fontFamily:'monospace',color: cracked.startsWith('✓') ? 'var(--green)' : 'var(--orange)'}}>{cracked}</div>}
      </div>
    </>
  );
}
