import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const OUT = 'docs/screenshots';
mkdirSync(OUT, { recursive: true });

const pages = [
  { hash: '/', name: '01-dashboard', seed: false },
  { hash: '/workflow', name: '02-workflow', seed: false },
  { hash: '/toolkit', name: '03-passive-recon', seed: false },
  { hash: '/http', name: '04-http-inspector', seed: false },
  { hash: '/toolbox', name: '05-toolbox-request', seed: false },
  { hash: '/toolbox', name: '06-toolbox-vuln-scanner', click: 'Vuln Scanner' },
  { hash: '/toolbox', name: '07-toolbox-jwt', click: 'JWT' },
  { hash: '/toolbox', name: '08-toolbox-encoder', click: 'Encoder' },
  { hash: '/secrets', name: '09-secret-scanner', seed: false },
  { hash: '/payloads', name: '10-payloads', seed: false },
  { hash: '/vulns', name: '11-vulnerabilities', seed: true },
  { hash: '/checklists', name: '12-checklists', seed: false }
];

const seed = `(() => {
  const data = {
    workspace: 'default', workspaces: ['default'], history: [],
    targets: [
      { id: 't1', name: 'Acme Corp', platform: 'HackerOne', url: 'https://hackerone.com/acme', payout: '$10,000', notes: '', createdAt: Date.now() },
      { id: 't2', name: 'Globex Bug Bounty', platform: 'Bugcrowd', url: 'https://bugcrowd.com/globex', payout: '$5,000', notes: '', createdAt: Date.now() }
    ],
    scope: [
      { id: 's1', asset: '*.acme.com', type: 'Wildcard', program: 'Acme Corp', inScope: true, createdAt: Date.now() },
      { id: 's2', asset: 'api.globex.io', type: 'Domain', program: 'Globex Bug Bounty', inScope: true, createdAt: Date.now() }
    ],
    subdomains: [], endpoints: [],
    vulns: [
      { id: 'v1', title: 'Reflected XSS in search parameter', type: 'XSS', severity: 'high', status: 'triaged', target: 'Acme Corp', url: 'https://acme.com/search?q=', description: 'The search parameter reflects user input without sanitization.', steps: '1. Visit /search?q=<script>alert(1)</script>', impact: 'Session hijacking, credential theft.', remediation: 'Escape HTML output.', poc: '<script>alert(1)</script>', createdAt: Date.now()-86400000 },
      { id: 'v2', title: 'SQL Injection in /api/users/:id', type: 'SQLi', severity: 'critical', status: 'open', target: 'Acme Corp', url: 'https://api.acme.com/users/1', description: 'UNION-based injection.', steps: '', impact: 'Full DB compromise.', remediation: 'Use prepared statements.', poc: "' UNION SELECT NULL,NULL--", createdAt: Date.now()-43200000 },
      { id: 'v3', title: 'Subdomain takeover: dev.globex.io', type: 'Subdomain Takeover', severity: 'high', status: 'open', target: 'Globex', url: 'https://dev.globex.io', description: 'CNAME points to deleted Heroku app.', steps: '', impact: '', remediation: '', poc: '', createdAt: Date.now()-3600000 },
      { id: 'v4', title: 'Missing security headers', type: 'Info Disclosure', severity: 'low', status: 'resolved', target: 'Acme Corp', url: 'https://acme.com', description: '', steps: '', impact: '', remediation: '', poc: '', createdAt: Date.now()-172800000 },
      { id: 'v5', title: 'IDOR on /api/orders/:id', type: 'IDOR', severity: 'medium', status: 'triaged', target: 'Globex', url: '', description: '', steps: '', impact: '', remediation: '', poc: '', createdAt: Date.now()-7200000 }
    ],
    notes: [], reports: [],
    payloads: JSON.parse(localStorage.getItem('bbf:v1') || '{}').payloads || [],
    checklists: JSON.parse(localStorage.getItem('bbf:v1') || '{}').checklists || {}
  };
  const existing = JSON.parse(localStorage.getItem('bbf:v1') || '{}');
  localStorage.setItem('bbf:v1', JSON.stringify({ ...existing, ...data }));
})()`;

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await page.evaluate(seed);
await page.reload({ waitUntil: 'networkidle0' });

for (const p of pages) {
  await page.evaluate((h) => { location.hash = '#' + h; }, p.hash);
  await new Promise(r => setTimeout(r, 600));
  if (p.click) {
    await page.evaluate((t) => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === t);
      if (btn) btn.click();
    }, p.click);
    await new Promise(r => setTimeout(r, 400));
  }
  const file = `${OUT}/${p.name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file);
}

await browser.close();
