import React, { useState } from 'react';

export default function RequestSender() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://');
  const [headers, setHeaders] = useState('User-Agent: BBF/1.0\nAccept: */*');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);

  const send = async () => {
    setBusy(true); setRes(null);
    const hdrs = {};
    headers.split('\n').forEach(line => {
      const i = line.indexOf(':');
      if (i > 0) hdrs[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    const start = performance.now();
    try {
      const r = await fetch(url, {
        method,
        mode: 'cors',
        headers: hdrs,
        body: ['GET', 'HEAD'].includes(method) ? undefined : body
      });
      const time = Math.round(performance.now() - start);
      const respHeaders = {};
      r.headers.forEach((v, k) => respHeaders[k] = v);
      const text = await r.text();
      setRes({ status: r.status, time, headers: respHeaders, body: text });
    } catch (e) {
      setRes({ error: e.message });
    }
    setBusy(false);
  };

  const isJson = res?.body?.trim().startsWith('{') || res?.body?.trim().startsWith('[');

  return (
    <>
      <div className="panel">
        <h2>HTTP Request Builder</h2>
        <div className="row" style={{marginBottom:10}}>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            {['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].map(m => <option key={m}>{m}</option>)}
          </select>
          <input style={{flex:1}} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" />
          <button disabled={busy} onClick={send}>{busy ? 'Sending…' : 'Send'}</button>
        </div>
        <label>Headers (one per line, "Name: value")</label>
        <textarea style={{minHeight:80,fontFamily:'monospace',fontSize:12}} value={headers} onChange={e => setHeaders(e.target.value)} />
        {!['GET','HEAD'].includes(method) && (
          <>
            <label style={{marginTop:10}}>Body</label>
            <textarea style={{minHeight:80,fontFamily:'monospace',fontSize:12}} value={body} onChange={e => setBody(e.target.value)} placeholder='{"key": "value"}' />
          </>
        )}
      </div>
      {res && (
        <div className="panel">
          {res.error ? <div style={{color:'var(--red)'}}>{res.error}</div> : (
            <>
              <div className="row" style={{marginBottom:10}}>
                <strong style={{fontSize:18, color: res.status < 300 ? 'var(--green)' : res.status < 400 ? 'var(--accent2)' : 'var(--orange)'}}>{res.status}</strong>
                <span style={{color:'var(--muted)'}}>· {res.time}ms · {res.body.length} bytes</span>
              </div>
              <label>Response Headers</label>
              <pre style={{background:'#0a0d14',padding:10,borderRadius:6,fontSize:12,maxHeight:200,overflow:'auto'}}>{Object.entries(res.headers).map(([k,v]) => `${k}: ${v}`).join('\n')}</pre>
              <label style={{marginTop:10}}>Response Body</label>
              <pre style={{background:'#0a0d14',padding:10,borderRadius:6,fontSize:12,maxHeight:400,overflow:'auto',color: isJson ? 'var(--green)' : 'var(--text)'}}>{isJson ? (() => { try { return JSON.stringify(JSON.parse(res.body), null, 2); } catch { return res.body; } })() : res.body.slice(0, 50000)}</pre>
            </>
          )}
        </div>
      )}
    </>
  );
}
