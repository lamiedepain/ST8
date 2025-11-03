// libs/presence.js - calculs taux de présence par groupe/période
(function (global) {
  const PresenceUtils = {
    computeDailyRates(entries, options = {}) {
      if (!Array.isArray(entries)) return [];
      const groupFilter = options.groupId || options.group;
      const includeAgents = Array.isArray(options.agentIds) ? new Set(options.agentIds) : null;
      const result = [];

      entries.forEach((item) => {
        if (!item) return;
        const { date, presents, effectifTotal, groupId, agents } = item;
        if (!date || typeof effectifTotal !== 'number' || effectifTotal <= 0) return;
        if (groupFilter && groupId && groupId !== groupFilter) return;
        if (includeAgents && agents) {
          const selection = agents.filter((agent) => includeAgents.has(agent));
          if (!selection.length) return;
        }
        const ratio = presents / effectifTotal;
        result.push({
          dateISO: DateTimeUtils.toISO(date) || date,
          groupId: groupId || null,
          presents,
          effectifTotal,
          taux: Number.isFinite(ratio) ? Math.round(ratio * 10000) / 100 : 0
        });
      });

      return result.sort((a, b) => (a.dateISO || '').localeCompare(b.dateISO || ''));
    },

    aggregateByPeriod(dailyRates, step = 'week') {
      if (!Array.isArray(dailyRates) || !dailyRates.length) return [];
      const buckets = new Map();

      dailyRates.forEach((entry) => {
        const baseDate = DateTimeUtils.toDate(entry.dateISO || entry.date);
        if (!baseDate) return;
        let key;
        if (step === 'month') {
          key = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
        } else if (step === 'year') {
          key = `${baseDate.getFullYear()}`;
        } else {
          // semaine ISO
          const temp = PresenceUtils.getIsoWeek(baseDate);
          key = `${temp.year}-W${String(temp.week).padStart(2, '0')}`;
        }

        const bucket = buckets.get(key) || { key, sum: 0, count: 0 };
        bucket.sum += entry.taux;
        bucket.count += 1;
        buckets.set(key, bucket);
      });

      return Array.from(buckets.values())
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((item) => ({
          key: item.key,
          taux: item.count ? Math.round((item.sum / item.count) * 100) / 100 : 0
        }));
    },

    getIsoWeek(date) {
      const target = DateTimeUtils.toDate(date);
      if (!target) {
        return { year: 0, week: 0 };
      }
      const tempDate = new Date(target.getTime());
      tempDate.setHours(0, 0, 0, 0);
      tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
      const week1 = new Date(tempDate.getFullYear(), 0, 4);
      return {
        year: tempDate.getFullYear(),
        week: 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
      };
    }
  };

  global.PresenceUtils = PresenceUtils;
})(window);

