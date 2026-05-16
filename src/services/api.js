import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      // Ignore parse error
    }
  }
  return config;
});

// Auth API endpoints
export const authApi = {
  login: (email, password) =>
    api.post('/login', { email, password }),

  customerRegister: (customerData) =>
    api.post('/customer', customerData),

  getCustomerByEmail: (email) =>
    api.get('/customer', { params: { email } }),

  getAllCustomers: () =>
    api.get('/customer/all'),

  updateCustomerName: (email, password, name) =>
    api.patch('/customer', null, { params: { email, password, name } }),

  updateCustomer: (email, password, customerData) =>
    api.put('/customer', customerData, { params: { email, password } }),

  deleteCustomer: (id) =>
    api.delete('/customer', { params: { id } }),

  adminRegister: (adminData) =>
    api.post('/Admin', adminData),

  getAdminByEmail: (email) =>
    api.get('/Admin', { params: { email } }),

  getAllAdmins: () =>
    api.get('/Admin'),

  updateAdminName: (email, password, name) =>
    api.patch('/Admin', null, { params: { email, password, name } }),

  updateAdmin: (email, password, adminData) =>
    api.put('/Admin', adminData, { params: { email, password } }),

  deleteAdmin: (adminId) =>
    api.delete('/Admin', { params: { adminId } }),
};

// Product API endpoints
export const productApi = {
  getAllProducts: () =>
    api.get('/products'),

  getProductById: (productId) =>
    api.get(`/products/id/${productId}`),

  getProductsByBrand: (brand) =>
    api.get(`/products/brand/${brand}`),

  addProduct: (productData) =>
    api.post('/products', productData),

  updateProduct: (productData) =>
    api.put('/products', productData),

  deleteProduct: (productId) =>
    api.delete(`/products/${productId}`),
};

// Category API endpoints
export const categoryApi = {
  getAllCategories: () =>
    api.get('/category'),

  getCategoryById: (categoryId) =>
    api.get(`/category/id/${categoryId}`),

  getCategoryByName: (categoryName) =>
    api.get(`/category/name/${categoryName}`),

  addCategory: (categoryData) =>
    api.post('/category', categoryData),

  updateCategory: (categoryId, newName) =>
    api.put(`/category/${categoryId}/${newName}`),

  deleteCategory: (categoryId) =>
    api.delete(`/category/${categoryId}`),
};

// Cart API endpoints
export const cartApi = {
  addItemToCart: (cartData) =>
    api.post('/cart', cartData),

  increaseQuantity: (cartData) =>
    api.put('/cart', cartData),

  decreaseQuantity: (cartData) =>
    api.patch('/cart', cartData),

  removeFromCart: (cartId) =>
    api.delete(`/cart/${cartId}`),

  getCartForCustomer: (customerId) =>
    api.get(`/cart/customer/${customerId}`),
};

// Order API endpoints
export const orderApi = {
  getAllOrders: () =>
    api.get('/orders'),

  getCustomerOrders: (customerId) =>
    api.get(`/orders/${customerId}`),

  placeOrder: (orderData) =>
    api.post('/orders', orderData),

  updateOrder: (orderData) =>
    api.put('/orders', orderData),

  deleteOrder: (orderId) =>
    api.delete(`/orders/${orderId}`),
};

export default api;
