import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import SellerDashboard from '../components/dashboard/SellerDashboard';
import BuyerDashboard from '../components/dashboard/BuyerDashboard';

const Dashboard = () => {
  const { user, isAdmin, isSeller, isBuyer } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.username}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your {user.role.toLowerCase()} account today.
            </p>
          </div>

          {isAdmin && <AdminDashboard />}
          {isSeller && <SellerDashboard />}
          {isBuyer && <BuyerDashboard />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
