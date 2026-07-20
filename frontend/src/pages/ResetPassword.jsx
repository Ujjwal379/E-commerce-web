import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await client.put(`/auth/reset-password/${resetToken}`, { password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Password reset successfully!');
      navigate('/');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed, link may be expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-16 max-w-md">
      <SEO title="Reset Password" />
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">New Password</label>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1"
          />
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
