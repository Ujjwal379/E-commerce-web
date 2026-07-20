import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Loader from '../../components/Loader';
import SEO from '../../components/SEO';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/admin/dashboard')
      .then(({ data }) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  const cards = [
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Total Customers', value: stats.totalUsers },
    { label: 'Total Orders', value: stats.totalOrders },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue) },
    { label: 'Low Stock Items', value: stats.lowStockCount, warn: stats.lowStockCount > 0 },
  ];

  return (
    <div>
      <SEO title="Admin Dashboard" />
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`card p-4 ${c.warn ? 'border-red-300 bg-red-50' : ''}`}>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.warn ? 'text-red-600' : ''}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {stats.lowStockCount > 0 && (
        <div className="card p-4 mb-8 border-red-200 bg-red-50 flex items-center justify-between">
          <p className="text-sm text-red-700">{stats.lowStockCount} product(s) are running low on stock.</p>
          <Link to="/admin/inventory" className="text-sm font-medium text-red-700 underline">
            Review inventory
          </Link>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Order #</th>
              <th className="pb-2">Customer</th>
              <th className="pb-2">Status</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o._id} className="border-b last:border-0">
                <td className="py-2">
                  <Link to="/admin/orders" className="text-brand-600">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="py-2">{o.user?.name}</td>
                <td className="py-2 capitalize">{o.status.replace(/_/g, ' ')}</td>
                <td className="py-2 text-right">{formatPrice(o.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
