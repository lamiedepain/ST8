function toggleDarkMode() {
  const body = document.body;
  const logos = document.querySelectorAll('img.logo');
  const isDark = !body.classList.contains('dark-mode');
  if (isDark) {
    body.classList.add('dark-mode');
    logos.forEach(logo => logo.src = 'assets/logo_noir.png');
  } else {
    body.classList.remove('dark-mode');
    logos.forEach(logo => logo.src = 'assets/logo_blanc.png');
  }
  localStorage.setItem('dark-mode', isDark ? 'true' : 'false');
}

function applyStoredTheme() {
  const shouldUseDarkMode = localStorage.getItem('dark-mode') === 'true';
  document.body.classList.toggle('dark-mode', shouldUseDarkMode);
  document.querySelectorAll('img.logo').forEach(logo => {
    logo.src = shouldUseDarkMode ? 'assets/logo_noir.png' : 'assets/logo_blanc.png';
  });
}

function initFab() {
  const fabContainer = document.querySelector('.fab-container');
  const fabButton = document.querySelector('.fab');

  if (!fabContainer || !fabButton) {
    return;
  }

  let shouldOpen = false;
  try {
    shouldOpen = localStorage.getItem('fab-open') === 'true';
  } catch (error) {
    console.warn('FAB state read', error);
  }

  if (shouldOpen) {
    fabContainer.classList.add('open');
  }

  fabButton.addEventListener('click', () => {
    const isOpen = fabContainer.classList.toggle('open');
    try {
      localStorage.setItem('fab-open', isOpen ? 'true' : 'false');
    } catch (error) {
      console.warn('FAB state write', error);
    }
  });
}

