import { useEffect, useState } from 'react';
import client from '../../api/client';
import Loader from '../../components/Loader';
import SEO from '../../components/SEO';
import toast from 'react-hot-toast';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [trackingEdits, setTrackingEdits] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/orders', { params: filter ? { status: filter } : {} });
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await client.put(`/orders/${id}/status`, { status, trackingNumber: trackingEdits[id] });
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order');
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <SEO title="Manage Orders" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o._id} className="card p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {o.user?.name} ({o.user?.email}) · {new Date(o.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(o.totalPrice)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <select
                defaultValue={o.status}
                onChange={(e) => (o._pendingStatus = e.target.value)}
                onBlur={(e) => updateStatus(o._id, e.target.value)}
                className="input w-auto py-1 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <input
                placeholder="Tracking number"
                defaultValue={o.trackingNumber}
                onChange={(e) => setTrackingEdits((prev) => ({ ...prev, [o._id]: e.target.value }))}
                className="input w-auto py-1 text-sm"
              />
              <button
                onClick={() => updateStatus(o._id, o._pendingStatus || o.status)}
                className="btn-outline py-1 px-3 text-xs"
              >
                Save
              </button>
              <span className={`badge ${o.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {o.isPaid ? 'Paid' : 'Unpaid'} · {o.paymentMethod}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
