// apps/planning.js — vue 31 jours compacte, drag-select + palette rapide
(() => {
  const STORAGE_KEY = 'planning_st8_autosave';
  const FALLBACK_AGENTS_KEY = 'agents_st8_autosave';

  const MONTHS = ['Jan','Fev','Mar','Avr','Mai','Juin','Juil','Aout','Sep','Oct','Nov','Dec'];
  const MONTH_LABELS = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
  const DAY_LABELS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const STATUSES = [
    { code: 'P',     label: 'Present',               color: '#4B5563' },
    { code: 'AT',    label: 'Accident travail',      color: '#B91C1C' },
    { code: 'C',     label: 'Conge',                 color: '#C2410C' },
    { code: 'AST-H', label: 'Astreinte Hivernale',   color: '#1D4ED8' },
    { code: 'AST-S', label: 'Astreinte Securite',    color: '#6D28D9' },
    { code: 'AM',    label: 'Arret Maladie',         color: '#DC2626' },
    { code: 'F',     label: 'Formation',             color: '#92400E' },
    { code: 'RG',    label: 'Reserve Gendarmerie',   color: '#BE185D' },
    { code: 'CE',    label: 'Conge Exceptionnel',    color: '#B45309' },
    { code: 'DC',    label: 'Demi Conge',            color: 'linear-gradient(90deg,#1F2937 50%, #C2410C 50%)' },
    { code: 'JF',    label: 'Ferie',                 color: '#B91C1C' }
  ];
  const STATUS_MAP = STATUSES.reduce((acc,status)=>{ acc[status.code.toUpperCase()] = status; return acc; },{});
  const GROUP_COLOR_POOL = ['#2563eb','#16a34a','#f59e0b','#db2777','#0ea5e9','#9333ea','#ef4444','#14b8a6','#78350f'];
  const DEFAULT_GROUP_META = {
    'AGENTS VOIRIE ST 8': { color: '#2563eb', order: 1 },
    'AGENTS ESPACE VERT ST 8': { color: '#16a34a', order: 2 },
    ENCADRANTS: { color: '#9333ea', order: 3 },
    'MAGASIN ST 8': { color: '#f59e0b', order: 4 },
    'AGENT ENTRETIEN BATIMENT ST 8': { color: '#0ea5e9', order: 5 }
  };
  const WEEKEND_ALLOWED_CODES = new Set(['', 'AST-H', 'ASTH', 'AST-S', 'ASTS']);

  const DEFAULT_AGENTS = {
    'AGENTS VOIRIE ST 8': [
      { matricule: 'C002908', name: 'FONTENEAU Fabrice', grade: 'AT' },
      { matricule: 'T028198', name: 'GOUREAU Jonathan', grade: 'AT' }
    ],
    'ENCADRANTS': [
      { matricule: 'C003285', name: 'FOURCADE Hervé', grade: 'TECH' }
    ]
  };

  let ui = {};
  let filters = { year: new Date().getFullYear(), group: '', search: '' };
  let detailMonth = new Date().getMonth() + 1;
  let selectedCells = new Set();
  let isDragging = false;
  let dragStartCell = null;
  let undoStack = [];

  let state = loadState();
  ensureStateShape();
  if (!state.agents || !Object.keys(state.agents).length) { state.agents = DEFAULT_AGENTS; saveState(); }
  state.groupMeta = state.groupMeta || {};
  if (ensureGroupMetaFromAgents()) saveState();

  function boot(){
    cacheDom();
    initYearSelect();
    initMonthSelect();
    hydrateGroups();
    bindEvents();
    renderDetail();
  }

  function cacheDom(){
    ui.yearSelect = document.getElementById('year-select');
    ui.monthSelect = document.getElementById('month-select');
    ui.groupSelect = document.getElementById('group-select');
    ui.search = document.getElementById('search-agents');
    ui.grid = document.getElementById('annual-grid');
    ui.countInfo = document.getElementById('count-info');
    ui.btnImport = document.getElementById('btn-import');
    ui.btnExport = document.getElementById('btn-export');
    ui.btnAllPresent = document.getElementById('btn-all-present');
    ui.btnPrint = document.getElementById('btn-print');
    ui.btnUndo = document.getElementById('btn-undo');
  }

  function initYearSelect(){
    const current = new Date().getFullYear();
    const years = []; for (let y=current-2; y<=current+2; y++) years.push(y);
    ui.yearSelect.innerHTML = years.map(y=>`<option value="${y}" ${y===current?'selected':''}>${y}</option>`).join('');
    filters.year = current;
  }
  function initMonthSelect(){
    if(!ui.monthSelect) return;
    ui.monthSelect.innerHTML = MONTH_LABELS.map((label, idx)=>`<option value="${idx+1}" ${idx+1===detailMonth?'selected':''}>${label}</option>`).join('');
  }

  function hydrateGroups(){
    const groups = getSortedGroups();
    ui.groupSelect.innerHTML = [''].concat(groups).map(g=>`<option value="${g}">${g||'Tous'}</option>`).join('');
  }

  function bindEvents(){
    ui.yearSelect.addEventListener('change', ()=>{ filters.year = parseInt(ui.yearSelect.value,10); ensureYear(filters.year); renderDetail(); });
    if (ui.monthSelect){ ui.monthSelect.addEventListener('change', ()=>{ detailMonth = parseInt(ui.monthSelect.value,10)||1; renderDetail(); }); }
    ui.groupSelect.addEventListener('change', ()=>{ filters.group = ui.groupSelect.value; renderDetail(); });
    ui.search.addEventListener('input', ()=>{ filters.search = (ui.search.value||'').toLowerCase(); renderDetail(); });
    ui.btnExport.addEventListener('click', exportPlanning);
    ui.btnImport.addEventListener('click', selectAndImport);
    if (ui.btnAllPresent) ui.btnAllPresent.addEventListener('click', setAllPresentForVisibleAgents);
    if (ui.btnPrint) ui.btnPrint.addEventListener('click', ()=> window.print());
    if (ui.btnUndo) ui.btnUndo.addEventListener('click', undoLastAction);

    const isolateBtn = document.getElementById('btn-isolate');
    if (isolateBtn){ isolateBtn.addEventListener('click', ()=>{ const g=ui.groupSelect.value; if(!g){ alert("Choisis d'abord un groupe."); return; } filters.group=g; renderDetail(); }); }

    window.addEventListener('resize', ()=> fitDetailTableWidth(daysInMonth(filters.year, detailMonth)));
  }

  function loadState(){ let data={}; try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch {} if (!data.agents){ try { const a=JSON.parse(localStorage.getItem(FALLBACK_AGENTS_KEY)); if(a&&a.agents) data.agents=a.agents; } catch {} } return data; }
  function saveState(){ ensureGroupMetaFromAgents(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function ensureStateShape(){ state.planning = state.planning || {}; ensureYear(filters.year); }
  function ensureYear(year){ state.planning[year] = state.planning[year] || {}; }

  function getAgentsByGroup(){ const groups = {}; const src=(state.agents&&typeof state.agents==='object')?state.agents:{}; Object.keys(src).forEach(g=>{ groups[g]=(src[g]||[]).slice().sort((a,b)=>(a.name||'').localeCompare((b.name||''),'fr',{sensitivity:'base'})); }); return groups; }
  function getFlatAgents(){ const by=getAgentsByGroup(); const flat=[]; Object.keys(by).forEach(g=> (by[g]||[]).forEach(a=> flat.push({...a,group:g}))); return flat; }
  function filterAgents(list){ let a=list; if(filters.group) a=a.filter(x=>x.group===filters.group); if(filters.search){ const q=filters.search; a=a.filter(x=>[x.name,x.matricule,x.group].some(v=>(v||'').toLowerCase().includes(q))); } return a; }
  function compareGroupOrder(a, b, metaSource) {
    const meta = metaSource || state.groupMeta || {};
    const ao = meta[a]?.order ?? Number.MAX_SAFE_INTEGER;
    const bo = meta[b]?.order ?? Number.MAX_SAFE_INTEGER;
    if (ao === bo) {
      return (a || '').localeCompare(b || '', 'fr', { sensitivity: 'base' });
    }
    return ao - bo;
  }
  function getSortedGroups(source) {
    const base = source ? source.slice() : Object.keys(getAgentsByGroup());
    return base.sort((a, b) => compareGroupOrder(a, b));
  }
  function getGroupMeta(group) {
    return state.groupMeta?.[group] || {};
  }
  function pickGroupColor(index) {
    const paletteIndex = (index - 1) % GROUP_COLOR_POOL.length;
    return GROUP_COLOR_POOL[paletteIndex];
  }
  function ensureGroupMetaFromAgents() {
    state.groupMeta = state.groupMeta || {};
    const meta = state.groupMeta;
    const groups = Object.keys(state.agents || {});
    let updated = false;
    let maxOrder = Object.values(meta).reduce((m, item) => Math.max(m, item?.order || 0), 0);

    groups.forEach(group => {
      if (!meta[group]) {
        const preset = DEFAULT_GROUP_META[group];
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
      const desired = idx + 1;
      meta[group] = meta[group] || {};
      if (meta[group].order !== desired) {
        meta[group].order = desired;
        updated = true;
      }
      meta[group].color = meta[group].color || pickGroupColor(desired);
    });

    state.groupMeta = meta;
    return updated;
  }
  function escapeHtml(value) {
    return (value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function hexToRgb(hex){
    let raw = (hex || '').replace('#','');
    if (raw.length === 3) raw = raw.split('').map(c=>c+c).join('');
    if (raw.length !== 6) return { r: 120, g: 120, b: 120 };
    return {
      r: parseInt(raw.slice(0,2),16),
      g: parseInt(raw.slice(2,4),16),
      b: parseInt(raw.slice(4,6),16)
    };
  }
  function clamp01(v){ return Math.min(1, Math.max(0, v)); }
  function lightenColor(hex, amount){
    const { r, g, b } = hexToRgb(hex);
    const blend = clamp01(amount ?? 0.5);
    const mix = component => Math.round(component + (255 - component) * blend);
    const toHex = component => component.toString(16).padStart(2, '0');
    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
  }
  function pickReadableTextColor(hex){
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#0f172a' : '#ffffff';
  }
  function hexToRgb(hex){
    let raw = (hex || '').replace('#','');
    if (raw.length === 3) raw = raw.split('').map(c=>c+c).join('');
    if (raw.length !== 6) return { r: 120, g: 120, b: 120 };
    return {
      r: parseInt(raw.slice(0,2),16),
      g: parseInt(raw.slice(2,4),16),
      b: parseInt(raw.slice(4,6),16)
    };
  }
  function clamp01(v){ return Math.min(1, Math.max(0, v)); }
  function lightenColor(hex, amount){
    const { r, g, b } = hexToRgb(hex);
    const blend = clamp01(amount ?? 0.5);
    const mix = component => Math.round(component + (255 - component) * blend);
    const toHex = component => component.toString(16).padStart(2, '0');
    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
  }
  function pickReadableTextColor(hex){
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#0f172a' : '#ffffff';
  }

  function renderDetail(){
    const flatAgents = getFlatAgents();
    ensureHolidayMarkers(flatAgents);
    const all = filterAgents(flatAgents);
    all.sort((a,b)=>{
      const groupCompare = compareGroupOrder(a.group, b.group);
      if (groupCompare !== 0) return groupCompare;
      return (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' });
    });
    const monthLabel = MONTH_LABELS[detailMonth-1] || `Mois ${detailMonth}`;
    if (ui.monthSelect && parseInt(ui.monthSelect.value,10)!==detailMonth){
      ui.monthSelect.value = String(detailMonth);
    }
    ui.countInfo.textContent = `${all.length} agent${all.length>1?'s':''} - ${monthLabel} ${filters.year}`;
    ui.grid.innerHTML = '';
    if (!all.length){
      ui.grid.innerHTML = '<div class="empty">Aucun agent. Ouvrir le module Agents pour ajouter des fiches.</div>';
      updateUndoButton();
      return;
    }

    const y=filters.year;
    const monthDays = daysInMonth(y, detailMonth);
    const holidays = buildHolidaySet(y);
    const table = document.createElement('table'); table.className='planning-table';
    const thead=document.createElement('thead'); const hr=document.createElement('tr');
    const hAgent=document.createElement('th'); hAgent.className='agent-name'; hAgent.textContent='Agent'; hr.appendChild(hAgent);
    for(let d=1; d<=monthDays; d++){
      const th=document.createElement('th'); th.className='day';
      const date = new Date(y, detailMonth-1, d);
      const wd = date.getDay();
      const isWeekend = wd===0||wd===6;
      th.innerHTML = `<div class="day-header"><span class="day-label${isWeekend?' weekend':''}">${DAY_LABELS[wd]}</span><span class="day-number">${d}</span></div>`;
      hr.appendChild(th);
    }
    thead.appendChild(hr); table.appendChild(thead);

    const tbody=document.createElement('tbody');

    const pushGroupHeader = (name)=>{
      const tr=document.createElement('tr'); tr.className='group-row';
      const th=document.createElement('th'); th.colSpan=monthDays+1;
      const meta = getGroupMeta(name);
      const baseColor = meta.color || '#4B5563';
      const textColor = pickReadableTextColor(baseColor);
      th.classList.add('group-header-cell');
      th.style.background = baseColor;
      th.style.color = textColor;
      th.textContent = name || 'Sans groupe';
      tr.appendChild(th);
      tbody.appendChild(tr);
    };
    const applyCellVisual=(td, code)=>{ td.className = td.className.replace(/status-[A-Z]+/g,'').trim(); const s=(code||'').toUpperCase().replace(/[^A-Z]/g,''); td.textContent=code||''; if(s) td.classList.add('status-'+s); };

    const renderRow=(agent)=>{
      const id=agent.matricule; const map=state.planning?.[y]?.[id] || {}; const tr=document.createElement('tr');
      const nameTh=document.createElement('th'); nameTh.className='agent-name';
      const meta = getGroupMeta(agent.group);
      const baseColor = meta.color || '#4B5563';
      const backgroundTint = lightenColor(baseColor, 0.82);
      const textColor = pickReadableTextColor(backgroundTint);
      nameTh.style.background = backgroundTint;
      nameTh.style.color = textColor;
      const nameSpan = document.createElement('span');
      nameSpan.textContent = agent.name || 'Sans nom';
      nameTh.appendChild(nameSpan);
      if (id) {
        const idSpan = document.createElement('span');
        idSpan.className = 'agent-id-meta';
        idSpan.textContent = ` (${id})`;
        idSpan.style.marginLeft = 'auto';
        nameTh.appendChild(idSpan);
      }
      tr.appendChild(nameTh);
      for(let d=1; d<=monthDays; d++){
        const td=document.createElement('td'); td.className='day';
        const key=toKey(y, detailMonth, d); let code=map[key]||'';
        td.dataset.agent=id; td.dataset.date=key;
        const wd=new Date(y, detailMonth-1, d).getDay(); const isWeekend=(wd===0||wd===6); if (isWeekend) td.classList.add('weekend');
        const isHoliday=holidays.has(key); if (isHoliday){ td.classList.add('jf'); if(!code) code='JF'; }
        if (!code && isWeekend) code='';
        applyCellVisual(td, code); tr.appendChild(td);
      }
      tbody.appendChild(tr);
    };

    const grouped = all.reduce((acc,a)=>{ (acc[a.group]=acc[a.group]||[]).push(a); return acc; },{});
    getSortedGroups(Object.keys(grouped)).forEach(g=>{ pushGroupHeader(g); grouped[g].forEach(renderRow); });

    table.appendChild(tbody); ui.grid.appendChild(table);
    bindSelectionHandlers();
    fitDetailTableWidth(monthDays);
    updateUndoButton();
  }

  // Drag-select + palette rapide
  function bindSelectionHandlers(){
    selectedCells.clear();
    const table = ui.grid.querySelector('.planning-table'); if(!table) return;
    const quick = document.getElementById('quick-palette');
    const closeBtn = document.getElementById('btn-close-status');
    const clearBtn = document.getElementById('btn-clear-status');
    if (quick){ quick.innerHTML = STATUSES.map(s=>`<button type=\"button\" class=\"btn\" data-code=\"${s.code}\" style=\"background:${s.color};color:#fff\">${s.code}</button>`).join(''); quick.querySelectorAll('button').forEach(btn=> btn.addEventListener('click', ()=> setStatus(btn.dataset.code))); }
    if (closeBtn) closeBtn.onclick = hideStatusModal; if (clearBtn) clearBtn.onclick = ()=> setStatus('');

    const isValidCell = (cell)=> cell && cell.tagName==='TD' && !cell.classList.contains('offmonth') && !cell.closest('tr').classList.contains('group-row');

    table.addEventListener('click', (event)=>{ const cell=event.target.closest('td'); if(!isValidCell(cell)) return; clearSelection(); selectCell(cell); showStatusModal(event.pageX, event.pageY); });
    document.addEventListener('mousedown', (event)=>{ const cell=event.target.closest('.planning-table td'); if(isValidCell(cell)){ isDragging=true; dragStartCell=cell; hideStatusModal(); clearSelection(); selectCell(cell); event.preventDefault(); } });
    document.addEventListener('mousemove', (event)=>{ if(!isDragging || !dragStartCell) return; const cell=event.target.closest('.planning-table td'); if(isValidCell(cell)) selectRangeFromTo(dragStartCell, cell); });
    document.addEventListener('mouseup', (event)=>{ if(!isDragging) return; isDragging=false; if(selectedCells.size>0) setTimeout(()=> showStatusModal(event.pageX, event.pageY), 80); dragStartCell=null; });
  }
  function selectCell(cell){ selectedCells.add(cell); cell.classList.add('selected'); updateSelectionInfo(); }
  function clearSelection(){ selectedCells.forEach(c=> c.classList.remove('selected')); selectedCells.clear(); updateSelectionInfo(); }
  function selectRangeFromTo(startCell, endCell){ const table=startCell.closest('table'); const rows=Array.from(table.querySelectorAll('tbody tr')).filter(r=>!r.classList.contains('group-row')); const sr=rows.indexOf(startCell.closest('tr')); const er=rows.indexOf(endCell.closest('tr')); const sc=Array.from(rows[sr].querySelectorAll('td')).indexOf(startCell); const ec=Array.from(rows[er].querySelectorAll('td')).indexOf(endCell); const minR=Math.min(sr,er), maxR=Math.max(sr,er); const minC=Math.min(sc,ec), maxC=Math.max(sc,ec); clearSelection(); for(let r=minR;r<=maxR;r++){ const cells=Array.from(rows[r].querySelectorAll('td')); for(let c=minC;c<=maxC;c++){ const cell=cells[c]; if (cell && !cell.classList.contains('offmonth')) selectCell(cell); } } }
  function updateSelectionInfo(){ const el=document.getElementById('selection-count'); if(el) el.textContent=selectedCells.size; const badge=document.querySelector('.selection-badge'); if(badge) badge.classList.toggle('active', selectedCells.size>0); }
  function showStatusModal(x,y){ const modal=document.getElementById('status-modal'); if(!modal || selectedCells.size===0) return; const vw=window.innerWidth,vh=window.innerHeight; const sx=window.pageXOffset||document.documentElement.scrollLeft; const sy=window.pageYOffset||document.documentElement.scrollTop; let mx=x+15,my=y-10; if(mx+320>vw+sx) mx=x-335; if(my+260>vh+sy) my=y-270; mx=Math.max(sx+10,mx); my=Math.max(sy+10,my); modal.style.left=mx+'px'; modal.style.top=my+'px'; modal.style.display='block'; }
  function hideStatusModal(){ const modal=document.getElementById('status-modal'); if(modal) modal.style.display='none'; }
  function setStatus(status){
    if (selectedCells.size===0) return;
    const y=filters.year;
    ensureYear(y);
    const yMap=state.planning[y];
    const snapshot=[];
    const rawStatus = typeof status === 'string' ? status.trim() : status;
    const normalizedStatus=(rawStatus||'').toUpperCase();
    let changed=false;
    selectedCells.forEach(cell=>{
      const agent=cell.dataset.agent;
      const date=cell.dataset.date;
      if(!agent||!date) return;
      const isWeekendCell = cell.classList.contains('weekend');
      if (isWeekendCell && normalizedStatus && !WEEKEND_ALLOWED_CODES.has(normalizedStatus)) return;
      yMap[agent]=yMap[agent]||{};
      const hadValue = Object.prototype.hasOwnProperty.call(yMap[agent], date);
      const previous = hadValue ? yMap[agent][date] : null;
      const nextValue = rawStatus ? rawStatus : null;
      if ((hadValue && previous === nextValue) || (!hadValue && nextValue === null)) return;
      snapshot.push({ agent, date, previous });
      if (rawStatus){
        yMap[agent][date]=rawStatus;
      } else {
        delete yMap[agent][date];
      }
      cell.className = cell.className.replace(/status-[A-Z]+/g,'').trim();
      const s=(rawStatus||'').toUpperCase().replace(/[^A-Z]/g,'');
      cell.textContent = rawStatus || '';
      if(s) cell.classList.add('status-'+s);
      changed=true;
    });
    if(!changed){
      hideStatusModal();
      clearSelection();
      return;
    }
    undoStack.push({ year: y, cells: snapshot });
    if (undoStack.length > 100) undoStack.shift();
    saveState();
    hideStatusModal();
    clearSelection();
    updateUndoButton();
  }

  function fitDetailTableWidth(days){
    const container=ui.grid; if(!container) return;
    const total=Math.max(600, container.clientWidth); // élargit la feuille par défaut
    // Cherche un compromis: élargir les jours tant que possible, réduire agent si nécessaire
    let agentCol=Math.round(Math.min(260, Math.max(150, total*0.18)));
    const gap=12;
    const cols=Math.max(1, days||31);
    let dayw=Math.floor((total-agentCol-gap)/cols);
    if (dayw < 22 && agentCol > 180){ // si les jours sont trop étroits, grignote un peu la colonne Agent
      agentCol = 180;
      dayw = Math.floor((total-agentCol-gap)/cols);
    }
    dayw=Math.max(20, Math.min(32, dayw));
    const fs=Math.max(10, Math.min(13, Math.floor(dayw*0.36)));
    const table=container.querySelector('.planning-table');
    if(table){
      table.style.setProperty('--agentw', agentCol+'px');
      table.style.setProperty('--dayw', dayw+'px');
      table.style.setProperty('--dayfs', fs+'px');
    }
  }
  function daysInMonth(y,m){ return new Date(y, m, 0).getDate(); }
  function toKey(y,m,d){ const mm=String(m).padStart(2,'0'); const dd=String(d).padStart(2,'0'); return `${y}-${mm}-${dd}`; }
  function buildHolidaySet(year){ const set=new Set(); const easter=computeEaster(year); const add=(m,d)=> set.add(toKey(year,m,d)); add(1,1); add(5,1); add(5,8); add(7,14); add(8,15); add(11,1); add(11,11); add(12,25); const addDays=(date,days)=>{ const d=new Date(date); d.setDate(d.getDate()+days); return d; }; const easterMon=addDays(easter,1); add(easterMon.getMonth()+1, easterMon.getDate()); const asc=addDays(easter,39); add(asc.getMonth()+1, asc.getDate()); const pent=addDays(easter,50); add(pent.getMonth()+1, pent.getDate()); return set; }
  function computeEaster(Y){ const a=Y%19; const b=Math.floor(Y/100); const c=Y%100; const d=Math.floor(b/4); const e=b%4; const f=Math.floor((b+8)/25); const g=Math.floor((b-f+1)/3); const h=(19*a+b-d-g+15)%30; const i=Math.floor(c/4); const k=c%4; const l=(32+2*e+2*i-h-k)%7; const m=Math.floor((a+11*h+22*l)/451); const month=Math.floor((h+l-7*m+114)/31); const day=((h+l-7*m+114)%31)+1; return new Date(Y,month-1,day); }
    function undoLastAction(){
    if (undoStack.length===0) return;
    const action = undoStack.pop();
    const y = action.year;
    ensureYear(y);
    const yMap = state.planning[y];
    action.cells.forEach(({agent,date,previous})=>{
      yMap[agent] = yMap[agent] || {};
      if (previous !== null && previous !== undefined){
        yMap[agent][date] = previous;
      } else {
        delete yMap[agent][date];
      }
    });
    saveState();
    renderDetail();
    updateUndoButton();
  }
function updateUndoButton(){ if (ui.btnUndo) ui.btnUndo.disabled = undoStack.length === 0; }
function autoApplyWeekendsAndHolidaysBulk(){ const y=filters.year; const m=detailMonth; const holidays=buildHolidaySet(y); const all=filterAgents(getFlatAgents()); ensureYear(y); const yMap=state.planning[y]; const md=daysInMonth(y,m); all.forEach(agent=>{ yMap[agent.matricule]=yMap[agent.matricule]||{}; for(let d=1; d<=md; d++){ const key=toKey(y,m,d); const date=new Date(y,m-1,d); const we=date.getDay()===0||date.getDay()===6; const jf=holidays.has(key); if(jf) yMap[agent.matricule][key]='JF'; else if(we) delete yMap[agent.matricule][key]; } }); saveState(); renderDetail(); }
  function ensureHolidayMarkers(agentList){ const y=filters.year; const m=detailMonth; const holidays=buildHolidaySet(y); ensureYear(y); const yMap=state.planning[y]; const monthDays=daysInMonth(y,m); let dirty=false; agentList.forEach(agent=>{ const id=agent.matricule; if(!id) return; yMap[id]=yMap[id]||{}; for(let d=1; d<=monthDays; d++){ const key=toKey(y,m,d); if(holidays.has(key)){ const current=yMap[id][key]; if(!current || String(current).toUpperCase()==='P'){ yMap[id][key]='JF'; dirty=true; } continue; } } }); if(dirty) saveState(); }
  function setAllPresentForVisibleAgents(){
    const agents=filterAgents(getFlatAgents());
    if(!agents.length) return;
    const y=filters.year;
    const m=detailMonth;
    ensureYear(y);
    const yMap=state.planning[y];
    const monthDays=daysInMonth(y,m);
    const holidays=buildHolidaySet(y);
    const snapshot=[];
    let changed=false;
    agents.forEach(agent=>{
      if(!agent.matricule) return;
      yMap[agent.matricule]=yMap[agent.matricule]||{};
      for(let d=1; d<=monthDays; d++){
        const key=toKey(y,m,d);
        const date=new Date(y,m-1,d);
        const isWeekend=date.getDay()===0||date.getDay()===6;
        const isHoliday=holidays.has(key);
        const mapEntry=yMap[agent.matricule];
        const hadValue=Object.prototype.hasOwnProperty.call(mapEntry, key);
        const previous=hadValue ? mapEntry[key] : null;
        if(isHoliday){
          if(previous === 'JF') continue;
          snapshot.push({ agent: agent.matricule, date: key, previous });
          mapEntry[key]='JF';
          changed=true;
          continue;
        }
        if(isWeekend){
          if(!hadValue) continue;
          snapshot.push({ agent: agent.matricule, date: key, previous });
          delete mapEntry[key];
          changed=true;
          continue;
        }
        if(previous === 'P') continue;
        snapshot.push({ agent: agent.matricule, date: key, previous });
        mapEntry[key]='P';
        changed=true;
      }
    });
    if(!changed) return;
    undoStack.push({ year: y, cells: snapshot });
    if (undoStack.length > 100) undoStack.shift();
    saveState();
    renderDetail();
  }
  function exportPlanning(){ const blob=new Blob([JSON.stringify(state.planning||{},null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='planning_annuel_st8.json'; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); },0); }
  function selectAndImport(){ const input=document.createElement('input'); input.type='file'; input.accept='application/json'; input.addEventListener('change', e=> handleImport(e.target.files?.[0]||null)); input.click(); }
  function handleImport(file){ if(!file) return; const reader=new FileReader(); reader.onload=()=>{ try{ const data=JSON.parse(reader.result); if(typeof data!=='object'||Array.isArray(data)) throw new Error('invalid'); state.planning=data; undoStack = []; saveState(); ensureYear(filters.year); renderDetail(); updateUndoButton(); } catch { alert('JSON invalide.'); } }; reader.readAsText(file); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();



















