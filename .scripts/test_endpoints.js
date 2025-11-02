const http = require('http');
const https = require('https');
const urls = ['http://localhost:3001/', 'http://localhost:3001/html/index.html', 'http://localhost:3001/api/agents', 'http://localhost:3001/html/planification.html', 'http://localhost:3001/html/prepa.html'];

function fetchUrl(url) {
    return new Promise(resolve => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ url, status: res.statusCode, body: data.slice(0, 600) }));
        });
        req.on('error', (e) => resolve({ url, error: e.message }));
        req.setTimeout(10000, () => { req.abort(); resolve({ url, error: 'timeout' }); });
    });
}

(async () => {
    for (const u of urls) {
        console.log('==', u, '==');
        try {
            const r = await fetchUrl(u);
            if (r.error) console.log('ERROR:', r.error);
            else { console.log('Status:', r.status); console.log(r.body ? r.body : '<no body>'); }
        } catch (e) { console.log('EXCEPTION:', e && e.message); }
        console.log('\n');
    }
})();
