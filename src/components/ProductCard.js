import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { formatPrice, calculateDiscountedPrice, isDealExpired } from '../utils/helpers';

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const { timeLeft, isExpired } = useCountdown(product.deal_expiry);
  const discountedPrice = calculateDiscountedPrice(
    parseFloat(product.price),
    parseFloat(product.discount)
  );

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isExpired && product.stock > 0) {
      onAddToCart(product.id);
    }
  };

  const handleCardClick = () => {
    onViewDetails(product);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={product.product_img}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        {isExpired && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">EXPIRED</span>
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && !isExpired && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            Only {product.stock} left!
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(discountedPrice)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        {!isExpired && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Deal ends in:</div>
            <div className="text-sm font-mono text-red-600 font-bold">
              {timeLeft}
            </div>
          </div>
        )}

        {/* Stock Info */}
        <div className="text-xs text-gray-500 mb-3">
          Stock: {product.stock} units
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isExpired || product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            isExpired || product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isExpired
            ? 'Deal Expired'
            : product.stock === 0
            ? 'Out of Stock'
            : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
