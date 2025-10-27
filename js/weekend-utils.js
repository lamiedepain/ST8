(function () {
    // Shared helper: ensure a 'WE' label is present on weekend cells unless an astreinte status overrides it.
    window.ensureWeekendLabel = function (td) {
        try {
            if (!td) return;
            const isWeekend = (td.dataset && td.dataset.weekend === '1') || (td.classList && td.classList.contains('weekend'));
            // Prefer the cell-code wrapper text when present (more reliable than raw textContent which may include the WE label)
            const code = (td.querySelector && td.querySelector('.cell-code') && td.querySelector('.cell-code').textContent) ? td.querySelector('.cell-code').textContent.trim() : (td.textContent || '').trim();
            // Debug: log key info to help trace remaining cases where WE may hide status/colors
            if (window.console && window.console.debug) {
                console.debug('ensureWeekendLabel', { date: td.dataset && td.dataset.date, agent: td.dataset && td.dataset.agent, isWeekend, code, classes: td.className });
            }
            const isAstreinte = (code === 'AST-H' || code === 'AST-S');
            const existing = td.querySelector && td.querySelector('.we-label');
            if (isWeekend && !isAstreinte) {
                if (!existing) {
                    const we = document.createElement('div');
                    we.className = 'we-label';
                    we.textContent = 'WE';
                    td.appendChild(we);
                }
            } else {
                if (existing) existing.remove();
            }
        } catch (e) {
            // fail silently in older browsers
            console.error('ensureWeekendLabel error', e);
        }
    };
})();
