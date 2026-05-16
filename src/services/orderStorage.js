const ORDERS_KEY = 'ordersByUser';

const safeParse = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const loadAll = () => {
  const parsed = safeParse(localStorage.getItem(ORDERS_KEY));
  return parsed && typeof parsed === 'object' ? parsed : {};
};

const saveAll = (data) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(data));
};

export const orderStorage = {
  getOrdersForUser(userId) {
    if (!userId) return [];
    const all = loadAll();
    const list = all[String(userId)];
    return Array.isArray(list) ? list : [];
  },

  addOrderForUser(userId, order) {
    if (!userId) return null;
    const all = loadAll();
    const key = String(userId);
    const existing = Array.isArray(all[key]) ? all[key] : [];
    const next = [order, ...existing];
    all[key] = next;
    saveAll(all);
    return order;
  },

  createOrder({ userId, items, status = 'IN_PROGRESS' }) {
    const now = new Date();
    const orderId = Number(`${now.getTime()}${Math.floor(Math.random() * 1000)}`); // client-side unique-ish
    const totalItems = (items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
    const totalPrice = (items || []).reduce(
      (sum, i) => sum + (Number(i.productPrice) || 0) * (i.quantity || 0),
      0
    );
    return {
      orderId,
      date: now.toISOString(),
      status,
      items: items || [],
      totalItems,
      totalPrice,
    };
  },
};

