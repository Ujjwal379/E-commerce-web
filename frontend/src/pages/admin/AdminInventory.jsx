import { useEffect, useState } from 'react';
import client from '../../api/client';
import Loader from '../../components/Loader';
import SEO from '../../components/SEO';
import toast from 'react-hot-toast';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [allRes, lowRes] = await Promise.all([
        client.get('/products', { params: { limit: 100 } }),
        client.get('/products/admin/low-stock'),
      ]);
      setProducts(allRes.data.products);
      setLowStock(lowRes.data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveStock = async (id) => {
    const stock = edits[id];
    if (stock === undefined) return;
    try {
      await client.put(`/products/${id}/inventory`, { stock: Number(stock) });
      toast.success('Stock updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update stock');
    }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <SEO title="Inventory Management" />
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      {lowStock.length > 0 && (
        <div className="card p-4 mb-6 border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700 mb-2">Low Stock Alerts ({lowStock.length})</p>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {lowStock.map((p) => (
              <li key={p._id}>
                {p.name} — only {p.stock} left (threshold: {p.lowStockThreshold})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Product</th>
              <th className="pb-2">SKU</th>
              <th className="pb-2">Current Stock</th>
              <th className="pb-2">Update Stock</th>
              <th className="pb-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b last:border-0">
                <td className="py-2">{p.name}</td>
                <td className="py-2">{p.sku || '—'}</td>
                <td className={`py-2 font-medium ${p.stock <= p.lowStockThreshold ? 'text-red-600' : ''}`}>{p.stock}</td>
                <td className="py-2">
                  <input
                    type="number"
                    min="0"
                    placeholder={p.stock}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [p._id]: e.target.value }))}
                    className="input w-24 py-1"
                  />
                </td>
                <td className="py-2 text-right">
                  <button onClick={() => saveStock(p._id)} className="btn-outline py-1 px-3 text-xs">
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInventory;
