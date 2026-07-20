import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import { FiTrash2 } from 'react-icons/fi';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const Cart = () => {
  const { cart, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <SEO title="Your Cart" />
        <p className="text-lg font-medium">Your cart is empty.</p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <SEO title="Your Cart" />
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4 items-center">
              <img src={item.image || 'https://placehold.co/100'} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit mt-2">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-1">
                    −
                  </button>
                  <span className="px-3">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-1">
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item._id)} className="text-red-500 mt-2" aria-label="Remove item">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Shipping and taxes calculated at checkout.</p>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
