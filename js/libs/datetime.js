// libs/datetime.js - utilitaires dates centralisés pour toutes les apps
(function (global) {
  const DateTimeUtils = {
    toDate(value) {
      if (value instanceof Date) return new Date(value.getTime());
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        // Supporte formats ISO (YYYY-MM-DD) et DD/MM/YYYY
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          const parts = trimmed.split('-');
          const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          return isNaN(date.getTime()) ? null : date;
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
          const [day, month, year] = trimmed.split('/').map(Number);
          const date = new Date(year, month - 1, day);
          return isNaN(date.getTime()) ? null : date;
        }
      }
      if (typeof value === 'number') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    },

    toISO(date) {
      const d = DateTimeUtils.toDate(date);
      if (!d) return '';
      const year = d.getFullYear();
      const month = `${d.getMonth() + 1}`.padStart(2, '0');
      const day = `${d.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    formatFr(date, options) {
      const d = DateTimeUtils.toDate(date);
      if (!d) return '';
      const localeOptions = options || { year: 'numeric', month: '2-digit', day: '2-digit' };
      return d.toLocaleDateString('fr-FR', localeOptions);
    },

    diffInDays(dateA, dateB) {
      const a = DateTimeUtils.toDate(dateA);
      const b = DateTimeUtils.toDate(dateB);
      if (!a || !b) return null;
      const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
      const diff = (utcA - utcB) / (1000 * 60 * 60 * 24);
      return diff;
    },

    addDays(baseDate, offset) {
      const date = DateTimeUtils.toDate(baseDate);
      if (!date || typeof offset !== 'number' || !isFinite(offset)) return null;
      const copy = new Date(date.getTime());
      copy.setDate(copy.getDate() + offset);
      return copy;
    },

    isBetween(target, start, end, inclusive = true) {
      const t = DateTimeUtils.toDate(target);
      const s = DateTimeUtils.toDate(start);
      const e = DateTimeUtils.toDate(end);
      if (!t || !s || !e) return false;
      const value = t.getTime();
      const min = Math.min(s.getTime(), e.getTime());
      const max = Math.max(s.getTime(), e.getTime());
      if (inclusive) {
        return value >= min && value <= max;
      }
      return value > min && value < max;
    },

    daysInMonth(year, monthIndex) {
      if (typeof year !== 'number' || typeof monthIndex !== 'number') return 31;
      return new Date(year, monthIndex + 1, 0).getDate();
    },

    getDayRange(start, end) {
      const s = DateTimeUtils.toDate(start);
      const e = DateTimeUtils.toDate(end);
      if (!s || !e) return [];
      const direction = s <= e ? 1 : -1;
      const range = [];
      let current = new Date(s.getTime());
      const limit = new Date(e.getTime());
      while ((direction > 0 && current <= limit) || (direction < 0 && current >= limit)) {
        range.push(DateTimeUtils.toISO(current));
        current = DateTimeUtils.addDays(current, direction);
      }
      return direction > 0 ? range : range.reverse();
    }
  };

  // Expose en global
  global.DateTimeUtils = DateTimeUtils;
})(window);

