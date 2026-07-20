import { useEffect, useState } from 'react';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/users/wishlist');
      setItems(data.wishlist);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader full />;

  return (
    <div className="container-x py-8">
      <SEO title="My Wishlist" />
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Your wishlist is empty.</p>
          <Link to="/products" className="text-brand-600 mt-2 inline-block">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} wishlistIds={items.map((i) => i._id)} onWishlistChange={load} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
