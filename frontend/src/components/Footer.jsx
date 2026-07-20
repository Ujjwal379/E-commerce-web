import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-16">
    <div className="container-x py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="col-span-2 md:col-span-1">
        <h3 className="text-white text-xl font-bold mb-3">ShopEase</h3>
        <p className="text-sm text-gray-400">
          Your one-stop shop for electronics, fashion, and lifestyle products — delivered fast, priced fair.
        </p>
        <div className="flex gap-4 mt-4">
          <FiFacebook />
          <FiInstagram />
          <FiTwitter />
        </div>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Shop</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/products">All Products</Link></li>
          <li><Link to="/products?featured=true">Featured</Link></li>
          <li><Link to="/wishlist">Wishlist</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Account</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/profile">My Profile</Link></li>
          <li><Link to="/orders">Order Tracking</Link></li>
          <li><Link to="/login">Login / Register</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Support</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/contact">Contact Us</Link></li>
          <li><a href="#">Shipping Policy</a></li>
          <li><a href="#">Returns & Refunds</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
      © {new Date().getFullYear()} ShopEase. All rights reserved.
    </div>
  </footer>
);

export default Footer;
