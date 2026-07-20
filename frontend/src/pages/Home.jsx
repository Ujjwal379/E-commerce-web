import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import SEO from '../components/SEO';
import { FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          client.get('/products?featured=true&limit=8'),
          client.get('/categories'),
        ]);
        setFeatured(prodRes.data.products);
        setCategories(catRes.data.categories);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <SEO
        title="Home"
        description="Shop the latest electronics, fashion and lifestyle products at ShopEase. Fast shipping, secure checkout, easy returns."
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white overflow-hidden">
        <div className="container-x py-20 md:py-28 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="badge bg-white/20 mb-4">New Season Arrivals</span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Everything You Need, <br /> Delivered To Your Door
            </h1>
            <p className="mt-4 text-brand-100 text-lg max-w-md">
              Discover top-quality electronics, fashion and lifestyle products at unbeatable prices — with fast,
              reliable shipping.
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/products" className="btn bg-white text-brand-700 hover:bg-brand-50">
                Shop Now
              </Link>
              <Link to="/products?featured=true" className="btn border border-white/60 text-white hover:bg-white/10">
                View Deals
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="https://placehold.co/560x420?text=Shop+the+Collection"
              alt="Featured products collection"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="container-x py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <FiTruck className="text-brand-600" size={28} />
          <div>
            <p className="font-semibold">Free Shipping</p>
            <p className="text-sm text-gray-500">On orders over ₹999</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FiShield className="text-brand-600" size={28} />
          <div>
            <p className="font-semibold">Secure Payments</p>
            <p className="text-sm text-gray-500">Stripe & Razorpay protected</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FiRefreshCw className="text-brand-600" size={28} />
          <div>
            <p className="font-semibold">Easy Returns</p>
            <p className="text-sm text-gray-500">7-day return policy</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-x py-10">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="card p-6 text-center hover:shadow-md transition-shadow"
              >
                <p className="font-medium">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container-x py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-brand-600 font-medium text-sm">
            View all →
          </Link>
        </div>
        {loading ? (
          <Loader />
        ) : featured.length === 0 ? (
          <p className="text-gray-500">No featured products yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
