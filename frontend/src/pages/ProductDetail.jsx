import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data } = await client.get(`/products/${slug}`);
      setProduct(data.product);
      const relRes = await client.get(`/products/${data.product._id}/related`);
      setRelated(relRes.data.products);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review');
      return;
    }
    setSubmittingReview(true);
    try {
      await client.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      loadProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader full />;
  if (!product)
    return (
      <div className="container-x py-20 text-center">
        <p className="text-lg font-medium">Product not found.</p>
        <Link to="/products" className="text-brand-600 mt-2 inline-block">
          Back to shop
        </Link>
      </div>
    );

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="container-x py-8">
      <SEO title={product.seoTitle || product.name} description={product.seoDescription || product.shortDescription} image={product.images?.[0]?.url} />

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={product.images?.[activeImage]?.url || 'https://placehold.co/600x600?text=Product'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${
                    activeImage === idx ? 'border-brand-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
            <FiStar className="text-yellow-400 fill-current" />
            <span>{product.rating?.toFixed?.(1) || '0.0'}</span>
            <span>({product.numReviews || 0} reviews)</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(displayPrice)}</span>
            {hasDiscount && <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>}
          </div>

          <p className="mt-4 text-gray-600">{product.shortDescription || product.description}</p>

          <p className={`mt-4 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">
                −
              </button>
              <span className="px-4">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2">
                +
              </button>
            </div>
            <button
              disabled={product.stock === 0}
              onClick={() => addToCart(product._id, qty)}
              className="btn-primary flex-1"
            >
              <FiShoppingCart className="mr-2" /> Add to Cart
            </button>
            <button
              onClick={async () => {
                if (!user) return toast.error('Please log in to use your wishlist');
                await client.post(`/users/wishlist/${product._id}`);
                toast.success('Wishlist updated');
              }}
              className="btn-outline"
              aria-label="Add to wishlist"
            >
              <FiHeart />
            </button>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-14 max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
        {product.reviews?.length === 0 && <p className="text-gray-500 mb-6">No reviews yet. Be the first!</p>}
        <div className="space-y-4 mb-8">
          {product.reviews?.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.name}</p>
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  <FiStar className="fill-current" /> {r.rating}
                </div>
              </div>
              <p className="text-gray-600 mt-1 text-sm">{r.comment}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submitReview} className="card p-4 space-y-3">
          <h3 className="font-medium">Write a review</h3>
          <select
            value={reviewForm.rating}
            onChange={(e) => setReviewForm((f) => ({ ...f, rating: e.target.value }))}
            className="input w-auto"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} Star{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <textarea
            required
            value={reviewForm.comment}
            onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            placeholder="Share your experience with this product..."
            className="input min-h-[90px]"
          />
          <button disabled={submittingReview} className="btn-primary">
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
