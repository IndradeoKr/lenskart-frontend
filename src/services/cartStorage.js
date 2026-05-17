const CART_KEY = 'cart';

const getCartKey = () =>{
  try{
    const userStr = localStorage.getItem('user');
    if(userStr){
      const user = JSON.parse(userStr);
      if(user && user.userid){
        return `cart_${user.userid}`;
      }
    }
  }catch(e){
    console.error("Error parsing user from localStorage for cart isolation", e);
  }

  return 'cart_guest';
}

export const cartStorage = {
  getCart() {
    try {
      const raw = localStorage.getItem(getCartKey());
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  setCart(items) {
    localStorage.setItem(getCartKey(), JSON.stringify(items));
  },

  clearCart() {
    localStorage.removeItem(getCartKey());
  },

  addItem(product, quantity = 1) {
    const qty = Math.max(1, Number(quantity) || 1);
    const maxQty =
      typeof product?.quantity === 'number' && Number.isFinite(product.quantity)
        ? Math.max(0, product.quantity)
        : undefined;
    const cart = cartStorage.getCart();
    const existingIndex = cart.findIndex((i) => i.productId === product.productId);
    if (existingIndex >= 0) {
      const updated = [...cart];
      const currentMax =
        typeof updated[existingIndex]?.maxQuantity === 'number' && Number.isFinite(updated[existingIndex].maxQuantity)
          ? updated[existingIndex].maxQuantity
          : maxQty;
      const nextQtyRaw = updated[existingIndex].quantity + qty;
      const nextQty =
        typeof currentMax === 'number' && Number.isFinite(currentMax) ? Math.min(nextQtyRaw, currentMax) : nextQtyRaw;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: nextQty,
        maxQuantity: currentMax,
      };
      cartStorage.setCart(updated);
      return updated;
    }

    const initialQty =
      typeof maxQty === 'number' && Number.isFinite(maxQty) ? Math.min(qty, maxQty) : qty;
    const next = [
      ...cart,
      {
        productId: product.productId,
        productName: product.productName,
        productPrice: product.productPrice,
        productImage: product.productImage,
        brand: product.brand,
        categoryName: product.categoryName,
        quantity: initialQty,
        maxQuantity: maxQty,
      },
    ];
    cartStorage.setCart(next);
    return next;
  },

  updateQuantity(productId, quantity) {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) return cartStorage.getCart();

    const cart = cartStorage.getCart();
    const next = cart.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity:
              typeof item.maxQuantity === 'number' && Number.isFinite(item.maxQuantity)
                ? Math.min(qty, item.maxQuantity)
                : qty,
          }
        : item
    );
    cartStorage.setCart(next);
    return next;
  },

  removeItem(productId) {
    const cart = cartStorage.getCart();
    const next = cart.filter((item) => item.productId !== productId);
    cartStorage.setCart(next);
    return next;
  },

  totals(items) {
    const cart = items ?? cartStorage.getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + (Number(item.productPrice) || 0) * (item.quantity || 0),
      0
    );
    return { totalItems, totalPrice };
  },
};
