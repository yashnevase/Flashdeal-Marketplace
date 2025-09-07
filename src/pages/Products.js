import React, { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, cartAPI } from '../api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { debounce } from '../utils/helpers';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search_term: '',
    category_id: '',
    page: 0,
    limit: 12,
  });
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setFilters(prev => ({ ...prev, page: 0 }));
      fetchProducts(true);
    }, 500);

    debouncedSearch();
  }, [filters.search_term, filters.category_id]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async (reset = false) => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts(filters);
      
      if (reset) {
        setProducts(response);
      } else {
        setProducts(prev => [...prev, ...response]);
      }
      
      setHasMore(response.length === filters.limit);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Products fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0,
    }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      page: prev.page + 1,
    }));
    fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    try {
      await cartAPI.updateCart({ product_id: productId, quantity: 1 });
      toast.success('Product added to cart!');
    } catch (error) {
      toast.error('Failed to add product to cart');
      console.error('Add to cart error:', error);
    }
  };

  const handleViewDetails = (product) => {
    // For now, just show a toast. In a real app, you'd navigate to a product detail page
    // toast.success(`Viewing details for ${product.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Flash Deals</h1>
            <p className="mt-2 text-gray-600">
              Discover amazing deals with limited time offers
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <input
                  type="text"
                  id="search"
                  value={filters.search_term}
                  onChange={(e) => handleFilterChange('search_term', e.target.value)}
                  placeholder="Search by product name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <div className="text-sm text-gray-500">
                  Showing {products.length} products
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading && products.length === 0 ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No products found</div>
                  <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                      >
                        {loading ? <LoadingSpinner size="sm" /> : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
