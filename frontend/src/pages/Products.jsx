import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import SEO from '../components/SEO';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page')) || 1;

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const fetchCategories = useCallback(async () => {
    const { data } = await client.get('/categories');
    setCategories(data.categories);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { keyword, category, sort, minPrice, maxPrice, page, limit: 12 };
      if (searchParams.get('featured')) params.featured = 'true';
      const { data } = await client.get('/products', { params });
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, minPrice, maxPrice, page, searchParams]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="container-x py-8">
      <SEO title="Shop All Products" description="Browse our full catalog of electronics, fashion and lifestyle products." />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Category</h3>
            <div className="space-y-1 text-sm">
              <button
                onClick={() => updateParam('category', '')}
                className={`block w-full text-left px-2 py-1 rounded ${!category ? 'bg-brand-50 text-brand-700' : ''}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => updateParam('category', c._id)}
                  className={`block w-full text-left px-2 py-1 rounded ${
                    category === c._id ? 'bg-brand-50 text-brand-700' : ''
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Price Range</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={(e) => updateParam('minPrice', e.target.value)}
                className="input text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={(e) => updateParam('maxPrice', e.target.value)}
                className="input text-sm"
              />
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-sm text-gray-500">
              {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
              {keyword && <> for "<span className="font-medium">{keyword}</span>"</>}
            </p>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="input w-auto text-sm">
              <option value="">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <p className="text-gray-500 py-16 text-center">No products match your filters.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParam('page', String(p))}
                      className={`h-9 w-9 rounded-lg text-sm ${
                        p === pagination.page ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200'
                      }`}
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
    </div>
  );
};

export default Products;
