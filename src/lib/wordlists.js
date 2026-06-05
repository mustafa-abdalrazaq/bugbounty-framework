// Built-in wordlists for browser-native fuzzing.

export const COMMON_PATHS = [
  // Admin / auth
  'admin','admin/','administrator','administrator/','admin.php','admin.html','admin/login','admin/index.php',
  'login','login.php','login.html','logout','signin','sign-in','signup','sign-up','register','auth','authenticate',
  'oauth','oauth2','sso','saml','password-reset','reset','forgot','forgot-password','change-password',
  '2fa','mfa','totp','verify','verification','account','accounts','profile','profiles','user','users','me',
  // API
  'api','api/','api/v1','api/v2','api/v3','api/v4','api/latest','rest','rest/v1','graphql','graphiql','playground',
  'api/users','api/user','api/admin','api/auth','api/login','api/me','api/v1/users','api/v1/auth','api/v1/admin',
  'api/internal','api/private','api/public','api/health','api/status','api/version','api/docs','api/swagger',
  'swagger','swagger.json','swagger.yaml','swagger-ui','swagger-ui.html','openapi.json','openapi.yaml','api-docs','redoc',
  'docs','documentation','postman.json','insomnia.json',
  // WordPress
  'wp-admin','wp-admin/','wp-login.php','wp-content','wp-content/uploads','wp-includes','wp-json','wp-json/wp/v2/users',
  'xmlrpc.php','wp-config.php','wp-config.php.bak','wp-config.bak','wp-config.old','wp-config.txt','readme.html',
  // PHP/info disclosure
  'phpinfo.php','info.php','test.php','php.php','i.php','pi.php','phpmyadmin','phpmyadmin/','pma','adminer','adminer.php',
  // Source control
  '.git','.git/','.git/config','.git/HEAD','.git/index','.git/logs/HEAD','.git/refs/heads/master','.git/refs/heads/main',
  '.gitignore','.gitattributes','.gitkeep','.gitlab-ci.yml','.github','.github/workflows',
  '.svn','.svn/entries','.svn/wc.db','.hg','.hg/store','.bzr','.cvs','CVS','CVS/Entries',
  // Env / secrets
  '.env','.env.local','.env.production','.env.development','.env.staging','.env.test','.env.example','.env.backup',
  '.aws/credentials','.aws/config','.ssh/id_rsa','.ssh/authorized_keys','.netrc','.htaccess','.htpasswd','.npmrc','.pypirc',
  'credentials','credentials.json','credentials.txt','secret','secrets','secrets.json','secrets.yml','secrets.yaml',
  // Hidden files
  '.DS_Store','Thumbs.db','.idea','.vscode','.vs','.project','.classpath','.metadata','desktop.ini',
  // Meta
  'robots.txt','sitemap.xml','sitemap.txt','sitemap_index.xml','sitemap-index.xml','crossdomain.xml','clientaccesspolicy.xml',
  'humans.txt','security.txt','.well-known/security.txt','.well-known/dnt-policy.txt','.well-known/openid-configuration',
  '.well-known/acme-challenge','.well-known/jwks.json','.well-known/oauth-authorization-server','ads.txt','app-ads.txt',
  // Backups
  'backup','backup/','backup.zip','backup.tar','backup.tar.gz','backup.tgz','backup.rar','backup.7z','backup.sql','backup.sql.gz',
  'backups','backups/','db.sql','db.sql.gz','database.sql','database.dump','dump.sql','dump.gz','dump.zip',
  'site.zip','www.zip','public.zip','public_html.zip','export.zip','data.zip','assets.zip',
  // Config files
  'config','config/','config.php','config.json','config.yml','config.yaml','config.xml','config.ini','config.bak','config.old',
  'settings','settings.json','settings.py','settings.xml','local_settings.py','web.config','app.config','application.properties',
  'application.yml','application.yaml','appsettings.json','appsettings.Development.json','docker-compose.yml','dockerfile',
  'Dockerfile','.dockerignore','docker-compose.yaml','Makefile','Gemfile','Gemfile.lock','package.json','package-lock.json',
  'composer.json','composer.lock','yarn.lock','pnpm-lock.yaml','requirements.txt','Pipfile','Pipfile.lock','pyproject.toml',
  'pom.xml','build.gradle','settings.gradle','tsconfig.json','webpack.config.js','vite.config.js',
  // Test/staging
  'test','tests','testing','test/','console','debug','debug.php','demo','example','samples','beta','alpha','dev','development',
  'staging','stage','prod','production','old','new','tmp','temp','cache','sandbox','playground','preview','live',
  // File ops
  'upload','uploads','uploads/','upload.php','file','files','files/','download','downloads','media','assets','static',
  'images','img','imgs','pics','photos','videos','docs','documents','attachments','public','private','protected',
  // Common entries
  'index','index.php','index.html','index.htm','index.jsp','index.asp','index.aspx','default','default.html','home',
  'main','start','welcome','landing','about','contact','help','support','faq','terms','privacy',
  // Search/forms
  'search','find','query','feed','feeds','rss','atom.xml','rss.xml','contact.php','contact.html','form','forms',
  // CGI / classic
  'cgi-bin','cgi-bin/','cgi-bin/test.cgi','cgi-bin/printenv.pl','server-status','server-info','server-status?refresh=5',
  '/status','/health','/healthz','/readyz','/livez','/metrics','/version','/ping','/info','/env','/dump','/trace',
  // Spring Boot Actuator
  'actuator','actuator/','actuator/health','actuator/info','actuator/env','actuator/configprops','actuator/mappings',
  'actuator/beans','actuator/dump','actuator/trace','actuator/httptrace','actuator/heapdump','actuator/threaddump',
  'actuator/loggers','actuator/metrics','actuator/auditevents','actuator/scheduledtasks','actuator/sessions',
  'actuator/jolokia','actuator/prometheus','actuator/gateway/routes',
  // Cloud metadata (browser can't access but server may proxy)
  'metadata','latest/meta-data','latest/meta-data/','latest/meta-data/iam/security-credentials',
  // Common monitoring
  'jenkins','jenkins/','grafana','kibana','prometheus','rabbitmq','elasticsearch','kibana/app/kibana','solr',
  'console.html','manager','manager/html','manager/status','host-manager','host-manager/html','jmx-console',
  // CMS specific
  'drupal','user/login','user/register','administrator/index.php','installation','install.php','install','setup',
  'setup.php','config-sample.php','LICENSE','license.txt','CHANGELOG.md','CHANGELOG','RELEASE_NOTES.txt',
  // Build artifacts
  '_next','_next/static','_nuxt','_vercel','__webpack','manifest.json','asset-manifest.json','service-worker.js','sw.js',
  'main.js','app.js','bundle.js','vendor.js','runtime.js','chunks','chunks/main.js',
  // Misc
  'login.action','login.do','login.jsp','admin.jsp','admin.do','admin.action','j_security_check',
  'CONNECT','PROPFIND','MKCOL','TRACE','OPTIONS','HEAD'
];

