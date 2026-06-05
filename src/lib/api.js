// Browser-only recon API wrappers. All use public endpoints with CORS enabled.

export async function crtSubdomains(domain) {
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('crt.sh error ' + res.status);
  const data = await res.json();
  const set = new Set();
  for (const row of data) {
    String(row.name_value || '').split('\n').forEach(n => {
      n = n.trim().toLowerCase();
      if (n && !n.startsWith('*.')) set.add(n);
    });
  }
  return [...set].sort();
}

export async function dnsLookup(name, type = 'A') {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.Answer || []).map(a => ({ type: a.type, data: a.data, ttl: a.TTL }));
}

export async function waybackUrls(domain) {
  const url = `https://web.archive.org/cdx/search/cdx?url=*.${encodeURIComponent(domain)}/*&output=json&fl=original&collapse=urlkey&limit=500`;
  const res = await fetch(url);
  const data = await res.json();
  return data.slice(1).map(r => r[0]);
}

export async function hackerTargetSubs(domain) {
  const url = `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`;
  const res = await fetch(url);
  const text = await res.text();
  if (text.includes('error') || text.includes('quota')) return [];
  return text.trim().split('\n').map(l => l.split(',')[0]).filter(Boolean);
}

// Probe a URL via fetch (no-cors fallback). Returns status, headers if CORS allows.
export async function probeUrl(url) {
  const start = performance.now();
  try {
    const res = await fetch(url, { method: 'GET', mode: 'cors', redirect: 'follow' });
    const headers = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    const time = Math.round(performance.now() - start);
    return { ok: true, status: res.status, headers, time, corsAllowed: true };
  } catch (e) {
    // Fall back to no-cors so we at least know it's reachable
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors' });
      const time = Math.round(performance.now() - start);
      return { ok: true, status: null, headers: {}, time, corsAllowed: false, note: 'reachable but CORS-blocked' };
    } catch (e2) {
      return { ok: false, error: e2.message };
    }
  }
}

// Security header grader
export function gradeHeaders(headers) {
  const checks = [
    { name: 'Strict-Transport-Security', present: !!headers['strict-transport-security'], weight: 2 },
    { name: 'Content-Security-Policy', present: !!headers['content-security-policy'], weight: 3 },
    { name: 'X-Frame-Options', present: !!headers['x-frame-options'], weight: 1 },
    { name: 'X-Content-Type-Options', present: !!headers['x-content-type-options'], weight: 1 },
    { name: 'Referrer-Policy', present: !!headers['referrer-policy'], weight: 1 },
    { name: 'Permissions-Policy', present: !!headers['permissions-policy'], weight: 1 },
    { name: 'X-XSS-Protection', present: !!headers['x-xss-protection'], weight: 0 }
  ];
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.present ? c.weight : 0), 0);
  const pct = Math.round((got / total) * 100);
  const grade = pct >= 90 ? 'A' : pct >= 75 ? 'B' : pct >= 50 ? 'C' : pct >= 25 ? 'D' : 'F';
  return { checks, score: pct, grade };
}

// Tech fingerprinting from headers + HTML
export function detectTech(headers, html = '') {
  const tech = [];
  const h = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  if (h.server) tech.push({ name: h.server, category: 'Server' });
  if (h['x-powered-by']) tech.push({ name: h['x-powered-by'], category: 'Framework' });
  if (h['x-aspnet-version']) tech.push({ name: 'ASP.NET ' + h['x-aspnet-version'], category: 'Framework' });
  if (h['x-generator']) tech.push({ name: h['x-generator'], category: 'CMS' });
  if (h['cf-ray']) tech.push({ name: 'Cloudflare', category: 'CDN' });
  if (h['x-amz-cf-id']) tech.push({ name: 'AWS CloudFront', category: 'CDN' });
  if (h['x-vercel-id']) tech.push({ name: 'Vercel', category: 'Hosting' });
  if (/wp-content|wp-includes/i.test(html)) tech.push({ name: 'WordPress', category: 'CMS' });
  if (/drupal-settings/i.test(html)) tech.push({ name: 'Drupal', category: 'CMS' });
  if (/Joomla/i.test(html)) tech.push({ name: 'Joomla', category: 'CMS' });
  if (/react/i.test(html) && /__REACT_/i.test(html)) tech.push({ name: 'React', category: 'JS Framework' });
  if (/ng-version=/i.test(html)) tech.push({ name: 'Angular', category: 'JS Framework' });
  if (/__NEXT_DATA__/i.test(html)) tech.push({ name: 'Next.js', category: 'JS Framework' });
  if (/__NUXT__/i.test(html)) tech.push({ name: 'Nuxt.js', category: 'JS Framework' });
  if (/jquery[.-]/i.test(html)) tech.push({ name: 'jQuery', category: 'JS Library' });
  return tech;
}

