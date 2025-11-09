// ST8 Structure Analysis - Vanilla JavaScript Implementation
(function() {
  'use strict';

  // Icon SVG paths (simple alternatives to lucide-react)
  const ICONS = {
    'chevron-down': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    'chevron-right': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    'layers': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
    'file': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>',
    'database': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
    'code': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    'palette': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>',
    'star': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
  };

  // State management
  const state = {
    expandedSections: new Set()
  };

  /**
   * Toggle section expanded state
   */
  function toggleSection(sectionKey) {
    if (state.expandedSections.has(sectionKey)) {
      state.expandedSections.delete(sectionKey);
    } else {
      state.expandedSections.add(sectionKey);
    }
    renderSection(sectionKey);
  }

  /**
   * Render a single section
   */
  function renderSection(sectionKey) {
    const section = window.ST8_STRUCTURE[sectionKey];
    if (!section) return;

    const sectionElement = document.getElementById(`section-${sectionKey}`);
    if (!sectionElement) return;

    const isExpanded = state.expandedSections.has(sectionKey);
    
    // Update button state
    const button = sectionElement.querySelector('.section-header-button');
    if (button) {
      button.setAttribute('aria-expanded', isExpanded);
      const chevronIcon = button.querySelector('.chevron-icon');
      if (chevronIcon) {
        chevronIcon.innerHTML = isExpanded ? ICONS['chevron-down'] : ICONS['chevron-right'];
      }
    }

    // Update content visibility
    const content = sectionElement.querySelector('.section-content');
    if (content) {
      if (isExpanded) {
        content.classList.add('expanded');
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.classList.remove('expanded');
        content.style.maxHeight = '0';
      }
    }
  }

  /**
   * Create HTML for a section
   */
  function createSectionHTML(sectionKey, section) {
    const isExpanded = state.expandedSections.has(sectionKey);
    const chevronIcon = isExpanded ? ICONS['chevron-down'] : ICONS['chevron-right'];
    const sectionIcon = ICONS[section.icon] || ICONS['layers'];

    const itemsHTML = section.items.map(item => `
      <div class="structure-item">
        <span class="item-label">${item.label}</span>
        <span class="item-value">${item.value}</span>
      </div>
    `).join('');

    return `
      <div class="structure-section" id="section-${sectionKey}">
        <button 
          class="section-header-button" 
          onclick="window.toggleStructureSection('${sectionKey}')"
          aria-expanded="${isExpanded}"
          aria-controls="content-${sectionKey}">
          <div class="section-header">
            <div class="section-title-group">
              <span class="section-icon">${sectionIcon}</span>
              <h2 class="section-title">${section.title}</h2>
              <span class="item-count">${section.items.length}</span>
            </div>
            <span class="chevron-icon">${chevronIcon}</span>
          </div>
        </button>
        <div 
          class="section-content ${isExpanded ? 'expanded' : ''}" 
          id="content-${sectionKey}"
          role="region"
          aria-labelledby="section-${sectionKey}"
          style="${isExpanded ? '' : 'max-height: 0;'}">
          <div class="section-items">
            ${itemsHTML}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize the structure analysis view
   */
  function init() {
    const container = document.getElementById('structure-analysis-container');
    if (!container || !window.ST8_STRUCTURE) return;

    // Build the structure HTML
    const sectionsHTML = Object.keys(window.ST8_STRUCTURE).map(key => 
      createSectionHTML(key, window.ST8_STRUCTURE[key])
    ).join('');

    container.innerHTML = `
      <div class="structure-header">
        <h1 class="structure-title">Structure de l'application ST8 PRO</h1>
        <p class="structure-subtitle">
          Explorez l'architecture, les pages, le modèle de données, les scripts, les styles et les fonctionnalités
        </p>
      </div>
      <div class="structure-sections">
        ${sectionsHTML}
      </div>
    `;

    // Set initial expanded states
    Object.keys(window.ST8_STRUCTURE).forEach(key => {
      renderSection(key);
    });

    // Expose toggle function globally for onclick handlers
    window.toggleStructureSection = toggleSection;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
