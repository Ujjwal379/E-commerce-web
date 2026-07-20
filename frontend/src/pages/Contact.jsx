import { useState } from 'react';
import client from '../api/client';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await client.post('/contact', form);
      toast.success(data.message);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-12">
      <SEO title="Contact Us" description="Get in touch with the ShopEase support team." />
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiMail className="text-brand-600" />
            <span>support@shopease.example</span>
          </div>
          <div className="flex items-center gap-3">
            <FiPhone className="text-brand-600" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-3">
            <FiMapPin className="text-brand-600" />
            <span>123 Market Street, Lucknow, Uttar Pradesh, India</span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
          <input required type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input" />
          <input placeholder="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="input" />
          <textarea required placeholder="Your Message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="input min-h-[120px]" />
          <button disabled={loading} className="btn-primary">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