// Subdomain takeover fingerprints
export const TAKEOVER_FINGERPRINTS = [
  { service: 'GitHub Pages', cname: /github\.io$/, body: /There isn't a GitHub Pages site here/ },
  { service: 'Heroku', cname: /herokuapp\.com$/, body: /No such app/ },
  { service: 'AWS S3', cname: /s3[.-].*amazonaws\.com$/, body: /NoSuchBucket/ },
  { service: 'Shopify', cname: /myshopify\.com$/, body: /Sorry, this shop is currently unavailable/ },
  { service: 'Tumblr', cname: /domains\.tumblr\.com$/, body: /Whatever you were looking for doesn't currently exist/ },
  { service: 'Squarespace', cname: /squarespace\.com$/, body: /No Such Account/ },
  { service: 'Unbounce', cname: /unbouncepages\.com$/, body: /The requested URL was not found/ },
  { service: 'Fastly', cname: /fastly\.net$/, body: /Fastly error: unknown domain/ },
  { service: 'Pantheon', cname: /pantheonsite\.io$/, body: /The gods are wise/ },
  { service: 'Ghost', cname: /ghost\.io$/, body: /The thing you were looking for is no longer here/ },
  { service: 'Vercel', cname: /vercel-dns\.com$/, body: /The deployment could not be found/ }
];

// Secret scanner regex patterns
export const SECRET_PATTERNS = [
  { name: 'AWS Access Key', re: /AKIA[0-9A-Z]{16}/g },
  { name: 'AWS Secret Key', re: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g, confidence: 'low' },
  { name: 'GitHub Token', re: /ghp_[A-Za-z0-9]{36}/g },
  { name: 'GitHub OAuth', re: /gho_[A-Za-z0-9]{36}/g },
  { name: 'GitHub App Token', re: /(ghu|ghs)_[A-Za-z0-9]{36}/g },
  { name: 'Slack Token', re: /xox[abprs]-[A-Za-z0-9-]+/g },
  { name: 'Slack Webhook', re: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/g },
  { name: 'Google API Key', re: /AIza[0-9A-Za-z\-_]{35}/g },
  { name: 'Stripe Live Key', re: /sk_live_[0-9a-zA-Z]{24,}/g },
  { name: 'Stripe Pub Key', re: /pk_live_[0-9a-zA-Z]{24,}/g },
  { name: 'JWT', re: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
  { name: 'Private Key', re: /-----BEGIN ((RSA|EC|DSA|OPENSSH|PGP) )?PRIVATE KEY-----/g },
  { name: 'Mailgun Key', re: /key-[0-9a-zA-Z]{32}/g },
  { name: 'Twilio SID', re: /AC[a-z0-9]{32}/g },
  { name: 'SendGrid Key', re: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g },
  { name: 'Generic API Key', re: /(?:api[_-]?key|apikey|secret)["'\s:=]+["']?([A-Za-z0-9_\-]{20,})/gi, confidence: 'low' },
  { name: 'Generic Password', re: /(?:password|passwd|pwd)["'\s:=]+["']([^"']{6,})["']/gi, confidence: 'low' }
];

export function scanSecrets(text) {
  const found = [];
  for (const p of SECRET_PATTERNS) {
    let m;
    p.re.lastIndex = 0;
    while ((m = p.re.exec(text)) !== null) {
      found.push({ type: p.name, match: m[0].slice(0, 80), index: m.index, confidence: p.confidence || 'high' });
      if (found.length > 200) break;
    }
  }
  return found;
}

export function extractEndpoints(jsText) {
  const re = /["'`](\/[a-zA-Z0-9_\-./?=&%]{3,200})["'`]/g;
  const set = new Set();
  let m;
  while ((m = re.exec(jsText)) !== null) set.add(m[1]);
  return [...set];
}
