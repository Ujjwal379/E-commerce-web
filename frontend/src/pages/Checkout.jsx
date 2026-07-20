import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import client from '../api/client';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const emptyAddress = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' };

// Loads the Razorpay checkout script on demand
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { user } = useAuth();
  const { cart, subtotal, fetchCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.addresses?.find((a) => a.isDefault) || emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);

  const shippingEstimate = subtotal > 999 ? 0 : 99;
  const taxEstimate = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + shippingEstimate + taxEstimate;

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const { data } = await client.post('/orders', { shippingAddress: address, paymentMethod });
      const order = data.order;

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        await fetchCart();
        navigate(`/order-success/${order._id}`);
        return;
      }

      if (paymentMethod === 'stripe') {
        const { data: sessionData } = await client.post(`/orders/${order._id}/stripe-session`);
        window.location.href = sessionData.url;
        return;
      }

      if (paymentMethod === 'razorpay') {
        const ok = await loadRazorpayScript();
        if (!ok) {
          toast.error('Could not load Razorpay checkout. Please try again.');
          return;
        }
        const { data: rpData } = await client.post(`/orders/${order._id}/razorpay-order`);
        const options = {
          key: rpData.keyId,
          amount: rpData.razorpayOrder.amount,
          currency: 'INR',
          name: 'ShopEase',
          description: `Order ${order.orderNumber}`,
          order_id: rpData.razorpayOrder.id,
          handler: async (response) => {
            try {
              await client.post(`/orders/${order._id}/razorpay-verify`, response);
              toast.success('Payment successful!');
              await fetchCart();
              navigate(`/order-success/${order._id}`);
            } catch {
              toast.error('Payment verification failed');
            }
          },
          prefill: { name: address.fullName, contact: address.phone, email: user?.email },
          theme: { color: '#ea580c' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <p className="text-lg font-medium">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <SEO title="Checkout" />
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={placeOrder} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Full Name" value={address.fullName} onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))} className="input" />
              <input required placeholder="Phone" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} className="input" />
              <input required placeholder="Address Line 1" value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} className="input sm:col-span-2" />
              <input placeholder="Address Line 2" value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} className="input sm:col-span-2" />
              <input required placeholder="City" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} className="input" />
              <input required placeholder="State" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} className="input" />
              <input required placeholder="Postal Code" value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} className="input" />
              <input required placeholder="Country" value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} className="input" />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-4">Payment Method</h2>
            <div className="space-y-2">
              {[
                { id: 'razorpay', label: 'Razorpay (Cards, UPI, Netbanking)' },
                { id: 'stripe', label: 'Stripe (Credit/Debit Card)' },
                { id: 'cod', label: 'Cash on Delivery' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item._id} className="flex justify-between text-sm mb-2">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <hr className="my-3" />
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Shipping</span>
            <span>{shippingEstimate === 0 ? 'Free' : formatPrice(shippingEstimate)}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span>Tax (18%)</span>
            <span>{formatPrice(taxEstimate)}</span>
          </div>
          <hr className="mb-3" />
          <div className="flex justify-between font-bold mb-4">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button disabled={placing} className="btn-primary w-full">
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
