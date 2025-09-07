import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI, ordersAPI } from '../../api';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const BuyerDashboard = () => {
  const [stats, setStats] = useState({
    cartItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [cart, orders] = await Promise.all([
        cartAPI.getCart(),
        ordersAPI.getBuyerOrders(),
      ]);

      const pendingOrders = orders.filter(order => 
        ['Pending', 'Confirmed', 'Shipped'].includes(order.status)
      ).length;

      setStats({
        cartItems: cart.length,
        totalOrders: orders.length,
        pendingOrders,
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  const quickActions = [
    {
      title: 'Browse Deals',
      description: 'Discover amazing flash deals',
      link: '/products',
      icon: '🛍️',
      color: 'bg-blue-500',
    },
    {
      title: 'View Cart',
      description: 'Review items in your cart',
      link: '/cart',
      icon: '🛒',
      color: 'bg-green-500',
    },
    {
      title: 'Order History',
      description: 'Track your past and current orders',
      link: '/orders',
      icon: '📋',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🛒</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cart Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.cartItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📋</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white text-xl">{action.icon}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Flash Deal Tips */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Flash Deal Tips
          </h3>
          <div className="text-sm text-gray-500 space-y-2">
            <p>• Flash deals have limited time offers - act fast!</p>
            <p>• Check the countdown timer to see how much time is left</p>
            <p>• Limited stock items sell out quickly</p>
            <p>• Add items to cart to secure your deal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
