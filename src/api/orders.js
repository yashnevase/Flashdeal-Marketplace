import api from './axiosConfig';

export const ordersAPI = {
  // Get buyer orders
  getBuyerOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get seller orders
  getSellerOrders: async () => {
    const response = await api.get('/orders/seller');
    return response.data;
  },

  // Create order (checkout)
  createOrder: async () => {
    const response = await api.post('/orders');
    return response.data;
  },

  // Update order status (seller only)
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  }
};
