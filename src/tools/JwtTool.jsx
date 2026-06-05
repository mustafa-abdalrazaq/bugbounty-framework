import React, { useState } from 'react';
import { decodeJWT, jwtNoneAttack, jwtCrackHS256 } from '../lib/tools.js';
import { COMMON_PASSWORDS } from '../lib/wordlists.js';

export default function JwtTool() {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [cracked, setCracked] = useState('');

  let decoded = null, err = '';
  try { if (token.trim()) decoded = decodeJWT(token.trim()); } catch (e) { err = e.message; }

  const noneAttack = () => decoded && navigator.clipboard?.writeText(jwtNoneAttack(token.trim()));

  const crack = async () => {
    if (!decoded || decoded.header.alg !== 'HS256') { setCracked('Only HS256 crackable here.'); return; }
    setBusy(true); setCracked('');
    const secret = await jwtCrackHS256(token.trim(), COMMON_PASSWORDS);
    setCracked(secret ? `✓ Secret: "${secret}"` : '✗ Not in built-in wordlist');
    setBusy(false);
  };

  return (
    <div className="panel">
      <h2>JWT Tool</h2>
      <textarea style={{minHeight:80,fontFamily:'monospace',fontSize:12}} value={token} onChange={e => setToken(e.target.value)} placeholder="eyJhbGciOi…" />
      {err && <div style={{color:'var(--red)',marginTop:10}}>{err}</div>}
      {decoded && (
        <>
          <div className="grid2" style={{marginTop:14}}>
            <div>
              <label>Header (alg: <strong style={{color: decoded.header.alg === 'none' ? 'var(--red)' : 'var(--accent2)'}}>{decoded.header.alg}</strong>)</label>
              <pre style={{background:'#0a0d14',padding:10,borderRadius:6,fontSize:12,color:'var(--accent2)'}}>{JSON.stringify(decoded.header, null, 2)}</pre>
            </div>
            <div>
              <label>Payload</label>
              <pre style={{background:'#0a0d14',padding:10,borderRadius:6,fontSize:12,color:'var(--green)'}}>{JSON.stringify(decoded.payload, null, 2)}</pre>
            </div>
          </div>
          <div style={{marginTop:10}}>
            <label>Signature</label>
            <code style={{display:'block',background:'#0a0d14',padding:8,borderRadius:4,fontSize:11,wordBreak:'break-all'}}>{decoded.signature}</code>
          </div>
          {decoded.payload.exp && (
            <div style={{marginTop:10,color:'var(--muted)',fontSize:13}}>
              Expires: {new Date(decoded.payload.exp * 1000).toLocaleString()} {decoded.payload.exp * 1000 < Date.now() && <span style={{color:'var(--red)'}}>(EXPIRED)</span>}
            </div>
          )}
          <div className="row" style={{marginTop:14}}>
            <button className="ghost" onClick={noneAttack}>Generate "alg:none" attack token → clipboard</button>
            <button onClick={crack} disabled={busy}>{busy ? 'Cracking…' : 'Crack HS256 secret'}</button>
          </div>
          {cracked && <div style={{marginTop:10,padding:10,background:'#0a0d14',borderRadius:6,fontFamily:'monospace',color: cracked.startsWith('✓') ? 'var(--green)' : 'var(--orange)'}}>{cracked}</div>}
        </>
      )}
    </div>
  );
}
