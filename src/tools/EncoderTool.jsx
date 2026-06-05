import React, { useState } from 'react';
import { codecs } from '../lib/tools.js';

const OPS = [
  ['Base64 Encode', 'base64Enc'], ['Base64 Decode', 'base64Dec'],
  ['URL Encode', 'urlEnc'], ['URL Decode', 'urlDec'],
  ['Hex Encode', 'hexEnc'], ['Hex Decode', 'hexDec'],
  ['HTML Encode', 'htmlEnc'], ['HTML Decode', 'htmlDec'],
  ['Unicode Encode', 'unicodeEnc'], ['Unicode Decode', 'unicodeDec'],
  ['Binary Encode', 'binEnc'], ['Binary Decode', 'binDec'],
  ['ROT13', 'rot13'], ['Reverse', 'reverse']
];

export default function EncoderTool() {
  const [input, setInput] = useState('');
  const [op, setOp] = useState('base64Enc');
  let output = '';
  try { output = input ? codecs[op](input) : ''; } catch (e) { output = '[error: ' + e.message + ']'; }

  return (
    <div className="panel">
      <h2>Encoder / Decoder</h2>
      <div className="row" style={{flexWrap:'wrap',marginBottom:10}}>
        {OPS.map(([label, id]) => (
          <button key={id} className={id===op?'':'ghost'} onClick={() => setOp(id)}>{label}</button>
        ))}
      </div>
      <div className="grid2">
        <div><label>Input</label><textarea style={{minHeight:200}} value={input} onChange={e => setInput(e.target.value)} /></div>
        <div><label>Output</label><textarea style={{minHeight:200}} readOnly value={output} /></div>
      </div>
      <div className="row" style={{marginTop:10}}><div className="spacer"/><button className="ghost" onClick={() => navigator.clipboard?.writeText(output)}>Copy Output</button></div>
    </div>
  );
}
