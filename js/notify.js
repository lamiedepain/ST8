// notify.js
// Minimal toast notification helper used by the frontend for visual feedback on saves.
(function (global) {
    function ensureContainer() {
        let c = document.getElementById('st8-toast-container');
        if (!c) {
            c = document.createElement('div');
            c.id = 'st8-toast-container';
            c.style.position = 'fixed';
            c.style.right = '16px';
            c.style.bottom = '16px';
            c.style.zIndex = '999999';
            c.style.display = 'flex';
            c.style.flexDirection = 'column';
            c.style.gap = '8px';
            document.body.appendChild(c);
        }
        return c;
    }

    function showToast(message, type = 'info', ttl = 3500) {
        const container = ensureContainer();
        const el = document.createElement('div');
        el.className = 'st8-toast';
        el.style.minWidth = '220px';
        el.style.padding = '10px 12px';
        el.style.borderRadius = '8px';
        el.style.color = '#fff';
        el.style.boxShadow = '0 6px 18px rgba(2,6,23,0.24)';
        el.style.fontSize = '13px';
        el.style.fontFamily = 'Inter, Arial, sans-serif';
        el.style.opacity = '0';
        el.style.transition = 'opacity 220ms ease, transform 220ms ease';
        el.style.transform = 'translateY(6px)';

        switch (type) {
            case 'success': el.style.background = '#16a34a'; break;
            case 'error': el.style.background = '#b91c1c'; break;
            case 'warn': el.style.background = '#f59e0b'; el.style.color = '#111827'; break;
            default: el.style.background = '#0f172a'; break;
        }

        el.textContent = message;
        container.appendChild(el);
        // animate in
        requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });

        const tid = setTimeout(() => {
            // animate out
            el.style.opacity = '0'; el.style.transform = 'translateY(6px)';
            setTimeout(() => { el.remove(); }, 260);
        }, ttl);

        // return a function to dismiss early
        return () => { clearTimeout(tid); el.remove(); };
    }

    global.ST8Notify = { showToast };
})(window);
