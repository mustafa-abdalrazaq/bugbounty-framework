# Bug Bounty Framework (BBF)

A 100% in-browser bug bounty workbench built with React. **No external tools required.** No Kali, no Node agent, no installed binaries — everything runs natively in the browser using `fetch`, Web Crypto, and built-in wordlists.

## Run

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

## Built-in tools (all native browser implementations)

**Live Tools**
- **Passive Recon** — subdomain enum via crt.sh + HackerTarget, DNS-over-HTTPS, Wayback URLs
- **HTTP Inspector** — security-header grader (A–F), tech fingerprinting
- **Secret Scanner** — 16 regex patterns + endpoint extraction
- **Takeover Checker** — CNAME → fingerprint match (11 services)

**Toolbox (11 tools)**
- **HTTP Request Builder** — Burp-style raw request with custom headers/body
- **Vuln Scanner** — 15 built-in templates (exposed .git/.env, Spring actuator heapdump, SQL errors, GraphQL introspection, open redirect, server-status, …) — imports findings to DB
- **Directory Fuzzer** — brute 100+ common paths with concurrency 10
- **Parameter Fuzzer** — discover hidden parameters via response-diff
- **XSS / SQLi Tester** — reflection, SQL error, time-based blind detection
- **CORS Tester** — 4 origin variants, detects reflection/wildcard/null issues
- **WAF Detector** — fingerprints 9 WAF/CDN families from headers
- **Port Probe** — 20 common web ports via fetch timing
- **JWT Tool** — decode, "alg:none" attack, HS256 secret cracker
- **Hash Tool** — MD5/SHA-1/256/384/512 generator + identifier + dictionary cracker
- **Encoder/Decoder** — Base64, URL, hex, HTML, Unicode, binary, ROT13, reverse

**Engagement tracking**
- Programs, Scope, Recon DB, Vulnerabilities (full CRUD), Payloads (16 categories), Checklists (Recon/Web/API), Notes, Markdown report generator

## Architecture

- React 18 + Vite + React Router
- Zero backend, zero external dependencies at runtime
- All state in `localStorage` (export/import JSON)
- Web Crypto API for SHA hashes + HMAC; pure-JS MD5
- Custom concurrent fetch worker pool

## Limitations (browser reality)

- CORS-blocked endpoints show as "cors" (host is reachable but response can't be read)
- Port scanning is HTTP-only (browsers can't open raw TCP sockets)
- No packet crafting, no native exploits — those need OS-level access browsers deliberately block

## Authorized use only

Test only against assets you have explicit permission to test (your own, bug bounty programs you're enrolled in, CTFs).
