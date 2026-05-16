const KEY = 'knownCategories';

const normalize = (name) => (name || '').trim();

export const categoryStorage = {
  getAll() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalize).filter(Boolean);
    } catch {
      return [];
    }
  },

  setAll(names) {
    const next = Array.from(new Set((names || []).map(normalize).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  },

  upsert(name) {
    const n = normalize(name);
    if (!n) return categoryStorage.getAll();
    const current = categoryStorage.getAll();
    return categoryStorage.setAll([...current, n]);
  },

  remove(name) {
    const n = normalize(name);
    const current = categoryStorage.getAll();
    return categoryStorage.setAll(current.filter((c) => c !== n));
  },
};

