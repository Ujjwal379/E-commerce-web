import { NavLink, Outlet } from 'react-router-dom';
import { FiGrid, FiBox, FiTag, FiPackage, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';

const links = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/inventory', label: 'Inventory', icon: FiPackage },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
];

const AdminLayout = () => (
  <div className="flex min-h-[calc(100vh-64px)]">
    <aside className="w-56 bg-gray-900 text-gray-300 shrink-0 p-4 hidden md:block">
      <p className="text-white font-bold text-lg mb-6 px-2">Admin Panel</p>
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                isActive ? 'bg-brand-600 text-white' : 'hover:bg-gray-800'
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
        <NavLink to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-800 mt-6">
          <FiArrowLeft size={16} /> Back to Store
        </NavLink>
      </nav>
    </aside>
    <main className="flex-1 bg-gray-50 p-6 overflow-x-auto">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
