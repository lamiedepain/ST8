// libs/datastore.js - gestion centralisée des jeux de données (JSON + localStorage)
(function (global) {
  const STORAGE_PREFIX = 'bm_st8_';

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn('[DataStore] parse error', err);
      return fallback;
    }
  }

  const DataStore = {
    load(name, options = {}) {
      const storageKey = STORAGE_PREFIX + name;
      const stored = safeParse(window.localStorage.getItem(storageKey), null);
      if (stored) {
        return stored;
      }
      if (options.fallback) {
        return structuredClone ? structuredClone(options.fallback) : JSON.parse(JSON.stringify(options.fallback));
      }
      return null;
    },

    save(name, data) {
      const storageKey = STORAGE_PREFIX + name;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
      } catch (err) {
        console.error('[DataStore] save error', err);
        return false;
      }
    },

    reset(name) {
      const storageKey = STORAGE_PREFIX + name;
      window.localStorage.removeItem(storageKey);
    },

    importFile(file, callback) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        const parsed = safeParse(content, null);
        callback(parsed, null);
      };
      reader.onerror = (event) => {
        callback(null, event?.target?.error || new Error('Import échoué'));
      };
      reader.readAsText(file, 'utf-8');
    },

    triggerDownload(filename, json) {
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  global.DataStore = DataStore;
})(window);

