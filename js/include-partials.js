// Loader for simple HTML partials (static sites)
// Usage: place <div data-include="header"></div> or <div data-include="footer"></div>
// The loader will fetch /includes/<name>.html and inject the HTML.
(function () {
    async function loadInclude(el) {
        const name = el.getAttribute('data-include');
        if (!name) return;
        let url = name;
        // if not a path, map to /includes/<name>.html
        if (!url.includes('/') && !url.endsWith('.html')) {
            url = '/includes/' + name + '.html';
        }
        
        // Add loading state
        el.setAttribute('data-loading', 'true');
        
        try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) throw new Error('Failed to load ' + url + ' (' + res.status + ')');
            const text = await res.text();
            el.innerHTML = text;
            el.removeAttribute('data-loading');
            
            // post-process: if include is inside a header, propagate dataset attrs
            const header = el.closest('header');
            if (header) {
                const square = header.dataset.square || header.getAttribute('data-square');
                const title = header.dataset.title || header.getAttribute('data-title');
                const sub = header.dataset.sub || header.getAttribute('data-sub');
                if (square) {
                    const sq = el.querySelector('#header-square') || el.querySelector('.square');
                    if (sq) sq.textContent = square;
                }
                if (title) {
                    const t = el.querySelector('#header-title');
                    if (t) t.textContent = title;
                }
                if (sub) {
                    const s = el.querySelector('#header-sub');
                    if (s) s.textContent = sub;
                }
            }
        } catch (e) {
            console.error('Error loading include:', e);
            el.removeAttribute('data-loading');
            el.setAttribute('data-error', 'true');
            // keep element visible with an error marker
            el.innerHTML = '<!-- include failed: ' + name + ' -->';
        }
    }

    function init() {
        const nodes = document.querySelectorAll('[data-include]');
        nodes.forEach(n => loadInclude(n));
    }

    // Normalize root-level page links like '/agents.html' -> '/html/agents.html'
    // This avoids 404s when the server hasn't been restarted to map routes.
    function normalizeRootHtmlLinks() {
        const anchors = Array.from(document.querySelectorAll('a[href^="/"]'));
        anchors.forEach(a => {
            try {
                const href = a.getAttribute('href');
                // match '/name.html' but not '/html/name.html' and not deeper paths
                const m = href && href.match(/^\/([^\/]+\.html)$/);
                if (m) {
                    a.setAttribute('href', '/html/' + m[1]);
                }
            } catch (e) { /* ignore */ }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(); normalizeRootHtmlLinks(); });
    } else {
        init(); normalizeRootHtmlLinks();
    }
})();
