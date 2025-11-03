// apps/planning-biweekly.js - vue bi-hebdo structur\u00e9e
(() => {
  const STORAGE_KEY = 'planning_st8_autosave';
  const FALLBACK_AGENTS_KEY = 'agents_st8_autosave';
  const WINDOW_DAYS = 14;

  const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const MONTH_LABELS = ['janv.', 'f\u00e9vr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'ao\u00fbt', 'sept.', 'oct.', 'nov.', 'd\u00e9c.'];
  const STATUS_DEFS = [
    { code: 'P', label: 'Pr\u00e9sent', color: '#4B5563' },
    { code: 'AT', label: 'Accident travail', color: '#B91C1C' },
    { code: 'C', label: 'Cong\u00e9', color: '#C2410C' },
    { code: 'AST-H', label: 'Astreinte Hivernale', color: '#1D4ED8' },
    { code: 'AST-S', label: 'Astreinte S\u00e9curit\u00e9', color: '#6D28D9' },
    { code: 'AM', label: 'Arr\u00eat Maladie', color: '#DC2626' },
    { code: 'F', label: 'Formation', color: '#92400E' },
    { code: 'RG', label: 'R\u00e9serve Gendarmerie', color: '#BE185D' },
    { code: 'CE', label: 'Cong\u00e9 Exceptionnel', color: '#B45309' },
    { code: 'DC', label: 'Demi Cong\u00e9', color: 'linear-gradient(90deg,#1F2937 50%, #C2410C 50%)' },
    { code: 'JF', label: 'Jour f\u00e9ri\u00e9', color: '#B91C1C' }
  ];
  const STATUS_MAP = STATUS_DEFS.reduce((acc, status) => {
    acc[status.code.toUpperCase()] = status;
    return acc;
  }, {});

  const PERMIT_BADGE_CLASS = {
    'PERMIS BE': 'cap-permis-be',
    'PERMIS C': 'cap-permis-c',
    'PERMIS CE': 'cap-permis-ce'
  };
  const CACES_BADGE_CLASS = {
    engins: 'cap-engins',
    nacelles: 'cap-nacelles',
    chariots: 'cap-chariots',
    grues: 'cap-grues'
  };

  const store = createStore();
  const filters = createFilterState();
  const windowManager = createWindowManager();
  const ui = captureDom();
  const renderer = createRenderer();

  init();

  function init() {
    if (!ui.container) return;
    renderer.renderLegend();
    renderer.populateGroups();
    renderer.syncWindowInput();
    renderer.render();
    bindEvents();
  }

  function bindEvents() {
    if (ui.windowInput) {
      ui.windowInput.addEventListener('change', event => {
        const date = parseInputDate(event.target.value);
        if (date) {
          windowManager.setStart(date);
          renderer.render();
        }
      });
    }
    if (ui.prevBtn) {
      ui.prevBtn.addEventListener('click', () => {
        windowManager.shift(-WINDOW_DAYS);
        renderer.syncWindowInput();
        renderer.render();
      });
    }
    if (ui.nextBtn) {
      ui.nextBtn.addEventListener('click', () => {
        windowManager.shift(WINDOW_DAYS);
        renderer.syncWindowInput();
        renderer.render();
      });
    }
    if (ui.groupSelect) {
      ui.groupSelect.addEventListener('change', () => {
        filters.setGroup(ui.groupSelect.value);
        renderer.render();
      });
    }
    if (ui.search) {
      ui.search.addEventListener('input', () => {
        filters.setSearch((ui.search.value || '').toLowerCase());
        renderer.render();
      });
    }
    if (ui.printBtn) {
      ui.printBtn.addEventListener('click', () => window.print());
    }
  }

  function createRenderer() {
    function render() {
      const dates = windowManager.getDates();
      const agents = filterAgents(store.getFlatAgents());
      updateCountBadge(agents.length);
      updateWindowBadge(dates);

      if (!agents.length) {
        ui.grid.innerHTML = '<div class="empty-placeholder">Aucun agent disponible pour la p\u00e9riode s\u00e9lectionn\u00e9e.</div>';
        return;
      }

      const holidayCache = {};
      const rows = agents.map(agent => renderAgentRow(agent, dates, holidayCache)).join('');
      const header = renderHeaderRow(dates);
      ui.grid.innerHTML = `<table class="biweekly-table"><thead>${header}</thead><tbody>${rows}</tbody></table>`;
    }

    function renderLegend() {
      if (!ui.legend) return;
      ui.legend.innerHTML = STATUS_DEFS.map(status => {
        const color = status.color || '#D1D5DB';
        const swatch = color.startsWith('linear')
          ? `background:${color}`
          : `background:${color};`;
        return `<span class="badge"><span class="dot" style="${swatch}"></span>${escapeHtml(status.code)} - ${escapeHtml(status.label)}</span>`;
      }).join('');
    }

    function populateGroups() {
      if (!ui.groupSelect) return;
      const groups = store.getSortedGroups();
      const options = ['<option value="">Tous</option>']
        .concat(groups.map(group => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`));
      ui.groupSelect.innerHTML = options.join('');
      if (filters.group) {
        ui.groupSelect.value = filters.group;
      }
    }

    function syncWindowInput() {
      if (!ui.windowInput) return;
      ui.windowInput.value = formatInputDate(windowManager.getStart());
    }

    function filterAgents(list) {
      let items = list;
      if (filters.group) {
        items = items.filter(agent => agent.group === filters.group);
      }
      if (filters.search) {
        const query = filters.search;
        items = items.filter(agent => {
          return [agent.name, agent.matricule, agent.group]
            .some(field => (field || '').toLowerCase().includes(query));
        });
      }
      return items;
    }

    function updateCountBadge(count) {
      if (!ui.countInfo) return;
      ui.countInfo.textContent = `${count} agent${count > 1 ? 's' : ''}`;
    }

    function updateWindowBadge(dates) {
      if (!ui.windowLabel) return;
      if (!dates.length) {
        ui.windowLabel.textContent = '';
        return;
      }
      const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      const start = capitalize(formatter.format(dates[0]));
      const end = capitalize(formatter.format(dates[dates.length - 1]));
      ui.windowLabel.textContent = `Du ${start} au ${end}`;
    }

    function renderHeaderRow(dates) {
      const cells = dates.map(date => {
        const weekend = isWeekend(date);
        const weekendClass = weekend ? ' weekend' : '';
        return `
          <th class="day${weekendClass}">
            <div class="day-header">
              <span class="label${weekendClass}">${escapeHtml(DAY_LABELS[date.getDay()])}</span>
              <span class="date">${String(date.getDate()).padStart(2, '0')}</span>
            </div>
          </th>
        `;
      }).join('');
      return `<tr><th class="agent">Agent</th>${cells}</tr>`;
    }

    function renderAgentRow(agent, dates, holidayCache) {
      const groupMeta = store.getGroupMeta(agent.group);
      const cells = dates.map(date => renderDayCell(agent, date, holidayCache)).join('');
      const capabilityBadges = renderCapabilityBadges(agent);
      const idLine = [
        escapeHtml(agent.matricule || ''),
        agent.grade ? escapeHtml(agent.grade) : ''
      ].filter(Boolean).join(' - ');
      return `
        <tr>
          <th class="agent">
            <div class="meta">
              <div class="header-line">
                <span class="swatch" style="background:${groupMeta.color || '#1e40af'}"></span>
                <span class="name">${escapeHtml(agent.name || 'Sans nom')}</span>
              </div>
              <span class="id">${idLine}</span>
              <span class="id">${escapeHtml(agent.group || '')}</span>
              ${capabilityBadges ? `<div class="capabilities">${capabilityBadges}</div>` : ''}
            </div>
          </th>
          ${cells}
        </tr>
      `;
    }

    function renderDayCell(agent, date, holidayCache) {
      const dateKey = toKey(date);
      const year = date.getFullYear();
      store.ensureYear(year);
      const agentMap = store.getPlanningMap(year)[agent.matricule] || {};
      let rawValue = (agentMap[dateKey] || '').toString().trim().toUpperCase();
      const weekend = isWeekend(date);
      const isHoliday = resolveHoliday(holidayCache, year).has(dateKey);

      if (!rawValue && isHoliday) {
        rawValue = 'JF';
      }

      const status = STATUS_MAP[rawValue];
      const classes = ['day'];
      let styleAttr = '';
      let content = rawValue;

      if (status) {
        const color = status.color;
        const textColor = color.startsWith('#') ? pickReadableTextColor(color) : '#ffffff';
        styleAttr = `background:${color};color:${textColor};font-weight:700`;
      } else if (isHoliday) {
        classes.push('holiday');
      } else if (weekend) {
        classes.push('weekend');
      } else if (!rawValue) {
        classes.push('empty');
      }

      if (status?.code === 'P') {
        const cellBadges = renderCapabilityBadges(agent);
        if (cellBadges) {
          content = `
            <div class="cell-stack">
              <span class="status-code">${escapeHtml(content || '')}</span>
              <span class="cell-caps">${cellBadges}</span>
            </div>
          `;
        } else {
          content = escapeHtml(content || '');
        }
      } else {
        content = escapeHtml(content || '');
      }

      const title = buildCellTitle(agent, date, rawValue, status);
      return `<td class="${classes.join(' ')}" ${styleAttr ? `style="${styleAttr}"` : ''} title="${escapeHtml(title)}">${content}</td>`;
    }

    function renderCapabilityBadges(agent) {
      const badges = buildCapabilityBadges(agent);
      if (!badges.length) return '';
      return badges.map(badge => `<span class="${badge.className}" title="${escapeHtml(badge.title)}">${escapeHtml(badge.label)}</span>`).join('');
    }

    return { render, renderLegend, populateGroups, syncWindowInput };
  }

  function createStore() {
    const state = loadState();
    ensureStateShape(state);
    let dirty = false;
    if (!hasAgents(state)) {
      state.agents = getDefaultAgents();
      dirty = true;
    }
    if (ensureGroupMeta(state)) {
      dirty = true;
    }
    if (dirty) {
      saveState(state);
    }
    return {
      ensureYear: year => {
        if (!state.planning[year]) state.planning[year] = {};
      },
      getPlanningMap: year => state.planning[year] || {},
      getGroupMeta: group => state.groupMeta?.[group] || {},
      getSortedGroups: () => {
        const groups = Object.keys(state.agents || {});
        return groups.sort((a, b) => compareGroupOrder(a, b, state.groupMeta));
      },
      getAgentsByGroup: () => {
        const src = state.agents || {};
        const map = {};
        Object.keys(src).forEach(group => {
          map[group] = (src[group] || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }));
        });
        return map;
      },
      getFlatAgents: () => {
        const flat = [];
        const byGroup = state.agents || {};
        Object.keys(byGroup).forEach(group => {
          (byGroup[group] || []).forEach(agent => flat.push({ ...agent, group }));
        });
        return flat;
      }
    };
  }

  function createFilterState() {
    return {
      group: '',
      search: '',
      setGroup(value) {
        this.group = value || '';
      },
      setSearch(value) {
        this.search = value || '';
      }
    };
  }

  function createWindowManager() {
    let start = getDefaultStart();
    return {
      getStart: () => start,
      setStart: value => { start = normaliseDay(value); },
      shift: days => { start = addDays(start, days); },
      getDates: () => {
        const dates = [];
        for (let idx = 0; idx < WINDOW_DAYS; idx += 1) {
          dates.push(addDays(start, idx));
        }
        return dates;
      }
    };
  }

  function captureDom() {
    return {
      container: document.querySelector('.biweekly-wrapper'),
      grid: document.getElementById('biweekly-grid'),
      legend: document.getElementById('status-legend'),
      countInfo: document.getElementById('count-info'),
      windowLabel: document.getElementById('window-label'),
      windowInput: document.getElementById('window-start'),
      prevBtn: document.getElementById('btn-prev-window'),
      nextBtn: document.getElementById('btn-next-window'),
      groupSelect: document.getElementById('group-select'),
      search: document.getElementById('search-agents'),
      printBtn: document.getElementById('btn-print')
    };
  }

  function loadState() {
    let data = {};
    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      data = {};
    }
    if (!data.agents) {
      try {
        const fallback = JSON.parse(localStorage.getItem(FALLBACK_AGENTS_KEY));
        if (fallback && fallback.agents) {
          data.agents = fallback.agents;
        }
      } catch {
        // ignore
      }
    }
    return data;
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage failures
    }
  }

  function ensureStateShape(state) {
    state.planning = state.planning && typeof state.planning === 'object' ? state.planning : {};
    state.agents = state.agents && typeof state.agents === 'object' ? state.agents : {};
    state.groupMeta = state.groupMeta && typeof state.groupMeta === 'object' ? state.groupMeta : {};
  }

  function hasAgents(state) {
    return state.agents && Object.keys(state.agents).length > 0;
  }

  function ensureGroupMeta(state) {
    const meta = state.groupMeta || {};
    const groups = Object.keys(state.agents || {});
    let updated = false;
    let maxOrder = Object.values(meta).reduce((max, entry) => Math.max(max, entry?.order || 0), 0);

    groups.forEach(group => {
      if (!meta[group]) {
        const preset = getDefaultGroupMeta()[group];
        if (preset) {
          meta[group] = { color: preset.color, order: preset.order };
        } else {
          maxOrder += 1;
          meta[group] = { color: pickGroupColor(maxOrder), order: maxOrder };
        }
        updated = true;
      }
    });

    Object.keys(meta).forEach(group => {
      if (!groups.includes(group)) {
        delete meta[group];
        updated = true;
      }
    });

    const sorted = groups.slice().sort((a, b) => compareGroupOrder(a, b, meta));
    sorted.forEach((group, idx) => {
      const desiredOrder = idx + 1;
      meta[group] = meta[group] || {};
      if (meta[group].order !== desiredOrder) {
        meta[group].order = desiredOrder;
        updated = true;
      }
      meta[group].color = meta[group].color || pickGroupColor(desiredOrder);
    });

    state.groupMeta = meta;
    return updated;
  }

  function compareGroupOrder(a, b, meta) {
    const metaRef = meta || {};
    const orderA = metaRef[a]?.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = metaRef[b]?.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return (a || '').localeCompare(b || '', 'fr', { sensitivity: 'base' });
    }
    return orderA - orderB;
  }

  function getDefaultAgents() {
    return {
      'AGENTS VOIRIE ST 8': [
        { matricule: 'C002908', name: 'FONTENEAU Fabrice', grade: 'AT', permis: [], caces: [], skills: ['VRD'] },
        { matricule: 'T028198', name: 'GOUREAU Jonathan', grade: 'AT', permis: [], caces: [], skills: ['VRD'] }
      ],
      ENCADRANTS: [
        { matricule: 'C003285', name: 'FOURCADE Herv\u00e9', grade: 'TECH', permis: [], caces: [], skills: ['Encadrement'] }
      ]
    };
  }

  function getDefaultGroupMeta() {
    return {
      'AGENTS VOIRIE ST 8': { color: '#2563eb', order: 1 },
      'AGENTS ESPACE VERT ST 8': { color: '#16a34a', order: 2 },
      ENCADRANTS: { color: '#9333ea', order: 3 },
      'MAGASIN ST 8': { color: '#f59e0b', order: 4 },
      'AGENT ENTRETIEN BATIMENT ST 8': { color: '#0ea5e9', order: 5 }
    };
  }

  function pickGroupColor(index) {
    const palette = ['#2563eb', '#16a34a', '#f59e0b', '#db2777', '#0ea5e9', '#9333ea', '#ef4444', '#14b8a6', '#78350f'];
    const pos = (index - 1) % palette.length;
    return palette[pos];
  }

  function buildCellTitle(agent, date, value, status) {
    const dayLabel = DAY_LABELS[date.getDay()] || '';
    const formatted = `${String(date.getDate()).padStart(2, '0')} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
    const base = `${agent.name || agent.matricule || 'Agent'} - ${dayLabel} ${formatted}`;
    if (status) return `${base} : ${status.label}`;
    if (value) return `${base} : ${value}`;
    return base;
  }

  function resolveHoliday(cache, year) {
    if (!cache[year]) {
      cache[year] = buildHolidaySet(year);
    }
    return cache[year];
  }

  function buildHolidaySet(year) {
    const set = new Set();
    [
      [1, 1], [5, 1], [5, 8], [7, 14], [8, 15], [11, 1], [11, 11], [12, 25]
    ].forEach(([month, day]) => set.add(toKey(year, month, day)));

    const easter = computeEaster(year);
    addRelative(set, easter, -2);
    addRelative(set, easter, 1);
    addRelative(set, easter, 39);
    addRelative(set, easter, 50);
    return set;
  }

  function addRelative(set, base, offset) {
    const date = addDays(base, offset);
    set.add(toKey(date));
  }

  function computeEaster(Y) {
    const a = Y % 19;
    const b = Math.floor(Y / 100);
    const c = Y % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Y, month - 1, day);
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return normaliseDay(result);
  }

  function normaliseDay(date) {
    const clone = new Date(date);
    clone.setHours(0, 0, 0, 0);
    return clone;
  }

  function getDefaultStart() {
    const today = normaliseDay(new Date());
    const weekday = today.getDay();
    const diff = weekday === 0 ? -6 : 1 - weekday;
    return addDays(today, diff);
  }

  function toKey(yearOrDate, month, day) {
    if (yearOrDate instanceof Date) {
      const y = yearOrDate.getFullYear();
      const m = yearOrDate.getMonth() + 1;
      const d = yearOrDate.getDate();
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return `${yearOrDate}-${String(month || 1).padStart(2, '0')}-${String(day || 1).padStart(2, '0')}`;
  }

  function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  function parseInputDate(value) {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  function formatInputDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function escapeHtml(value) {
    return (value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function pickReadableTextColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#0f172a' : '#ffffff';
  }

  function hexToRgb(hex) {
    let raw = (hex || '').replace('#', '');
    if (raw.length === 3) {
      raw = raw.split('').map(char => char + char).join('');
    }
    if (raw.length !== 6) {
      return { r: 120, g: 120, b: 120 };
    }
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16)
    };
  }

  function buildCapabilityBadges(agent) {
    const badges = [];
    const permits = Array.isArray(agent?.permis) ? agent.permis : [];
    const plLabels = new Set();
    permits
      .filter(code => /Permis\s*C(E)?/i.test(code || ''))
      .forEach(code => {
        const label = normalisePermitLabel(code);
        if (label && !plLabels.has(label)) {
          plLabels.add(label);
          badges.push({
            className: `cap-badge ${getPermitBadgeClass(label)}`,
            label,
            title: code
          });
        }
      });

    const cacesByCategory = new Map();
    const cacesList = Array.isArray(agent?.caces) ? agent.caces : [];
    cacesList.forEach(entry => {
      const info = parseCacesValue(entry);
      if (!info.category) return;
      const current = cacesByCategory.get(info.category) || { codes: new Set(), raw: [] };
      if (info.code) current.codes.add(info.code);
      current.raw.push(entry);
      cacesByCategory.set(info.category, current);
    });

    cacesByCategory.forEach((data, category) => {
      const codes = Array.from(data.codes.values());
      const titleParts = [category];
      if (codes.length) titleParts.push(`Codes: ${codes.join(', ')}`);
      const title = titleParts.join(' • ');
      badges.push({
        className: `cap-badge ${getCacesBadgeClass(category)}`,
        label: category,
        title
      });
    });

    return badges;
  }

  function normalisePermitLabel(label) {
    if (!label) return '';
    const match = (label || '').trim().match(/Permis\s*C(E)?/i);
    if (!match) return (label || '').trim();
    const suffix = match[1] ? `C${match[1].toUpperCase()}` : 'C';
    return `Permis ${suffix}`;
  }

  function getPermitBadgeClass(label) {
    const key = (label || '').trim().toUpperCase();
    return PERMIT_BADGE_CLASS[key] || 'cap-permis-c';
  }

  function parseCacesValue(value) {
    if (!value) return { category: '', code: '' };
    const trimmed = value.trim();
    const match = trimmed.match(/R\.\d+\s*-\s*([^-]+?)(?:-\s*(.+))?$/i);
    if (match) {
      return {
        category: match[1].trim(),
        code: (match[2] || '').trim()
      };
    }
    if (/R\.490/i.test(trimmed)) {
      return { category: 'Grues', code: trimmed.replace(/.*(R\.490)/i, '$1') };
    }
    return {
      category: trimmed.replace(/^CACES\s*/i, '').trim(),
      code: ''
    };
  }

  function getCacesBadgeClass(category) {
    const key = (category || '').trim().toLowerCase();
    return CACES_BADGE_CLASS[key] || 'cap-engins';
  }

})();