export const COMMON_PARAMS = [
  // IDs / refs
  'id','uid','user_id','userid','user','account','account_id','member_id','customer_id','client_id','tenant_id',
  'order','order_id','invoice','invoice_id','transaction','transaction_id','payment_id','session','session_id','sid',
  'item','item_id','product','product_id','sku','post','post_id','article','article_id','comment','comment_id',
  // Auth
  'username','email','login','pass','password','passwd','pwd','secret','token','api_key','apikey','api-key','access_token',
  'auth','authorization','authtoken','jwt','bearer','key','sig','signature','code','nonce','state','csrf','xsrf','csrf_token',
  // Search / queries
  'q','query','search','s','keyword','term','filter','find','where','wildcard',
  // Pagination
  'page','p','offset','limit','per_page','start','end','from','to','count','size','take','skip','cursor','after','before',
  // Sort/order
  'sort','sort_by','order','order_by','direction','dir','asc','desc',
  // File / URL
  'file','filename','filepath','path','dir','folder','document','doc','attachment','upload','image','img','photo','video',
  'url','uri','link','href','src','source','target','dest','destination','redirect','return','returnUrl','return_url',
  'redirect_uri','redirect_url','next','continue','goto','jump','forward','back','referer','referrer','callback','jsonp',
  // Format / output
  'format','output','type','content','content_type','mime','charset','encoding','lang','language','locale','region','country',
  'currency','timezone','tz',
  // Debug / dev
  'debug','test','dev','admin','role','priv','privilege','permission','superuser','god','elevated',
  'action','do','op','operation','cmd','exec','command','run','task','job','func','function','method','call',
  // Templates / data
  'template','view','layout','theme','skin','module','plugin','widget','data','json','xml','yaml','config',
  'body','msg','message','text','content','html','title','description','name','value','val','input',
  // Categories
  'category','cat','tag','tags','group','class','kind','status','state',
  // Numeric ranges
  'min','max','low','high','from_date','to_date','date','time','timestamp','created','updated','modified',
  // Misc
  'username','firstname','lastname','first_name','last_name','phone','mobile','address','city','zip','postcode','country',
  'gender','dob','age','birthday','company','organization','department','title','position',
  // SSRF-prone
  'host','hostname','domain','server','endpoint','webhook','proxy','fetch','include','require','load',
  // Common form
  'comments','feedback','subject','reason','captcha','recaptcha','g-recaptcha-response','h-captcha-response'
];

