// stats.js - extension de statistiques avancées pour ST8
(function(global){
  let _globalStatusChart=null,_prevTrendChart=null,_topPrevAgentsChart=null;

  function normalizeCode(code){ if(!code) return ''; let k=String(code).trim().toUpperCase(); k=k.normalize('NFD').replace(/\p{Diacritic}/gu,''); if(/^PREV/.test(k)||k==='PREVISION' || k==='PREVISIONNEL' || k==='PREVISIONELLE') return 'PREV'; if(k==='AST-H'||k==='ASTH') return 'ASTH'; if(k==='AST-S'||k==='ASTS') return 'ASTS'; return k; }

  const CODE_COLOR_MAP = {
    'P': '#16a34a','C': '#6b7280','A': '#f59e0b','ASTH': '#ef4444','ASTS': '#f97316','PREV': '#3b82f6','JF': '#B91C1C','DC': '#1f2937','AT': '#B91C1C','AM': '#DC2626'
  };

  function buildGlobalStatusDoughnut(agents){
    const counts={}; agents.forEach(a=>{ Object.values(a.presences||{}).forEach(raw=>{ const c=normalizeCode(raw)||'UNKNOWN'; counts[c]=(counts[c]||0)+1; });});
    const codes=Object.keys(counts).sort();
    const data=codes.map(c=>counts[c]);
    const colors=codes.map(c=>CODE_COLOR_MAP[c]||`hsl(${(c.charCodeAt(0)||65)%360} 65% 55%)`);
    const ctx=document.getElementById('globalStatusChart'); if(!ctx) return;
    if(_globalStatusChart) _globalStatusChart.destroy();
    _globalStatusChart=new Chart(ctx.getContext('2d'),{type:'doughnut',data:{labels:codes,dataSets:[],datasets:[{data,backgroundColor:colors}]},options:{plugins:{legend:{position:'bottom'}}}});
  }

  function buildPrevTrend(agents){
    // collect PREV counts per date last 30 distinct days
    const map={}; agents.forEach(a=>{ Object.entries(a.presences||{}).forEach(([d,raw])=>{ const c=normalizeCode(raw); if(c==='PREV'){ map[d]=(map[d]||0)+1; } });});
    const dates=Object.keys(map).sort().slice(-30); // last 30 chronologically
    const labels=dates.map(d=>{ const p=d.split('-'); return p.length===3?`${p[2]}/${p[1]}`:d; });
    const data=dates.map(d=>map[d]);
    const ctx=document.getElementById('prevTrendChart'); if(!ctx) return;
    if(_prevTrendChart) _prevTrendChart.destroy();
    _prevTrendChart=new Chart(ctx.getContext('2d'),{type:'line',data:{labels,datasets:[{label:'Jours PREV',data,fill:false,borderColor:'#3b82f6',tension:.25}]},options:{scales:{y:{beginAtZero:true}},plugins:{legend:{display:false}}}});
  }

  function buildTopPrevAgents(agents){
    const prevCounts=agents.map(a=>{ let c=0; Object.values(a.presences||{}).forEach(raw=>{ if(normalizeCode(raw)==='PREV') c++; }); return {nom:`${(a.nom||'').toUpperCase()} ${(a.prenom||'')}`.trim(),count:c}; });
    prevCounts.sort((a,b)=>b.count-a.count); const top=prevCounts.slice(0,10);
    const labels=top.map(t=>t.nom); const data=top.map(t=>t.count);
    const ctx=document.getElementById('topPrevAgentsChart'); if(!ctx) return;
    if(_topPrevAgentsChart) _topPrevAgentsChart.destroy();
    _topPrevAgentsChart=new Chart(ctx.getContext('2d'),{type:'bar',data:{labels,datasets:[{label:'Jours PREV',data,backgroundColor:'#3b82f6'}]},options:{indexAxis:'y',scales:{x:{beginAtZero:true}}}});
  }

  function enhanceStats(agents){ if(!agents||!agents.length) return; buildGlobalStatusDoughnut(agents); buildPrevTrend(agents); buildTopPrevAgents(agents); }

  global.ST8StatsExtra={ enhanceStats };
})(window);
