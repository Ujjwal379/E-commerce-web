import { useState } from 'react';
import client from '../api/client';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await client.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-16 max-w-md">
      <SEO title="Forgot Password" />
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      {sent ? (
        <p className="text-gray-600">
          If an account exists with that email, we've sent a password reset link. Please check your inbox.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" />
          </div>
          <button disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