export const TOP_PORTS = [
  { port: 80, scheme: 'http', name: 'HTTP' },
  { port: 443, scheme: 'https', name: 'HTTPS' },
  { port: 8080, scheme: 'http', name: 'HTTP-alt' },
  { port: 8443, scheme: 'https', name: 'HTTPS-alt' },
  { port: 8000, scheme: 'http', name: 'HTTP-dev' },
  { port: 8001, scheme: 'http', name: 'HTTP-alt' },
  { port: 8008, scheme: 'http', name: 'HTTP-alt' },
  { port: 8081, scheme: 'http', name: 'HTTP-alt' },
  { port: 8888, scheme: 'http', name: 'HTTP-alt' },
  { port: 8090, scheme: 'http', name: 'Confluence' },
  { port: 3000, scheme: 'http', name: 'Node/Grafana' },
  { port: 4000, scheme: 'http', name: 'HTTP' },
  { port: 5000, scheme: 'http', name: 'Flask/upnp' },
  { port: 7000, scheme: 'http', name: 'HTTP' },
  { port: 9000, scheme: 'http', name: 'PHP-FPM/SonarQube' },
  { port: 9090, scheme: 'http', name: 'Prometheus' },
  { port: 9200, scheme: 'http', name: 'Elasticsearch' },
  { port: 9300, scheme: 'http', name: 'Elasticsearch' },
  { port: 5601, scheme: 'http', name: 'Kibana' },
  { port: 15672, scheme: 'http', name: 'RabbitMQ Mgmt' },
  { port: 8086, scheme: 'http', name: 'InfluxDB' },
  { port: 8161, scheme: 'http', name: 'ActiveMQ' },
  { port: 8500, scheme: 'http', name: 'Consul' },
  { port: 8200, scheme: 'http', name: 'Vault' },
  { port: 5984, scheme: 'http', name: 'CouchDB' },
  { port: 7474, scheme: 'http', name: 'Neo4j' },
  { port: 8983, scheme: 'http', name: 'Solr' }
];

export const COMMON_PASSWORDS = [
  'password','123456','12345678','12345','1234','123456789','qwerty','abc123','password1','password123',
  'admin','administrator','letmein','welcome','welcome1','monkey','dragon','master','login','passw0rd',
  'P@ssw0rd','P@ssword','Passw0rd','Password1','Password123','root','toor','test','test123','guest','user',
  'demo','pass','111111','000000','666666','888888','123123','1234567','12345678','1234567890','iloveyou',
  'sunshine','princess','azerty','trustno1','batman','football','baseball','superman','michael','shadow',
  'access','flower','jordan','hunter','buster','soccer','harley','andrew','tigger','daniel','andrea','joshua',
  'ashley','matthew','tigers','silver','solo','summer','spring','winter','autumn','school','college','college1',
  'forever','secret','secret1','god','jesus','christ','heaven','angel','samantha','jennifer','jordan23',
  'thomas','liverpool','arsenal','chelsea','manutd','barcelona','madrid','football1','helpme','hello','hello1',
  'starwars','starwars1','computer','computer1','internet','google','microsoft','apple','samsung','huawei',
  'changeme','default','admin123','admin1234','admin12345','rootroot','toortoor','qwerty123','qwerty1',
  'qazwsx','qazwsxedc','zaq12wsx','1qaz2wsx','asdf','asdfgh','asdfghjkl','zxcvbn','zxcvbnm','password!',
  'P@$$w0rd','P@$$word','Admin@123','admin@123','admin@2023','admin@2024','Welcome1','Welcome123',
  'Spring2024','Summer2024','Winter2024','Fall2024','Spring2023','Summer2023','Winter2023','Fall2023',
  'company','company1','company123','test1','test1234','demo1','demo123','sample','sample1','default1',
  'support','support1','support123','helpdesk','helpdesk1','operator','operator1','manager','manager1',
  'sa','sasa','sa123','sql','oracle','postgres','mysql','mssql','mongodb','redis','elastic',
  'jenkins','tomcat','admin1','admin12','admintest','letmein1','letmein123','111222','123321','321321',
  'changeit','changeit!','letmein!','admin!','admin!@#','administrator123','root123','toor123',
  'a','aa','aaa','aaaa','b','bb','bbb','1','11','111','11111','1111','22','222','2222','22222',
  'webmaster','webmaster123','sysadmin','sysadmin123','networkadmin','dbadmin','dbadmin123',
  'devuser','devops','jenkins123','build','build1','deploy','deploy1','staging','production',
  'temp123','temppass','newuser','newuser1','newpass','newpass1','changepass','changepassword'
];

