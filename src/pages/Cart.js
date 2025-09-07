import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, ordersAPI, paymentsAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatPrice, calculateDiscountedPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCartItems(response);
    } catch (error) {
      toast.error('Failed to fetch cart items');
      console.error('Cart fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    try {
      await cartAPI.updateCart({ product_id: productId, quantity: newQuantity });
      setCartItems(prev =>
        prev.map(item =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
      console.error('Update cart error:', error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      setCartItems(prev => prev.filter(item => item.product_id !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('Remove item error:', error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setCheckoutLoading(true);
      const orderResp = await ordersAPI.createOrder();
      const { orderIds, totalOrderPrice } = orderResp;

      if (!orderIds || orderIds.length === 0) {
        throw new Error('No orders created');
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const keyResp = await paymentsAPI.getKey();
      const { key } = keyResp;
      if (!key) throw new Error('Razorpay key unavailable');

      const primaryOrderId = orderIds[0];
      const rpOrderResp = await paymentsAPI.createRazorpayOrder({
        order_id: primaryOrderId,
        amount: Number(totalOrderPrice).toFixed(2),
        currency: 'INR',
      });

      const { razorpayOrder } = rpOrderResp;
      if (!razorpayOrder?.id) throw new Error('Failed to create Razorpay order');

      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Flashdeal Marketplace',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            const verifyResp = await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: primaryOrderId,
            });
            toast.success('Payment successful!');
            setCartItems([]);
            navigate('/orders');
          } catch (err) {
            toast.error('Payment verification failed');
            console.error('Verify error:', err);
          }
        },
        modal: {
          ondismiss: function () {
            toast('Payment popup closed');
          }
        },
        theme: { color: '#1f2937' },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      toast.error(error?.message || 'Checkout failed');
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const calculateItemTotal = (item) => {
    const discountedPrice = calculateDiscountedPrice(
      parseFloat(item.price),
      parseFloat(item.discount)
    );
    return discountedPrice * item.quantity;
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="mt-2 text-gray-600">
              Review your items before checkout
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">Your cart is empty</div>
              <p className="text-gray-400 mb-6">Add some amazing deals to get started!</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                      Cart Items ({cartItems.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => {
                      const discountedPrice = calculateDiscountedPrice(
                        parseFloat(item.price),
                        parseFloat(item.discount)
                      );
                      
                      return (
                        <div key={item.cart_item_id} className="p-6">
                          <div className="flex items-center space-x-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={item.product_img}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {item.description}
                              </p>
                              <div className="mt-2 flex items-center space-x-2">
                                <span className="text-lg font-bold text-green-600">
                                  {formatPrice(discountedPrice)}
                                </span>
                                {item.discount > 0 && (
                                  <>
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(item.price)}
                                    </span>
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                                      {item.discount}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                              >
                                +
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {formatPrice(calculateItemTotal(item))}
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.product_id)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow sticky top-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatPrice(calculateCartTotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between">
                          <span className="text-lg font-medium text-gray-900">Total</span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(calculateCartTotal())}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading || cartItems.length === 0}
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                    >
                      {checkoutLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Proceed to Checkout'
                      )}
                    </button>

                    <button
                      onClick={() => navigate('/products')}
                      className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
