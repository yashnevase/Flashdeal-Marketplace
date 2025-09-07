import api from './axiosConfig';

export const paymentsAPI = {
  // Get public Razorpay key
  getKey: async () => {
    const response = await api.get('/payments/key');
    return response.data;
  },

  // Create Razorpay order on server
  createRazorpayOrder: async ({ order_id, amount, currency = 'INR' }) => {
    const response = await api.post('/payments/create-order', { order_id, amount, currency });
    return response.data;
  },

  // Verify Razorpay payment signature
  verifyPayment: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }) => {
    const response = await api.post('/payments/verify', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    });
    return response.data;
  }
};


