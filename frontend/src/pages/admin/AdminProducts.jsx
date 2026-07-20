import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Loader from '../../components/Loader';
import SEO from '../../components/SEO';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/products', { params: { page, limit: 15 } });
      setProducts(data.products);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const remove = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await client.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete product');
    }
  };

  return (
    <div>
      <SEO title="Manage Products" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Link to="/admin/products/new" className="btn-primary">
          <FiPlus className="mr-1" /> Add Product
        </Link>
      </div>

      <div className="card p-6">
        {loading ? (
          <Loader />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">SKU</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Stock</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b last:border-0">
                    <td className="py-2 flex items-center gap-2">
                      <img src={p.images?.[0]?.url || 'https://placehold.co/40'} alt={p.name} className="h-8 w-8 rounded object-cover" />
                      {p.name}
                    </td>
                    <td className="py-2">{p.sku || '—'}</td>
                    <td className="py-2">{formatPrice(p.discountPrice > 0 ? p.discountPrice : p.price)}</td>
                    <td className="py-2">{p.stock}</td>
                    <td className="py-2">
                      <span className={`badge ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 text-right space-x-3">
                      <Link to={`/admin/products/${p._id}/edit`} className="text-brand-600">
                        <FiEdit2 className="inline" />
                      </Link>
                      <button onClick={() => remove(p._id)} className="text-red-500">
                        <FiTrash2 className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-sm ${p === page ? 'bg-brand-600 text-white' : 'bg-white border'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
