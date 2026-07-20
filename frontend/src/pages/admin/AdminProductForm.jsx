import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import Loader from '../../components/Loader';
import SEO from '../../components/SEO';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  description: '',
  shortDescription: '',
  brand: '',
  category: '',
  price: '',
  discountPrice: '',
  stock: '',
  sku: '',
  imageUrl: '',
  tags: '',
  isFeatured: false,
  isActive: true,
};

const AdminProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.get('/categories?includeInactive=true').then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    client.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      setForm({
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription || '',
        brand: p.brand,
        category: p.category?._id || p.category,
        price: p.price,
        discountPrice: p.discountPrice || '',
        stock: p.stock,
        sku: p.sku || '',
        imageUrl: p.images?.[0]?.url || '',
        tags: (p.tags || []).join(', '),
        isFeatured: p.isFeatured,
        isActive: p.isActive,
      });
      setLoading(false);
    });
  }, [id, isEdit]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      shortDescription: form.shortDescription,
      brand: form.brand,
      category: form.category,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
      stock: Number(form.stock),
      sku: form.sku || undefined,
      images: form.imageUrl ? [{ url: form.imageUrl, alt: form.name }] : [],
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };

    try {
      if (isEdit) {
        await client.put(`/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await client.post('/products', payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader full />;

  return (
    <div className="max-w-2xl">
      <SEO title={isEdit ? 'Edit Product' : 'Add Product'} />
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <form onSubmit={submit} className="card p-6 space-y-4">
        <input required placeholder="Product Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
        <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input min-h-[100px]" />
        <input placeholder="Short description (for cards/SEO)" value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} className="input" />

        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="input" />
          <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input required type="number" min="0" step="0.01" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input" />
          <input type="number" min="0" step="0.01" placeholder="Discount Price (₹)" value={form.discountPrice} onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} className="input" />
          <input required type="number" min="0" placeholder="Stock" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="input" />
        </div>

        <input placeholder="SKU (optional)" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="input" />
        <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className="input" />
        <input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="input" />

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
        </div>

        <button disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
