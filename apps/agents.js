// apps/agents.js
(() => {
  const STORAGE_KEY = "agents_st8_autosave";

  const PERMITS = [
    { value: "Permis BE", label: "Permis BE", group: "Permis de conduire" },
    { value: "Permis C", label: "Permis C", group: "Permis de conduire" },
    { value: "Permis CE", label: "Permis CE", group: "Permis de conduire" }
  ];
  const CACES = [
    { value: "R.482 - Engins - A", label: "A", group: "R.482 - Engins" },
    { value: "R.482 - Engins - B1", label: "B1", group: "R.482 - Engins" },
    { value: "R.482 - Engins - B2", label: "B2", group: "R.482 - Engins" },
    { value: "R.482 - Engins - C1", label: "C1", group: "R.482 - Engins" },
    { value: "R.482 - Engins - C2", label: "C2", group: "R.482 - Engins" },
    { value: "R.482 - Engins - C3", label: "C3", group: "R.482 - Engins" },
    { value: "R.482 - Engins - D", label: "D", group: "R.482 - Engins" },
    { value: "R.482 - Engins - E", label: "E", group: "R.482 - Engins" },
    { value: "R.482 - Engins - F", label: "F", group: "R.482 - Engins" },
    { value: "R.482 - Engins - G", label: "G", group: "R.482 - Engins" },
    { value: "R.486 - Nacelles - A", label: "A", group: "R.486 - Nacelles" },
    { value: "R.486 - Nacelles - B", label: "B", group: "R.486 - Nacelles" },
    { value: "R.489 - Chariots - 1A", label: "1A", group: "R.489 - Chariots" },
    { value: "R.489 - Chariots - 3", label: "3", group: "R.489 - Chariots" },
    { value: "R.489 - Chariots - 5", label: "5", group: "R.489 - Chariots" },
    { value: "R.490 - Grues - R.490", label: "R.490", group: "R.490 - Grues" }
  ];
  const COMPETENCES_PAR_TRAVAUX = {
    "Pavage": ["Paveur", "Manœuvre polyvalent", "Chef d’équipe"],
    "Terrassement": ["Terrassier", "Enginiste / Pelleteur", "Chauffeur PL", "Manœuvre polyvalent"],
    "Assainissement": ["Enginiste / Pelleteur", "Maçon VRD", "Chauffeur PL", "Manœuvre polyvalent"],
    "Enrobé": ["Enrobeur / Finisseur", "Chauffeur PL", "Manœuvre polyvalent"],
    "Signalisation": ["Signalisation", "Manœuvre polyvalent"],
    "Aménagement urbain": ["Mobilier urbain", "Maçon VRD", "Manœuvre polyvalent"],
    "Béton / Bordures": ["Maçon VRD", "Chauffeur PL", "Manœuvre polyvalent"],
    "Transport": ["Chauffeur PL", "Manœuvre polyvalent"],
    "Nettoyage": ["Chauffeur PL", "Balayeur"],
    "Divers": ["Chef d’équipe", "Manœuvre polyvalent"]
  };

  const SKILL_PRIMARY_GROUP = new Map();
  Object.entries(COMPETENCES_PAR_TRAVAUX).forEach(([travaux, competences]) => {
    (competences || []).forEach(skill => {
      if (!SKILL_PRIMARY_GROUP.has(skill)) {
        SKILL_PRIMARY_GROUP.set(skill, travaux);
      }
    });
  });

  const PERMIT_DISPLAY_MAP = new Map(PERMITS.map(item => [item.value, item.label]));
  const CACES_INFO_MAP = CACES.reduce((acc, item) => {
    const rawGroup = item.group || "";
    const category = rawGroup.replace(/^R\.\d+\s*-\s*/i, "").trim() || rawGroup;
    acc[item.value] = { category, code: item.label || "", group: rawGroup };
    return acc;
  }, {});
  const PERMIT_TAG_CLASS = {
    'PERMIS BE': 'tag-permis-be',
    'PERMIS C': 'tag-permis-c',
    'PERMIS CE': 'tag-permis-ce'
  };
  const CACES_TAG_CLASS = {
    engins: 'tag-caces-engins',
    nacelles: 'tag-caces-nacelles',
    chariots: 'tag-caces-chariots',
    grues: 'tag-caces-grues'
  };
  const GROUP_COLOR_POOL = ["#2563eb", "#16a34a", "#f59e0b", "#db2777", "#0ea5e9", "#9333ea", "#ef4444", "#14b8a6", "#78350f"];
  const DEFAULT_GROUP_META = {
    "AGENTS VOIRIE ST 8": { color: "#2563eb", order: 1 },
    "AGENTS ESPACE VERT ST 8": { color: "#16a34a", order: 2 },
    ENCADRANTS: { color: "#9333ea", order: 3 },
    "MAGASIN ST 8": { color: "#f59e0b", order: 4 },
    "AGENT ENTRETIEN BATIMENT ST 8": { color: "#0ea5e9", order: 5 }
  };

  const ROOT = document;
  const $ = selector => ROOT.querySelector(selector);
  const $$ = selector => Array.from(ROOT.querySelectorAll(selector));

  const DEFAULT_AGENTS = {
    "AGENTS VOIRIE ST 8": [
      { matricule: "C002908", name: "FONTENEAU Fabrice", grade: "AT", permis: [], caces: [], skills: ["VRD"] },
      { matricule: "T028198", name: "GOUREAU Jonathan", grade: "AT", permis: [], caces: [], skills: ["VRD"] },
      { matricule: "C004505", name: "GUIJARRO Juan-Pedro", grade: "AT", permis: [], caces: [], skills: ["VRD"] },
      { matricule: "C002987", name: "LABORIE Jean-Louis", grade: "AT", permis: [], caces: [], skills: ["VRD"] },
      { matricule: "C007317", name: "LARRIEU Cedric", grade: "AT", permis: [], caces: [], skills: ["VRD"] },
      { matricule: "C005624", name: "MARTIN HER Pierre", grade: "AT", permis: [], caces: [], skills: ["VRD"] },
      { matricule: "C007758", name: "PIERRE Frantzy", grade: "AT", permis: [], caces: [], skills: ["VRD"] },
      { matricule: "C004609", name: "SOLA Xavier", grade: "AT", permis: [], caces: [], skills: ["VRD"] }
    ],
    "AGENTS ESPACE VERT ST 8": [
      { matricule: "T029231", name: "DA SILVA REIS Alexandra", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "N018514", name: "DELANDE Romain", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "N011181", name: "ELMAGROUD Sofiane", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "C004163", name: "ESTEVE Thierry", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "C006429", name: "KADRI Houssine", grade: "ATTP1", permis: [], caces: ["R.482 - Engins - C1"], skills: ["Espaces verts"] },
      { matricule: "N023455", name: "MALLET Ludovic", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "C007461", name: "MAURY Xavier", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "T030790", name: "MOINGT Joffrey", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "JT030619", name: "REY Adrien", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "N019681", name: "TADJROUNA Mohamed", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "N019974", name: "VILLENEUVE Fabrice", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] },
      { matricule: "T029734", name: "WEISS Miguel", grade: "ATTP1", permis: [], caces: [], skills: ["Espaces verts"] }
    ],
    "ENCADRANTS": [
      { matricule: "C003285", name: "FOURCADE Hervé", grade: "TECH", permis: [], caces: [], skills: ["Encadrement"] },
      { matricule: "JT030845", name: "GONCALVES Lionel", grade: "TECH", permis: [], caces: [], skills: ["Encadrement"] },
      { matricule: "N011045", name: "SIGALA J-Christophe", grade: "TECH", permis: [], caces: [], skills: ["Encadrement"] },
      { matricule: "N015967", name: "TUCOULET Dorian", grade: "TECH", permis: [], caces: [], skills: ["Encadrement"] }
    ],
    "MAGASIN ST 8": [
      { matricule: "C003865", name: "GENNA Grégory", grade: "AT", permis: [], caces: [], skills: ["Magasin"] },
      { matricule: "N010342", name: "VOL Christophe", grade: "AT", permis: [], caces: [], skills: ["Magasin"] }
    ],
    "AGENT ENTRETIEN BATIMENT ST 8": [
      { matricule: "N010032", name: "BERNARD Jean-Louis", grade: "AT", permis: [], caces: [], skills: ["Entretien bâtiment"] },
      { matricule: "N010563", name: "HAUBRAICHE Philippe", grade: "AT", permis: [], caces: [], skills: ["Entretien bâtiment"] }
    ]
  };

  Object.keys(DEFAULT_AGENTS || {}).forEach(groupName => {
    (DEFAULT_AGENTS[groupName] || []).forEach(agent => {
      (agent.skills || []).forEach(skill => {
        if (skill && !SKILL_PRIMARY_GROUP.has(skill)) {
          SKILL_PRIMARY_GROUP.set(skill, "Autres");
        }
      });
    });
  });

  const SKILL_GROUP_ORDER = [...Object.keys(COMPETENCES_PAR_TRAVAUX), "Autres"];
  const SKILLS = SKILL_GROUP_ORDER.flatMap(group => {
    const entries = Array.from(SKILL_PRIMARY_GROUP.entries()).filter(([, travaux]) => travaux === group);
    if (!entries.length) return [];
    return entries
      .sort((a, b) => a[0].localeCompare(b[0], "fr", { sensitivity: "base" }))
      .map(([skill]) => ({ value: skill, label: skill, group }));
  });

  let state = loadState();
  let stateChanged = false;
  if (!state.agents || !Object.keys(state.agents).length) {
    state.agents = DEFAULT_AGENTS;
    stateChanged = true;
  }
  state.groupMeta = state.groupMeta || {};
  if (ensureGroupMetaFromAgents()) stateChanged = true;
  if (stateChanged) saveState();

  let editingId = null;
  let displayGroups = false;
  let activeGroupFilter = "";
  let searchTerm = "";

  function boot() {
    renderOptions("permits-options", PERMITS);
    renderOptions("caces-options", CACES);
    renderOptions("skills-options", SKILLS);

    $("#btn-save-agent")?.addEventListener("click", handleSaveAgent);
    $("#btn-cancel-edit")?.addEventListener("click", resetForm);
    $("#btn-delete-agent")?.addEventListener("click", handleDeleteAgent);

    $("#btn-import-agents")?.addEventListener("click", () => $("#file-import-agents")?.click());
    $("#file-import-agents")?.addEventListener("change", handleImportAgents);
    $("#btn-export-agents")?.addEventListener("click", exportAgents);

    $("#agents-search")?.addEventListener("input", event => {
      searchTerm = (event.target.value || "").toLowerCase();
      renderAgents();
    });
    $("#btn-reset-search")?.addEventListener("click", () => {
      searchTerm = "";
      if ($("#agents-search")) $("#agents-search").value = "";
      renderAgents();
    });
    $("#toggle-groups")?.addEventListener("click", () => {
      displayGroups = !displayGroups;
      $("#toggle-groups").textContent = displayGroups ? "Vue complete" : "Vue par groupes";
      renderAgents();
    });

    renderGroupFilters();
    $("#btn-add-group")?.addEventListener("click", handleAddGroup);
    $("#new-group-name")?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddGroup();
      }
    });
    renderAgents();
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      console.warn("Impossible de lire", STORAGE_KEY, error);
      return {};
    }
  }

  function saveState() {
    ensureGroupMetaFromAgents();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncAgentsToPlanning();
  }

  function syncAgentsToPlanning() {
    try {
      const key = "planning_st8_autosave";
      const raw = localStorage.getItem(key);
      const obj = raw ? JSON.parse(raw) : {};
      obj.planning = obj.planning || {};
      obj.agents = state.agents || {};
      obj.groupMeta = state.groupMeta || {};
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (error) {
      console.warn("Sync agents to planning_st8_autosave failed", error);
    }
  }

  function ensureGroupMetaFromAgents() {
    state.groupMeta = state.groupMeta || {};
    const meta = state.groupMeta;
    const groups = Object.keys(state.agents || {});
    let updated = false;
    let maxOrder = Object.values(meta).reduce((max, item) => Math.max(max, item?.order || 0), 0);

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

    const sorted = groups
      .slice()
      .sort((a, b) => compareGroupOrder(a, b, meta));
    sorted.forEach((group, index) => {
      const desired = index + 1;
      if (!meta[group] || meta[group].order !== desired) {
        meta[group] = meta[group] || {};
        meta[group].order = desired;
        meta[group].color = meta[group].color || pickGroupColor(desired);
        updated = true;
      }
    });

    state.groupMeta = meta;
    return updated;
  }

  function pickGroupColor(index) {
    const paletteIndex = (index - 1) % GROUP_COLOR_POOL.length;
    return GROUP_COLOR_POOL[paletteIndex];
  }

  function compareGroupOrder(a, b, metaSource) {
    const meta = metaSource || state.groupMeta || {};
    const ao = meta[a]?.order ?? Number.MAX_SAFE_INTEGER;
    const bo = meta[b]?.order ?? Number.MAX_SAFE_INTEGER;
    if (ao === bo) {
      return (a || "").localeCompare(b || "", "fr", { sensitivity: "base" });
    }
    return ao - bo;
  }

  function getSortedGroups() {
    return Object.keys(state.agents || {}).sort((a, b) => compareGroupOrder(a, b));
  }

  function escapeHtml(value) {
    return (value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatPermitLabel(value) {
    return PERMIT_DISPLAY_MAP.get(value) || value;
  }

  function parseCacesValue(value) {
    const info = CACES_INFO_MAP[value];
    if (info) {
      const label = info.category || value;
      const titleParts = [info.group || info.category || label];
      if (info.code) titleParts.push(`Code ${info.code}`);
      return {
        label,
        title: titleParts.join(' • '),
        category: label,
        code: info.code || ''
      };
    }
    const fallback = value || '';
    return { label: fallback, title: fallback, category: fallback, code: '' };
  }

  function renderOptions(containerId, values) {
    const container = $("#" + containerId);
    if (!container) return;
    const items = (values || [])
      .map(value => {
        if (typeof value === "string") {
          return { value, label: value, group: "" };
        }
        return {
          value: value?.value || value?.label || "",
          label: value?.label || value?.value || "",
          group: value?.group || ""
        };
      })
      .filter(item => item.value && item.label);

    const grouped = new Map();
    items.forEach(item => {
      const key = item.group || "";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    });

    const markup = Array.from(grouped.entries())
      .map(([group, options]) => {
        const checkboxes = options
          .map(
            option => `
        <label class="checkbox">
          <input type="checkbox" value="${escapeHtml(option.value)}">
          <span>${escapeHtml(option.label)}</span>
        </label>`
          )
          .join("");
        if (!group) return checkboxes;
        return `<div class="option-group"><div class="option-group__title">${escapeHtml(group)}</div>${checkboxes}</div>`;
      })
      .join("");

    container.innerHTML = markup;
  }

  function renderGroupFilters() {
    const container = $("#group-filters");
    if (!container) return;
    const groups = [""].concat(getSortedGroups());
    container.innerHTML = groups
      .map(group => {
        const active = group === activeGroupFilter ? " active" : "";
        const label = group || "Tous les groupes";
        const meta = state.groupMeta?.[group] || {};
        const dot =
          group && meta.color
            ? `<span class="color-dot" style="background:${meta.color}"></span>`
            : "";
        return `<button class="btn btn-outline${active}" data-group="${group}">${dot}${label}</button>`;
      })
      .join("");
    $$("#group-filters button").forEach(btn => {
      btn.addEventListener("click", () => {
        activeGroupFilter = btn.dataset.group || "";
        renderGroupFilters();
        renderAgents();
      });
    });
  }
function renderGroupSuggestions() {
    const list = $("#agent-group-suggestions");
    if (!list) return;
    const groups = getSortedGroups();
    list.innerHTML = groups.map(group => `<option value="${escapeHtml(group)}"></option>`).join("");
}

function renderGroupSettings() {
    const container = $("#group-settings-list");
    const badge = $("#groups-count");
    if (!container) return;
    const groups = getSortedGroups();
    if (badge) badge.textContent = `${groups.length} groupe${groups.length > 1 ? "s" : ""}`;
    container.innerHTML = groups
      .map(group => {
        const meta = state.groupMeta?.[group] || {};
        const color = meta.color || pickGroupColor(meta.order || 1);
        const order = meta.order || 1;
        const count = (state.agents[group] || []).length;
        const disabled = count > 0 ? " disabled" : "";
        return `
        <div class="group-setting-row" data-group="${escapeHtml(group)}">
          <div class="group-setting-name">
            <span class="color-chip" style="background:${color}"></span>
            <span>${escapeHtml(group)}</span>
            <span class="count-badge">${count}</span>
          </div>
          <input type="color" value="${color}" data-action="color">
          <input type="number" min="1" value="${order}" data-action="order">
          <button type="button" data-action="delete" data-group="${escapeHtml(group)}"${disabled}>Supprimer</button>
        </div>`;
      })
      .join("");

    container.querySelectorAll("input[data-action=color]").forEach(input => {
      input.addEventListener("input", () => {
        const group = input.closest(".group-setting-row")?.dataset.group;
        if (!group) return;
        state.groupMeta[group] = state.groupMeta[group] || {};
        state.groupMeta[group].color = input.value;
        saveState();
        renderGroupFilters();
        renderAgents();
      });
    });

    container.querySelectorAll("input[data-action=order]").forEach(input => {
      input.addEventListener("change", () => {
        const raw = parseInt(input.value, 10);
        const group = input.closest(".group-setting-row")?.dataset.group;
        if (!group || Number.isNaN(raw) || raw < 1) {
          renderGroupSettings();
          return;
        }
        state.groupMeta[group] = state.groupMeta[group] || {};
        state.groupMeta[group].order = raw;
        ensureGroupMetaFromAgents();
        saveState();
        renderGroupFilters();
        renderAgents();
      });
    });

    container.querySelectorAll("button[data-action=delete]").forEach(button => {
      if (button.hasAttribute("disabled")) return;
      button.addEventListener("click", () => {
        const group = button.dataset.group;
        if (!group) return;
        if ((state.agents[group] || []).length) return;
        delete state.agents[group];
        delete state.groupMeta[group];
        ensureGroupMetaFromAgents();
        saveState();
        renderGroupFilters();
        renderAgents();
      });
    });
}

function handleAddGroup() {
    const input = $("#new-group-name");
    if (!input) return;
    const name = (input.value || "").trim();
    if (!name) return;
    if (!state.agents[name]) {
      state.agents[name] = [];
    }
    if (!state.groupMeta[name]) {
      const preset = DEFAULT_GROUP_META[name];
      state.groupMeta[name] = preset ? { ...preset } : { color: pickGroupColor(Object.keys(state.groupMeta).length + 1), order: Object.keys(state.groupMeta).length + 1 };
    }
    ensureGroupMetaFromAgents();
    saveState();
    input.value = "";
    renderGroupFilters();
    renderAgents();
}


  function getFlatAgents() {
    const flat = [];
    Object.keys(state.agents || {}).forEach(group => {
      (state.agents[group] || []).forEach(agent => flat.push({ ...agent, group }));
    });
    const query = searchTerm.trim();
    const filtered = query
      ? flat.filter(agent =>
          [
            agent.matricule,
            agent.name,
            agent.group,
            agent.grade,
            agent.notes,
            ...(agent.permis || []),
            ...(agent.caces || []),
            ...(agent.skills || [])
          ].some(value => (value || "").toString().toLowerCase().includes(query))
        )
      : flat;
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || "", "fr", { sensitivity: "base" }));
    return filtered;
  }

  function renderAgents() {
    renderGroupSuggestions();
    const container = $("#agents-list");
    const countBadge = $("#agents-count");
    if (!container || !countBadge) return;
    const allAgents = getFlatAgents();
    countBadge.textContent = `${allAgents.length} agent${allAgents.length > 1 ? "s" : ""}`;
    const filtered = activeGroupFilter ? allAgents.filter(agent => agent.group === activeGroupFilter) : allAgents;

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state">Aucun agent. Enregistre une fiche ou modifie les filtres.</div>`;
      renderGroupSettings();
      return;
    }

    if (!displayGroups) {
      container.innerHTML = buildGroupSection("Tous les agents", filtered);
      bindAgentRows();
      renderGroupSettings();
      return;
    }

    const grouped = filtered.reduce((acc, agent) => {
      acc[agent.group] = acc[agent.group] || [];
      acc[agent.group].push(agent);
      return acc;
    }, {});
    const markup = Object.keys(grouped)
      .sort((a, b) => compareGroupOrder(a, b))
      .map(group => buildGroupSection(group, grouped[group]))
      .join("");
    container.innerHTML = markup;
    bindAgentRows();
    renderGroupSettings();
  }

  function buildGroupSection(groupName, agents) {
    const meta = state.groupMeta?.[groupName] || {};
    const color = meta.color || "#1f3f68";
    const rows = agents
      .map(agent => {
        const id = agent.matricule || "";
        const activeClass = editingId === id ? " active" : "";
        const tagsPermis = (agent.permis || [])
          .map(val => {
            const label = formatPermitLabel(val);
            const klass = PERMIT_TAG_CLASS[label.toUpperCase()] || 'tag-permis-c';
            return `<span class="tag ${klass}">${escapeHtml(label)}</span>`;
          })
          .join("");
        const tagsCaces = (agent.caces || [])
          .map(val => {
            const parsed = parseCacesValue(val);
            const klass = CACES_TAG_CLASS[(parsed.category || '').trim().toLowerCase()] || 'tag-caces-engins';
            return `<span class="tag ${klass}" title="${escapeHtml(parsed.title)}">${escapeHtml(parsed.label)}</span>`;
          })
          .join("");
        const tagsSkills = (agent.skills || []).map(val => `<span class="tag">${escapeHtml(val)}</span>`).join("");
        const info = agent.notes ? `<span class="tag">${escapeHtml(agent.notes)}</span>` : "";
        return `
        <div class="agent-row${activeClass}" data-id="${id}" data-group="${agent.group}">
          <div class="agent-id">${id || "—"}</div>
          <div>
            <div class="agent-name">${agent.name || "Sans nom"}</div>
            <div class="tag-list">${tagsPermis}${tagsCaces}${tagsSkills}${info}</div>
          </div>
        </div>`;
      })
      .join("");
    return `
      <div class="group-card">
        <div class="group-head" style="border-left:6px solid ${color};">
          <span><span class="color-dot" style="background:${color}"></span>${groupName || "Sans groupe"} (${agents.length})</span>
          <button type="button" data-group="${groupName}">Tout sélectionner</button>
        </div>
        <div class="agents-list">${rows}</div>
      </div>`;
  }

  function bindAgentRows() {
    $$(".group-head button").forEach(button => {
      button.addEventListener("click", () => {
        const group = button.dataset.group || "";
        activeGroupFilter = group;
        renderGroupFilters();
        renderAgents();
      });
    });
    $$(".agent-row").forEach(row => {
      row.addEventListener("click", () => {
        const id = row.dataset.id;
        const group = row.dataset.group;
        const agent = (state.agents[group] || []).find(a => a.matricule === id);
        if (agent) {
          fillForm(agent, group);
          editingId = id;
          renderAgents();
        }
      });
    });
  }

  function fillForm(agent, group) {
    if ($("#agent-id")) $("#agent-id").value = agent.matricule || "";
    if ($("#agent-name")) $("#agent-name").value = agent.name || "";
    if ($("#agent-birth")) $("#agent-birth").value = agent.birth || "";
    if ($("#agent-group")) $("#agent-group").value = group || agent.group || (getSortedGroups()[0] || "");
    if ($("#agent-grade")) $("#agent-grade").value = agent.grade || "AT";
    populateCheckboxes("permits-options", agent.permis || []);
    populateCheckboxes("caces-options", agent.caces || []);
    populateCheckboxes("skills-options", agent.skills || []);
    if ($("#agent-notes")) $("#agent-notes").value = agent.notes || "";
    if ($("#btn-delete-agent")) $("#btn-delete-agent").hidden = false;
    if ($("#form-title")) $("#form-title").textContent = `Modifier ${agent.matricule || "l'agent"}`;
    if ($("#form-status")) $("#form-status").textContent = agent.group ? `Groupe : ${agent.group}` : "";
  }

  function populateCheckboxes(containerId, values) {
    $$("#" + containerId + " input[type=checkbox]").forEach(box => {
      box.checked = values.includes(box.value);
    });
  }

  function resetForm() {
    editingId = null;
    if ($("#agent-id")) $("#agent-id").value = "";
    if ($("#agent-name")) $("#agent-name").value = "";
    if ($("#agent-birth")) $("#agent-birth").value = "";
    if ($("#agent-group")) $("#agent-group").value = getSortedGroups()[0] || "";
    if ($("#agent-grade")) $("#agent-grade").value = "AT";
    populateCheckboxes("permits-options", []);
    populateCheckboxes("caces-options", []);
    populateCheckboxes("skills-options", []);
    if ($("#agent-notes")) $("#agent-notes").value = "";
    if ($("#btn-delete-agent")) $("#btn-delete-agent").hidden = true;
    if ($("#form-title")) $("#form-title").textContent = "Nouvel agent";
    if ($("#form-status")) $("#form-status").textContent = "";
    renderGroupFilters();
    renderAgents();
  }

  function handleSaveAgent() {
    const matricule = ($("#agent-id")?.value || "").trim();
    const name = ($("#agent-name")?.value || "").trim();
    const birth = $("#agent-birth")?.value || "";
    const fallbackGroup = getSortedGroups()[0] || "AUTRES";
    const groupInput = ($("#agent-group")?.value || "").trim();
    const group = groupInput || fallbackGroup;
    const grade = $("#agent-grade")?.value || "AT";
    const permis = gatherCheckedValues("permits-options");
    const caces = gatherCheckedValues("caces-options");
    const skills = gatherCheckedValues("skills-options");
    const notes = ($("#agent-notes")?.value || "").trim();

    if (!matricule || !name) {
      alert("Matricule et nom sont obligatoires.");
      return;
    }

    state.agents[group] = state.agents[group] || [];

    if (editingId && editingId !== matricule) {
      Object.keys(state.agents).forEach(g => {
        state.agents[g] = (state.agents[g] || []).filter(agent => agent.matricule !== editingId);
      });
    }

    Object.keys(state.agents).forEach(g => {
      state.agents[g] = (state.agents[g] || []).filter(agent => agent.matricule !== matricule);
    });

    state.agents[group].push({ matricule, name, birth, grade, permis, caces, skills, notes });
    ensureGroupMetaFromAgents();
    sortGroups();
    saveState();
    resetForm();
  }

  function gatherCheckedValues(containerId) {
    const selected = $$("#" + containerId + " input[type=checkbox]")
      .filter(box => box.checked)
      .map(box => box.value);
    return Array.from(new Set(selected));
  }

  function sortGroups() {
    Object.keys(state.agents || {}).forEach(group => {
      state.agents[group].sort((a, b) => (a.name || "").localeCompare(b.name || "", "fr", { sensitivity: "base" }));
    });
  }

  function handleDeleteAgent() {
    if (!editingId) return;
    if (!confirm("Supprimer cet agent ?")) return;
    Object.keys(state.agents || {}).forEach(group => {
      state.agents[group] = (state.agents[group] || []).filter(agent => agent.matricule !== editingId);
    });
    ensureGroupMetaFromAgents();
    saveState();
    resetForm();
  }

  function exportAgents() {
    const blob = new Blob([JSON.stringify(state.agents || {}, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agents_st8.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }

  function handleImportAgents(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (typeof data !== "object" || Array.isArray(data)) throw new Error();
        state.agents = data;
        ensureGroupMetaFromAgents();
        saveState();
        renderGroupFilters();
        resetForm();
      } catch (error) {
        alert("JSON invalide.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();



















