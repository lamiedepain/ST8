// api-sync.js
// Helper to load/save the shared agents JSON using the local server when available,
// falling back to the static file `../data/agents_source.json` when not.
(function (global) {
    async function fetchAgentsSource() {
        // Try explicit API host (node server) first, then origin, then fallback to file
        // Prefer relative API path (works whether served by node or static host).
        const candidates = [
            '/api/agents',
            (window.location && window.location.origin ? window.location.origin + '/api/agents' : '/api/agents')
        ];

        for (const url of candidates) {
            try {
                const resp = await fetch(url, { cache: 'no-store' });
                if (resp.ok) {
                    return await resp.json();
                }
                console.warn('[api-sync] ' + url + ' returned', resp.status);
            } catch (e) {
                console.warn('[api-sync] cannot reach ' + url + ', ' + (e && e.message));
            }
        }

        // Fallback to static file (use relative path)
        try {
            const fileResp = await fetch('../data/agents_source.json', { cache: 'no-store' });
            if (fileResp.ok) {
                return await fileResp.json();
            }
            throw new Error('File fetch failed: ' + fileResp.status);
        } catch (err) {
            console.error('[api-sync] failed to load agents from server(s) and file', err);
            throw err;
        }
    }

    async function postAgents(agents) {
        // Try multiple API endpoints (node server on 3000 first, then origin)
        // POST endpoints: use relative path first to avoid cross-origin/CSP issues.
        const endpoints = [
            '/api/agents',
            (window.location && window.location.origin ? window.location.origin + '/api/agents' : '/api/agents')
        ];

        for (const url of endpoints) {
            try {
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agents })
                });
                if (resp.ok) return true;
                console.warn('[api-sync] POST ' + url + ' returned', resp.status);
            } catch (e) {
                console.warn('[api-sync] cannot POST ' + url + ', ' + (e && e.message));
            }
        }

        // none succeeded
        return false;
    }

    global.ApiSync = { fetchAgentsSource, postAgents };
})(window);
