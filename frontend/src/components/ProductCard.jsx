import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import toast from 'react-hot-toast';
import { useState } from 'react';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const ProductCard = ({ product, wishlistIds = [], onWishlistChange }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wished, setWished] = useState(wishlistIds.includes(product._id));

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to use your wishlist');
      return;
    }
    try {
      const { data } = await client.post(`/users/wishlist/${product._id}`);
      setWished(data.added);
      onWishlistChange?.();
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="card group overflow-hidden flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images?.[0]?.url || 'https://placehold.co/400x400?text=Product'}
          alt={product.images?.[0]?.alt || product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="badge absolute top-2 left-2 bg-brand-600 text-white">{discountPct}% OFF</span>
        )}
        <button
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
          className={`absolute top-2 right-2 rounded-full p-2 shadow ${
            wished ? 'bg-brand-600 text-white' : 'bg-white text-gray-500'
          }`}
        >
          <FiHeart className={wished ? 'fill-current' : ''} />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-gray-500">{product.brand}</p>
        <h3 className="font-medium text-gray-900 line-clamp-2 mt-1">{product.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
          <FiStar className="text-yellow-400 fill-current" />
          <span>{product.rating?.toFixed?.(1) || '0.0'}</span>
          <span>({product.numReviews || 0})</span>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">{formatPrice(displayPrice)}</span>
            {hasDiscount && <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product._id, 1);
            }}
            disabled={product.stock === 0}
            aria-label="Add to cart"
            className="rounded-full bg-gray-900 text-white p-2.5 hover:bg-brand-600 disabled:opacity-40"
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
