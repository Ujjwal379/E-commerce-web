import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import SEO from '../components/SEO';
import { FiCheckCircle } from 'react-icons/fi';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader full />;

  return (
    <div className="container-x py-16 text-center max-w-lg mx-auto">
      <SEO title="Order Confirmed" />
      <FiCheckCircle className="mx-auto text-green-500" size={64} />
      <h1 className="text-2xl font-bold mt-4">Thank you for your order!</h1>
      <p className="text-gray-600 mt-2">
        Your order <span className="font-medium">{order?.orderNumber}</span> has been placed successfully.
      </p>
      <div className="flex justify-center gap-4 mt-6">
        <Link to={`/orders/${id}`} className="btn-primary">
          Track Order
        </Link>
        <Link to="/products" className="btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
