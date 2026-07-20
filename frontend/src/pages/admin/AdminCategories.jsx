import { useEffect, useState } from 'react';
import client from '../../api/client';
import Loader from '../../components/Loader';
import SEO from '../../components/SEO';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const emptyForm = { name: '', description: '', isActive: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/categories?includeInactive=true');
      setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await client.put(`/categories/${editingId}`, form);
        toast.success('Category updated');
      } else {
        await client.post('/categories', form);
        toast.success('Category created');
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category');
    } finally {
      setSaving(false);
    }
  };

  const edit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description, isActive: cat.isActive });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category? This cannot be undone.')) return;
    try {
      await client.delete(`/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete category');
    }
  };

  return (
    <div>
      <SEO title="Manage Categories" />
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 md:col-span-1 h-fit">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit Category' : 'Add Category'}</h2>
          <form onSubmit={submit} className="space-y-3">
            <input
              required
              placeholder="Category name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active
            </label>
            <div className="flex gap-2">
              <button disabled={saving} className="btn-primary flex-1">
                <FiPlus className="mr-1" /> {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card p-6 md:col-span-2">
          <h2 className="font-semibold mb-4">All Categories</h2>
          {loading ? (
            <Loader />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id} className="border-b last:border-0">
                    <td className="py-2">{c.name}</td>
                    <td className="py-2">
                      <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 text-right space-x-3">
                      <button onClick={() => edit(c)} className="text-brand-600">
                        <FiEdit2 className="inline" />
                      </button>
                      <button onClick={() => remove(c._id)} className="text-red-500">
                        <FiTrash2 className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
