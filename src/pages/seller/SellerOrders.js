import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPrice, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getSellerOrders();
      setOrders(response);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Status update error:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus.toLowerCase()) {
      case 'pending':
        return 'Confirmed';
      case 'confirmed':
        return 'Shipped';
      case 'shipped':
        return 'Delivered';
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="mt-2 text-gray-600">
              Track and manage orders for your products
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All Orders' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'shipped', label: 'Shipped' },
                  { key: 'delivered', label: 'Delivered' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.key === 'all' ? orders.length : orders.filter(order => order.status.toLowerCase() === tab.key).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {filter === 'all' ? 'No orders found' : `No ${filter} orders`}
              </div>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? 'You haven\'t received any orders yet'
                  : `You don't have any ${filter} orders at the moment`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const nextStatus = getNextStatus(order.status);
                
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Placed on {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(order.total_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={order.product_img}
                              alt={order.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Info */}
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {order.product_name}
                            </h4>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Quantity: {order.quantity}</span>
                              <span>Price: {formatPrice(order.price)}</span>
                              {order.discount > 0 && (
                                <span className="text-green-600">
                                  {order.discount}% discount applied
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Customer:</span> {order.buyer_username}
                            </div>
                          </div>
                        </div>

                        {/* Status Update Button */}
                        {nextStatus && (
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleStatusUpdate(order.id, nextStatus)}
                              disabled={updatingStatus === order.id}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                nextStatus === 'confirmed'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : nextStatus === 'shipped'
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              } disabled:opacity-50`}
                            >
                              {updatingStatus === order.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                `Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">Order Placed</span>
                          <span className="text-gray-400">{formatDate(order.created_at)}</span>
                        </div>
                        
                        {order.status !== 'Pending' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Confirmed</span>
                            <span className="text-gray-400">{formatDate(order.updated_at)}</span>
                          </div>
                        )}
                        
                        {['Shipped', 'Delivered'].includes(order.status) && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-600">Shipped</span>
                          </div>
                        )}
                        
                        {order.status === 'Delivered' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Delivered</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
