import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import SEO from '../components/SEO';
import { FiCheckCircle, FiCircle } from 'react-icons/fi';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const STAGES = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const OrderTracking = () => {
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
  if (!order) return <div className="container-x py-16 text-center">Order not found.</div>;

  const currentStageIndex = STAGES.indexOf(order.status);

  return (
    <div className="container-x py-8 max-w-3xl">
      <SEO title={`Order ${order.orderNumber}`} />
      <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
      <p className="text-gray-500 text-sm mb-6">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Tracking Status</h2>
          <div className="flex items-center justify-between">
            {STAGES.map((stage, idx) => (
              <div key={stage} className="flex-1 flex flex-col items-center text-center relative">
                {idx > 0 && (
                  <div
                    className={`absolute top-3 right-1/2 w-full h-0.5 -z-10 ${
                      idx <= currentStageIndex ? 'bg-brand-600' : 'bg-gray-200'
                    }`}
                  />
                )}
                {idx <= currentStageIndex ? (
                  <FiCheckCircle className="text-brand-600 bg-white" size={26} />
                ) : (
                  <FiCircle className="text-gray-300 bg-white" size={26} />
                )}
                <p className="text-[11px] mt-1 capitalize">{stage.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="text-sm text-gray-600 mt-6">
              Tracking Number: <span className="font-medium">{order.trackingNumber}</span>
            </p>
          )}
        </div>
      )}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-3">Status History</h2>
        <ul className="space-y-2 text-sm">
          {order.statusHistory?.slice().reverse().map((h, idx) => (
            <li key={idx} className="flex justify-between border-b last:border-0 pb-2">
              <span className="capitalize">{h.status.replace(/_/g, ' ')} {h.note ? `— ${h.note}` : ''}</span>
              <span className="text-gray-400">{new Date(h.changedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-3">Items</h2>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm py-1">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <hr className="my-3" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.totalPrice)}</span>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Shipping Address</h2>
        <p className="text-sm text-gray-600">
          {order.shippingAddress.fullName}, {order.shippingAddress.phone}
          <br />
          {order.shippingAddress.line1}, {order.shippingAddress.line2 ? `${order.shippingAddress.line2}, ` : ''}
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode},{' '}
          {order.shippingAddress.country}
        </p>
      </div>
    </div>
  );
};

export default OrderTracking;
