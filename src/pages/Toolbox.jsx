import React, { useState } from 'react';
import EncoderTool from '../tools/EncoderTool.jsx';
import HashTool from '../tools/HashTool.jsx';
import JwtTool from '../tools/JwtTool.jsx';
import DirFuzzer from '../tools/DirFuzzer.jsx';
import ParamFuzzer from '../tools/ParamFuzzer.jsx';
import PortProbe from '../tools/PortProbe.jsx';
import VulnScanner from '../tools/VulnScanner.jsx';
import XssSqliTester from '../tools/XssSqliTester.jsx';
import CorsTester from '../tools/CorsTester.jsx';
import WafDetector from '../tools/WafDetector.jsx';
import RequestSender from '../tools/RequestSender.jsx';
import CspAnalyzer from '../tools/CspAnalyzer.jsx';
import CookieAnalyzer from '../tools/CookieAnalyzer.jsx';
import OpenRedirect from '../tools/OpenRedirect.jsx';
import PathTraversal from '../tools/PathTraversal.jsx';
import JsCrawler from '../tools/JsCrawler.jsx';
import RobotsSitemap from '../tools/RobotsSitemap.jsx';

const TABS = [
  { id: 'request', name: 'HTTP Request', comp: RequestSender },
  { id: 'vuln', name: 'Vuln Scanner', comp: VulnScanner },
  { id: 'dir', name: 'Dir Fuzzer', comp: DirFuzzer },
  { id: 'param', name: 'Param Fuzzer', comp: ParamFuzzer },
  { id: 'xss', name: 'XSS / SQLi', comp: XssSqliTester },
  { id: 'redirect', name: 'Open Redirect', comp: OpenRedirect },
  { id: 'lfi', name: 'Path Traversal', comp: PathTraversal },
  { id: 'cors', name: 'CORS', comp: CorsTester },
  { id: 'csp', name: 'CSP Analyzer', comp: CspAnalyzer },
  { id: 'cookie', name: 'Cookie Analyzer', comp: CookieAnalyzer },
  { id: 'waf', name: 'WAF', comp: WafDetector },
  { id: 'port', name: 'Port Probe', comp: PortProbe },
  { id: 'js', name: 'JS Crawler', comp: JsCrawler },
  { id: 'robots', name: 'Robots/Sitemap', comp: RobotsSitemap },
  { id: 'jwt', name: 'JWT', comp: JwtTool },
  { id: 'hash', name: 'Hash', comp: HashTool },
  { id: 'encode', name: 'Encoder', comp: EncoderTool }
];

export default function Toolbox() {
  const [tab, setTab] = useState('request');
  const T = TABS.find(t => t.id === tab);
  const Comp = T.comp;
  return (
    <>
      <div className="panel">
        <div className="row" style={{flexWrap:'wrap'}}>
          {TABS.map(t => (
            <button key={t.id} className={t.id===tab?'':'ghost'} onClick={() => setTab(t.id)}>{t.name}</button>
          ))}
        </div>
      </div>
      <Comp />
    </>
  );
}
