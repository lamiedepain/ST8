// ST8 - stats.js : Statistiques connectées au planning
(() => {
  const STORAGE_KEY = 'planning_st8_autosave';
  const MONTHS = ['Janv','Févr','Mars','Avril','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];

  const ctxLine = document.getElementById('lineChart');
  const ctxPie = document.getElementById('pieChart');

  let chartLine, chartPie;

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function getGroups(data) {
    return Object.keys(data.agents || {});
  }

  function getAgents(data, group) {
    if (group === '__ALL__') {
      return Object.values(data.agents || {}).flat();
    }
    return data.agents?.[group] || [];
  }

  function computePresenceRate(data, year, month, group) {
    const agents = getAgents(data, group);
    const planning = data.planning?.[year] || {};
    let present = 0;
    let total = 0;

    agents.forEach(agent => {
      const matricule = agent.matricule;
      for (let d = 1; d <= 31; d++) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const status = planning[matricule]?.[key];
        if (status !== undefined) {
          total++;
          if (status === 'P') present++;
        }
      }
    });

    const rate = total ? (present / total) * 100 : 0;
    return Math.round(rate * 10) / 10;
  }

  function computeYearSeries(data, year, group) {
    const series = [];
    for (let m = 0; m < 12; m++) {
      series.push(computePresenceRate(data, year, m, group));
    }
    return series;
  }

  function colorForRate(v) {
    if (v >= 90) return '#22c55e';
    if (v >= 60) return '#eab308';
    if (v >= 50) return '#f97316';
    return '#ef4444';
  }

  function renderLine(series) {
    if (chartLine) chartLine.destroy();
    chartLine = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [{
          label: 'Taux de présence',
          data: series,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: ctx => colorForRate(ctx.parsed.y),
          borderColor: ctx => colorForRate(ctx.parsed.y),
          tension: 0.3
        }]
      },
      options: {
        scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%' } } },
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderPie(counts) {
    if (chartPie) chartPie.destroy();
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    chartPie = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#9333ea', '#14b8a6'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  }

  function computeCounters(data, year, month, group) {
    const agents = getAgents(data, group);
    const planning = data.planning?.[year] || {};
    const counts = {};

    agents.forEach(agent => {
      const matricule = agent.matricule;
      for (let d = 1; d <= 31; d++) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const status = planning[matricule]?.[key];
        if (!status) continue;
        counts[status] = (counts[status] || 0) + 1;
      }
    });

    return counts;
  }

  function updateAll() {
    const data = loadData();
    const year = +document.getElementById('yearSelect').value;
    const month = +document.getElementById('monthSelect').value;
    const group = document.getElementById('groupSelect').value;

    const series = computeYearSeries(data, year, group);
    renderLine(series);

    const counts = computeCounters(data, year, month, group);
    renderPie(counts);
  }

  function populateSelectors() {
    const now = new Date();
    const yearSel = document.getElementById('yearSelect');
    const monthSel = document.getElementById('monthSelect');
    const groupSel = document.getElementById('groupSelect');

    const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
    yearSel.innerHTML = years.map(y => `<option value="${y}" ${y === now.getFullYear() ? 'selected' : ''}>${y}</option>`).join('');
    monthSel.innerHTML = MONTHS.map((m, i) => `<option value="${i}" ${i === now.getMonth() ? 'selected' : ''}>${m}</option>`).join('');

    const data = loadData();
    const groups = getGroups(data);
    groupSel.innerHTML = [`<option value="__ALL__">Tous</option>`].concat(groups.map(g => `<option value="${g}">${g}</option>`)).join('');
  }

  function init() {
    populateSelectors();
    document.getElementById('refreshBtn').addEventListener('click', updateAll);
    document.getElementById('yearSelect').addEventListener('change', updateAll);
    document.getElementById('monthSelect').addEventListener('change', updateAll);
    document.getElementById('groupSelect').addEventListener('change', updateAll);
    updateAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
