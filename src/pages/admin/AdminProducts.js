import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPrice, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getPendingProducts();
      setPendingProducts(response);
    } catch (error) {
      toast.error('Failed to fetch pending products');
      console.error('Pending products fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      setActionLoading(productId);
      await productsAPI.approveProduct(productId);
      setPendingProducts(prev => prev.filter(product => product.id !== productId));
      toast.success('Product approved successfully');
    } catch (error) {
      toast.error('Failed to approve product');
      console.error('Approve product error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (productId) => {
    if (!window.confirm('Are you sure you want to reject this product?')) {
      return;
    }

    try {
      setActionLoading(productId);
      await productsAPI.rejectProduct(productId);
      setPendingProducts(prev => prev.filter(product => product.id !== productId));
      toast.success('Product rejected successfully');
    } catch (error) {
      toast.error('Failed to reject product');
      console.error('Reject product error:', error);
    } finally {
      setActionLoading(null);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Product Approval</h1>
            <p className="mt-2 text-gray-600">
              Review and approve pending products from sellers
            </p>
          </div>

          {pendingProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No pending products</div>
              <p className="text-gray-400">All products have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <div className="flex items-start space-x-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={product.product_img}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/128x128?text=No+Image';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 mb-4">{product.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-500">Price:</span>
                                <span className="ml-2 text-gray-900">{formatPrice(product.price)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Discount:</span>
                                <span className="ml-2 text-gray-900">{product.discount}%</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Stock:</span>
                                <span className="ml-2 text-gray-900">{product.stock}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Expires:</span>
                                <span className="ml-2 text-gray-900">{formatDate(product.deal_expiry)}</span>
                              </div>
                            </div>

                            <div className="mt-4 text-sm text-gray-500">
                              <p><span className="font-medium">Seller:</span> {product.seller_username}</p>
                              <p><span className="font-medium">Submitted:</span> {formatDate(product.created_at)}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-3">
                            <button
                              onClick={() => handleApprove(product.id)}
                              disabled={actionLoading === product.id}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                              {actionLoading === product.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                'Approve'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
