import api from './axiosConfig';

export const productsAPI = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // get seller specific product
  getSellerProducts:async (params = {}) => {
    const response = await api.get('/Sellerproducts', { params });
    return response.data;
  },

  // Get pending products (admin only)
  getPendingProducts: async () => {
    const response = await api.get('/products/pending');
    return response.data;
  },

  // Create new product (seller only)
  createProduct: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product (seller only)
  updateProduct: async (productId, formData) => {
    const response = await api.put(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Approve product (admin only)
  approveProduct: async (productId) => {
    const response = await api.put(`/products/${productId}/approve`);
    return response.data;
  },

  // Reject product (admin only)
  rejectProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  // Delete product (seller only)
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  }
};