function buildAppTile(app, options) {
  const { isHomeLayout, index } = options;
  const link = document.createElement('a');
  const themeClass = app.theme || 'theme-dark';
  const classes = ['square', themeClass];

  if (isHomeLayout) {
    classes.push('home-square');
    const delay = typeof app.animationDelay === 'number' ? app.animationDelay : index * 0.2;
    link.style.animationDelay = `${delay}s`;
  } else {
    classes.push('app-card');
  }

  if (app.className) {
    classes.push(...app.className.split(' ').filter(Boolean));
  }

  link.className = classes.join(' ');
  link.href = app.url || '#';

  if (app.external || app.target === '_blank') {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  if (app.target && app.target !== '_blank') {
    link.target = app.target;
  }

  if (app.rel) {
    link.rel = link.rel ? `${link.rel} ${app.rel}`.trim() : app.rel;
  }

  if (app.disabled) {
    link.classList.add('is-disabled');
    link.setAttribute('aria-disabled', 'true');
    link.addEventListener('click', event => event.preventDefault());
  }

  if (app.abbr) {
    const abbrEl = document.createElement('div');
    abbrEl.className = isHomeLayout ? 'abbr' : 'app-card__abbr';
    abbrEl.textContent = app.abbr;
    link.appendChild(abbrEl);
  }

  const titleEl = document.createElement('div');
  titleEl.className = isHomeLayout ? 'desc' : 'app-card__name';
  titleEl.textContent = app.title || app.label || '';
  link.appendChild(titleEl);

  if (!isHomeLayout && app.description) {
    const descEl = document.createElement('div');
    descEl.className = 'app-card__desc';
    descEl.textContent = app.description;
    link.appendChild(descEl);
  }

  if (app.badge) {
    const badgeEl = document.createElement('span');
    badgeEl.className = 'app-card__badge';
    badgeEl.textContent = app.badge;
    link.appendChild(badgeEl);
  }

  return link;
}

function renderAppSections() {
  const catalog = window.APP_CATALOG || {};
  const containers = document.querySelectorAll('[data-app-page]');

  containers.forEach(container => {
    const pageId = container.dataset.appPage;
    const layout = container.dataset.appLayout || 'grid';
    const emptyText = container.dataset.appEmpty || 'Aucune application disponible pour le moment.';
    const apps = catalog[pageId] || [];
    const isHomeLayout = layout === 'home';

    container.innerHTML = '';

    if (!apps.length) {
      const emptyEl = document.createElement('p');
      emptyEl.className = 'app-empty';
      emptyEl.textContent = emptyText;
      container.appendChild(emptyEl);
      return;
    }

    const fragment = document.createDocumentFragment();
    apps.forEach((app, index) => {
      fragment.appendChild(buildAppTile(app, { isHomeLayout, index }));
    });
    container.appendChild(fragment);
  });
}

const loadedAppModules = new Map();

function loadAppModule(pageId) {
  if (!pageId) {
    return Promise.resolve(false);
  }

  if (loadedAppModules.has(pageId)) {
    return loadedAppModules.get(pageId);
  }

  const promise = new Promise(resolve => {
    const script = document.createElement('script');
    script.src = `apps/${pageId}.js`;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  loadedAppModules.set(pageId, promise);
  return promise;
}

function bootstrapAppCatalog() {
  const containers = Array.from(document.querySelectorAll('[data-app-page]'));
  if (!containers.length) {
    return Promise.resolve();
  }

  const uniquePageIds = Array.from(new Set(containers
    .map(container => container.dataset.appPage)
    .filter(Boolean)));

  if (!uniquePageIds.length) {
    return Promise.resolve();
  }

  return Promise.all(uniquePageIds.map(loadAppModule));
}

function embedAppIframe(container, src, loadingText) {
  container.innerHTML = '';
  const loadingMessage = document.createElement('p');
  loadingMessage.className = 'app-loading';
  loadingMessage.textContent = loadingText || "Chargement de l'application...";
  container.appendChild(loadingMessage);

  const frame = document.createElement('iframe');
  frame.className = 'app-frame';
  frame.src = src;
  frame.loading = 'lazy';
  frame.setAttribute('title', container.dataset.appTitle || 'Application intégrée');

  const rawHeight = container.dataset.appHeight;
  if (rawHeight) {
    const value = Number.parseInt(rawHeight, 10);
    if (!Number.isNaN(value)) {
      frame.style.minHeight = `${value}px`;
    }
  }

  frame.addEventListener('load', () => {
    if (loadingMessage.parentNode === container) {
      container.removeChild(loadingMessage);
    }
  });

  container.appendChild(frame);
  return frame;
}

function loadHtmlApp(container) {
  const pageId = container.dataset.appEmbed;
  if (!pageId) {
    return Promise.resolve();
  }

  const mode = (container.dataset.appMode || '').toLowerCase();
  const src = container.dataset.appSrc || `apps/${pageId}.html`;
  const loadingText = container.dataset.appLoading || "Chargement de l'application...";
  const errorText = container.dataset.appEmpty || "Impossible de charger l'application.";
  const preferIframe = mode === 'iframe';
  const forbidIframeFallback = mode === 'fetch';
  const shouldUseIframe = preferIframe || window.location.protocol === 'file:';

  if (shouldUseIframe) {
    embedAppIframe(container, src, loadingText);
    return Promise.resolve();
  }

  container.innerHTML = `<p class="app-loading">${loadingText}</p>`;

  return fetch(src, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Echec du chargement ${src} (${response.status})`);
      }
      return response.text();
    })
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      console.error(error);
      if (!forbidIframeFallback) {
        embedAppIframe(container, src, loadingText);
        return;
      }
      container.innerHTML = `<p class="app-error">${errorText}</p>`;
    });
}

function loadHtmlApps() {
  const containers = Array.from(document.querySelectorAll('[data-app-embed]'));
  if (!containers.length) {
    return Promise.resolve();
  }

  return Promise.all(containers.map(container => loadHtmlApp(container)));
}

const METEO_STORAGE_KEY = 'meteo_st8';
const PONT_STORAGE_KEY = 'pont_events';
const METEO_URL = 'https://api.open-meteo.com/v1/forecast?latitude=44.84&longitude=-0.58&current=temperature_2m,wind_speed_10m&hourly=precipitation_probability&forecast_days=1&timezone=Europe%2FParis';
const METEO_CACHE_TTL = 45 * 60 * 1000; // 45 minutes
const METEO_START_HOUR = 6.5; // 6h30
const METEO_END_HOUR = 16 + (1 / 60); // 16h01

function initMeteoCard() {
  const card = document.getElementById('meteo-card');
  if (!card) {
    return;
  }

  const now = new Date();
  if (!shouldDisplayMeteo(now)) {
    card.classList.add('is-hidden');
    return;
  }

  card.classList.remove('is-hidden');
  card.textContent = 'Mise \u00e0 jour de la m\u00e9t\u00e9o en cours...';

  const dateKey = now.toISOString().slice(0, 10);
  const cache = safeParseJson(localStorage.getItem(METEO_STORAGE_KEY)) || {};
  const cachedEntry = cache[dateKey];

  if (cachedEntry && now.getTime() - (cachedEntry.updatedAt || 0) < METEO_CACHE_TTL) {
    renderMeteoCard(card, cachedEntry);
    return;
  }

  fetchMeteoData()
    .then(data => {
      const pontInfo = findNextPontEvent(now);
      const entry = buildMeteoEntry(dateKey, data, pontInfo, now);
      cache[dateKey] = entry;
      localStorage.setItem(METEO_STORAGE_KEY, JSON.stringify(cache));
      renderMeteoCard(card, entry);
    })
    .catch(error => {
      console.error('M\u00e9t\u00e9o ST8', error);
      card.innerHTML = '<div>Impossible de r\u00e9cup\u00e9rer les donn\u00e9es m\u00e9t\u00e9o pour le moment.</div>';
    });
}

function shouldDisplayMeteo(date) {
  const hours = date.getHours() + (date.getMinutes() / 60);
  return hours >= METEO_START_HOUR && hours <= METEO_END_HOUR;
}

function fetchMeteoData() {
  return fetch(METEO_URL, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) {
        throw new Error(`R\u00e9ponse m\u00e9t\u00e9o ${response.status}`);
      }
      return response.json();
    })
    .then(payload => {
      const temperature = Math.round(payload?.current?.temperature_2m ?? NaN);
      const wind = Math.round(payload?.current?.wind_speed_10m ?? NaN);
      const precipitation = resolveHourlyProbability(payload?.hourly, new Date());
      return { temperature, wind, precipitation };
    });
}

function resolveHourlyProbability(hourly, now) {
  if (!hourly || !Array.isArray(hourly.time) || !Array.isArray(hourly.precipitation_probability)) {
    return NaN;
  }
  const hourIso = now.toISOString().slice(0, 13); // yyyy-mm-ddThh
  const index = hourly.time.findIndex(item => item.startsWith(hourIso));
  const value = hourly.precipitation_probability[index > -1 ? index : 0];
  return typeof value === 'number' ? Math.round(value) : NaN;
}

function findNextPontEvent(now) {
  const raw = localStorage.getItem(PONT_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  const events = safeParseJson(raw);
  if (!Array.isArray(events)) {
    return null;
  }

  const upcoming = events
    .map(event => {
      if (!event || !event.date) return null;
      const start = buildPontDate(event.date, event.start);
      const end = buildPontDate(event.date, event.end);
      return { ...event, start, end };
    })
    .filter(event => event && event.start && event.start >= now)
    .sort((a, b) => a.start - b.start);

  return upcoming[0] || null;
}

function buildPontDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const time = (timeStr || '00:00').padEnd(5, '0').slice(0, 5);
  const iso = `${dateStr}T${time}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildMeteoEntry(dateKey, data, pontInfo, now) {
  const temp = Number.isFinite(data.temperature) ? data.temperature : null;
  const pluie = Number.isFinite(data.precipitation) ? data.precipitation : null;
  const vent = Number.isFinite(data.wind) ? data.wind : null;
  const pontTxt = pontInfo
    ? `Lev\u00e9e pr\u00e9vue ${formatTime(pontInfo.start)} - ${formatTime(pontInfo.end)}`
    : 'Circulation normale';

  const note = buildMeteoNote(now, temp, pluie, vent, pontTxt);

  return {
    date: dateKey,
    temp,
    pluie,
    vent,
    pontTxt,
    note,
    updatedAt: now.getTime()
  };
}

function buildMeteoNote(now, temp, pluie, vent, pontTxt) {
  const dayLabel = capitalize(
    new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'short' }).format(now)
  );
  const parts = [];
  if (Number.isFinite(temp)) {
    parts.push(`${temp} °C`);
  }
  if (Number.isFinite(pluie)) {
    parts.push(`pluie ${pluie} %`);
  }
  if (Number.isFinite(vent)) {
    parts.push(`vent ${vent} km/h`);
  }
  const summary = parts.join(', ');
  const base = summary ? `${dayLabel} - ${summary}` : dayLabel;
  return `${base} • ${pontTxt}`.trim();
}

function renderMeteoCard(card, entry) {
  const date = new Date(entry.updatedAt || Date.now());
  const temp = Number.isFinite(entry.temp) ? `${entry.temp} °C` : '—';
  const pluie = Number.isFinite(entry.pluie) ? `${entry.pluie} %` : '—';
  const vent = Number.isFinite(entry.vent) ? `${entry.vent} km/h` : '—';

  card.dataset.meteoDate = entry.date || '';
  card.innerHTML = `
    <div class="meteo-top">
      <div>
        <div class="meteo-label">M\u00e9t\u00e9o Bordeaux</div>
        <div class="meteo-temp">${temp}</div>
      </div>
      <div class="meteo-pill">${capitalize(new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date))}</div>
    </div>
    <div class="meteo-grid">
      <div class="meteo-item"><span>Pluie</span><strong>${pluie}</strong></div>
      <div class="meteo-item"><span>Vent</span><strong>${vent}</strong></div>
      <div class="meteo-item"><span>Pont Chaban-Delmas</span><strong>${entry.pontTxt || '—'}</strong></div>
    </div>
    <div class="meteo-note">${entry.note || ''}</div>
    <div class="meteo-footer">
      <span>Mis \u00e0 jour \u00e0 ${formatTime(date)}</span>
      <button type="button" data-action="copy-note">Copier la note</button>
    </div>
  `;

  const copyBtn = card.querySelector('[data-action="copy-note"]');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => copyNote(entry.note || ''));
  }
}

function copyNote(note) {
  if (!note) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(note).catch(() => fallbackCopyText(note));
  } else {
    fallbackCopyText(note);
  }
}

function fallbackCopyText(text) {
  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'absolute';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  try { document.execCommand('copy'); } catch (error) { console.warn('Copy clipboard', error); }
  document.body.removeChild(input);
}

function formatTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '--:--';
  }
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function safeParseJson(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('JSON parse', error);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();
  initFab();
  initMeteoCard();

  Promise.allSettled([
    bootstrapAppCatalog(),
    loadHtmlApps()
  ]).then(() => {
    renderAppSections();
  });
});