// Greatly expanded Nuclei-style templates
export const VULN_TEMPLATES = [
  // Exposed VCS
  { id: 'git-config', name: '.git/config exposed', severity: 'high', path: '/.git/config', match: /\[core\]|\[remote/ },
  { id: 'git-head', name: '.git/HEAD exposed', severity: 'medium', path: '/.git/HEAD', match: /ref:\s+refs\/heads\// },
  { id: 'git-index', name: '.git/index accessible', severity: 'high', path: '/.git/index', matchBytes: [0x44,0x49,0x52,0x43] },
  { id: 'svn-entries', name: '.svn/entries exposed', severity: 'medium', path: '/.svn/entries', match: /svn:|dir|file/ },
  { id: 'hg-store', name: '.hg/store exposed', severity: 'medium', path: '/.hg/store/00manifest.i', status: [200] },
  // Env / secrets
  { id: 'env-exposed', name: '.env file exposed', severity: 'critical', path: '/.env', match: /^[A-Z_]+=.+/m },
  { id: 'env-local', name: '.env.local exposed', severity: 'critical', path: '/.env.local', match: /^[A-Z_]+=/m },
  { id: 'env-prod', name: '.env.production exposed', severity: 'critical', path: '/.env.production', match: /^[A-Z_]+=/m },
  { id: 'env-bak', name: '.env.bak exposed', severity: 'critical', path: '/.env.bak', match: /^[A-Z_]+=/m },
  { id: 'aws-creds', name: '.aws/credentials exposed', severity: 'critical', path: '/.aws/credentials', match: /aws_access_key/i },
  { id: 'htpasswd', name: '.htpasswd exposed', severity: 'critical', path: '/.htpasswd', match: /^\S+:\$/m },
  { id: 'ssh-key', name: 'SSH private key exposed', severity: 'critical', path: '/id_rsa', match: /BEGIN.*PRIVATE KEY/ },
  // Info disclosure
  { id: 'phpinfo', name: 'phpinfo() exposed', severity: 'medium', path: '/phpinfo.php', match: /<title>phpinfo\(\)/i },
  { id: 'phpinfo2', name: 'info.php phpinfo', severity: 'medium', path: '/info.php', match: /<title>phpinfo\(\)/i },
  { id: 'phpinfo3', name: 'test.php phpinfo', severity: 'medium', path: '/test.php', match: /<title>phpinfo\(\)/i },
  { id: 'ds-store', name: '.DS_Store exposed', severity: 'low', path: '/.DS_Store', matchBytes: [0,0,0,1,0x42,0x75,0x64,0x31] },
  { id: 'thumbs-db', name: 'Thumbs.db exposed', severity: 'low', path: '/Thumbs.db', matchBytes: [0xD0,0xCF,0x11,0xE0] },
  // Backup files
  { id: 'wp-config-bak', name: 'wp-config.php.bak exposed', severity: 'critical', path: '/wp-config.php.bak', match: /DB_PASSWORD/ },
  { id: 'config-bak', name: 'config.php.bak exposed', severity: 'critical', path: '/config.php.bak', match: /(password|secret|api_key)/i },
  { id: 'web-config', name: 'web.config exposed', severity: 'high', path: '/web.config', match: /<configuration|<system\.web/i },
  { id: 'backup-zip', name: 'backup.zip accessible', severity: 'high', path: '/backup.zip', status: [200], minSize: 100 },
  { id: 'db-sql', name: 'db.sql accessible', severity: 'critical', path: '/db.sql', match: /CREATE TABLE|INSERT INTO|DROP TABLE/i },
  { id: 'dump-sql', name: 'dump.sql accessible', severity: 'critical', path: '/dump.sql', match: /CREATE TABLE|INSERT INTO/i },
  // Spring Actuator
  { id: 'actuator-env', name: 'Spring actuator/env exposed', severity: 'high', path: '/actuator/env', match: /activeProfiles|propertySources/ },
  { id: 'actuator-health', name: 'Spring actuator/health exposed', severity: 'info', path: '/actuator/health', match: /"status"\s*:\s*"UP"/i },
  { id: 'actuator-heapdump', name: 'Spring actuator heapdump exposed', severity: 'critical', path: '/actuator/heapdump', matchBytes: [0x4A,0x41,0x56,0x41] },
  { id: 'actuator-mappings', name: 'Spring actuator/mappings exposed', severity: 'medium', path: '/actuator/mappings', match: /handler|predicate/ },
  { id: 'actuator-beans', name: 'Spring actuator/beans exposed', severity: 'medium', path: '/actuator/beans', match: /beans|aliases/ },
  { id: 'actuator-loggers', name: 'Spring actuator/loggers exposed', severity: 'medium', path: '/actuator/loggers', match: /configuredLevel|effectiveLevel/ },
  { id: 'actuator-trace', name: 'Spring actuator/trace exposed', severity: 'high', path: '/actuator/httptrace', match: /timestamp|principal/ },
  // CMS
  { id: 'wp-readme', name: 'WordPress readme.html', severity: 'low', path: '/readme.html', match: /WordPress/ },
  { id: 'wp-users', name: 'WP users enumeration', severity: 'medium', path: '/wp-json/wp/v2/users', match: /"id":\s*\d+/ },
  { id: 'wp-xmlrpc', name: 'WordPress XML-RPC exposed', severity: 'low', path: '/xmlrpc.php', match: /XML-RPC server accepts POST requests only/ },
  { id: 'drupal-install', name: 'Drupal install.php exposed', severity: 'high', path: '/install.php', match: /Drupal/i },
  { id: 'joomla-install', name: 'Joomla installation exposed', severity: 'high', path: '/installation/index.php', match: /Joomla/i },
  // GraphQL
  { id: 'graphql-introspect', name: 'GraphQL introspection enabled', severity: 'medium', path: '/graphql', method: 'POST', body: '{"query":"{__schema{types{name}}}"}', match: /__schema/ },
  { id: 'graphql-playground', name: 'GraphiQL/Playground exposed', severity: 'low', path: '/graphiql', match: /GraphiQL|playground/i },
  { id: 'graphql-playground2', name: 'GraphQL playground exposed', severity: 'low', path: '/playground', match: /GraphQL Playground/i },
  // SQL errors
  { id: 'sqli-id', name: 'SQL error on /?id=1\'', severity: 'high', path: '/?id=1\'', match: /SQL syntax|mysql_fetch|ORA-\d+|PostgreSQL.*ERROR|sqlite_/i },
  { id: 'sqli-page', name: 'SQL error on /?page=1\'', severity: 'high', path: '/?page=1\'', match: /SQL syntax|mysql_fetch|ORA-\d+|PostgreSQL.*ERROR/i },
  // Open redirect
  { id: 'open-redirect-url', name: 'Open redirect on ?url=', severity: 'medium', path: '/?url=https://evil.com', checkLocation: 'evil.com' },
  { id: 'open-redirect-redirect', name: 'Open redirect on ?redirect=', severity: 'medium', path: '/?redirect=https://evil.com', checkLocation: 'evil.com' },
  { id: 'open-redirect-next', name: 'Open redirect on ?next=', severity: 'medium', path: '/?next=https://evil.com', checkLocation: 'evil.com' },
  // Server status / management
  { id: 'apache-status', name: 'Apache server-status exposed', severity: 'medium', path: '/server-status', match: /Apache Server Status/ },
  { id: 'apache-info', name: 'Apache server-info exposed', severity: 'medium', path: '/server-info', match: /Apache Server Information/ },
  { id: 'nginx-status', name: 'Nginx status exposed', severity: 'low', path: '/nginx_status', match: /Active connections/ },
  { id: 'tomcat-manager', name: 'Tomcat manager exposed', severity: 'high', path: '/manager/html', match: /Tomcat|manager/i, status: [200, 401] },
  { id: 'jenkins-script', name: 'Jenkins script console', severity: 'critical', path: '/script', match: /Jenkins.*Script Console/i },
  // Misc
  { id: 'admin-panel', name: 'Admin panel accessible', severity: 'info', path: '/admin', status: [200], match: /admin|login|dashboard|sign in/i },
  { id: 'admin-panel2', name: 'Administrator panel accessible', severity: 'info', path: '/administrator', status: [200] },
  { id: 'phpmyadmin', name: 'phpMyAdmin accessible', severity: 'medium', path: '/phpmyadmin/', match: /phpMyAdmin/i },
  { id: 'adminer', name: 'Adminer DB tool exposed', severity: 'medium', path: '/adminer.php', match: /Adminer|adminer/ },
  { id: 'swagger-ui', name: 'Swagger UI exposed', severity: 'info', path: '/swagger-ui.html', match: /swagger-ui/i },
  { id: 'swagger-json', name: 'Swagger JSON exposed', severity: 'info', path: '/swagger.json', match: /"swagger"|"openapi"/ },
  { id: 'security-txt', name: 'security.txt present', severity: 'info', path: '/.well-known/security.txt', match: /Contact:|Policy:/i },
  { id: 'crossdomain', name: 'crossdomain.xml permissive', severity: 'low', path: '/crossdomain.xml', match: /<allow-access-from\s+domain="\*"/ },
  { id: 'clientaccess', name: 'clientaccesspolicy.xml permissive', severity: 'low', path: '/clientaccesspolicy.xml', match: /<domain\s+uri="\*"/ },
  { id: 'jwks', name: 'JWKS endpoint exposed', severity: 'info', path: '/.well-known/jwks.json', match: /"keys"\s*:/ },
  { id: 'openid-config', name: 'OpenID config exposed', severity: 'info', path: '/.well-known/openid-configuration', match: /"issuer"/ },
  // Headers/cache
  { id: 'trace-method', name: 'TRACE method enabled', severity: 'low', path: '/', method: 'TRACE', status: [200] }
];

// WAF fingerprints
export const WAF_SIGS = [
  { name: 'Cloudflare', headerKey: 'server', match: /cloudflare/i },
  { name: 'Cloudflare', headerKey: 'cf-ray', match: /.+/ },
  { name: 'Cloudflare', headerKey: 'cf-cache-status', match: /.+/ },
  { name: 'AWS WAF', headerKey: 'x-amzn-requestid', match: /.+/ },
  { name: 'AWS CloudFront', headerKey: 'x-amz-cf-id', match: /.+/ },
  { name: 'Akamai', headerKey: 'server', match: /akamai/i },
  { name: 'Akamai', headerKey: 'x-akamai-transformed', match: /.+/ },
  { name: 'Akamai', headerKey: 'akamai-grn', match: /.+/ },
  { name: 'Sucuri', headerKey: 'server', match: /sucuri/i },
  { name: 'Sucuri', headerKey: 'x-sucuri-id', match: /.+/ },
  { name: 'Sucuri', headerKey: 'x-sucuri-cache', match: /.+/ },
  { name: 'Imperva Incapsula', headerKey: 'x-iinfo', match: /.+/ },
  { name: 'Imperva Incapsula', headerKey: 'set-cookie', match: /incap_ses|visid_incap/i },
  { name: 'F5 BIG-IP', headerKey: 'server', match: /BigIP|BIG-IP/i },
  { name: 'F5 BIG-IP', headerKey: 'set-cookie', match: /BIGipServer|TS[0-9a-f]{8}/i },
  { name: 'Barracuda', headerKey: 'set-cookie', match: /barra_counter_session/i },
  { name: 'ModSecurity', headerKey: 'server', match: /mod_security|modsecurity|NOYB/i },
  { name: 'Fastly', headerKey: 'x-served-by', match: /cache-/i },
  { name: 'Fastly', headerKey: 'fastly-debug-digest', match: /.+/ },
  { name: 'Varnish', headerKey: 'x-varnish', match: /.+/ },
  { name: 'Varnish', headerKey: 'via', match: /varnish/i },
  { name: 'StackPath', headerKey: 'server', match: /stackpath/i },
  { name: 'Wordfence', headerKey: 'x-wordfence', match: /.+/ },
  { name: 'AzureFrontDoor', headerKey: 'x-azure-ref', match: /.+/ },
  { name: 'Google Cloud Armor', headerKey: 'via', match: /Google Frontend/ },
  { name: 'Reblaze', headerKey: 'set-cookie', match: /rbzid/i },
  { name: 'NetScaler', headerKey: 'set-cookie', match: /citrix_ns_id|NSC_/i },
  { name: 'NetScaler', headerKey: 'via', match: /NS-CACHE/i },
  { name: 'Edgecast', headerKey: 'server', match: /ECAcc|ECS/i }
];
