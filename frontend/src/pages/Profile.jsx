import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';

const emptyAddress = { label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' };

const Profile = () => {
  const { user, updateUserLocal } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await client.put('/users/profile', profileForm);
      updateUserLocal(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const { data } = await client.post('/users/addresses', newAddress);
      setAddresses(data.addresses);
      setNewAddress(emptyAddress);
      toast.success('Address added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const removeAddress = async (id) => {
    const { data } = await client.delete(`/users/addresses/${id}`);
    setAddresses(data.addresses);
    toast.success('Address removed');
  };

  return (
    <div className="container-x py-8 max-w-3xl">
      <SEO title="My Profile" />
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="card p-6 mb-8">
        <h2 className="font-semibold mb-4">Personal Information</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              value={profileForm.name}
              onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={user?.email} disabled className="input mt-1 bg-gray-100" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
              className="input mt-1"
            />
          </div>
          <button disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Shipping Addresses</h2>

        <div className="space-y-3 mb-6">
          {addresses.map((a) => (
            <div key={a._id} className="border rounded-lg p-3 flex justify-between items-start">
              <div className="text-sm">
                <p className="font-medium">
                  {a.label} {a.isDefault && <span className="badge bg-brand-50 text-brand-700 ml-1">Default</span>}
                </p>
                <p className="text-gray-600">
                  {a.fullName}, {a.phone}
                </p>
                <p className="text-gray-600">
                  {a.line1}, {a.line2 ? `${a.line2}, ` : ''}
                  {a.city}, {a.state} {a.postalCode}, {a.country}
                </p>
              </div>
              <button onClick={() => removeAddress(a._id)} className="text-red-500">
                <FiTrash2 />
              </button>
            </div>
          ))}
          {addresses.length === 0 && <p className="text-sm text-gray-500">No saved addresses yet.</p>}
        </div>

        <form onSubmit={addAddress} className="grid sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="Full Name"
            value={newAddress.fullName}
            onChange={(e) => setNewAddress((f) => ({ ...f, fullName: e.target.value }))}
            className="input"
          />
          <input
            required
            placeholder="Phone"
            value={newAddress.phone}
            onChange={(e) => setNewAddress((f) => ({ ...f, phone: e.target.value }))}
            className="input"
          />
          <input
            required
            placeholder="Address Line 1"
            value={newAddress.line1}
            onChange={(e) => setNewAddress((f) => ({ ...f, line1: e.target.value }))}
            className="input sm:col-span-2"
          />
          <input
            placeholder="Address Line 2 (optional)"
            value={newAddress.line2}
            onChange={(e) => setNewAddress((f) => ({ ...f, line2: e.target.value }))}
            className="input sm:col-span-2"
          />
          <input
            required
            placeholder="City"
            value={newAddress.city}
            onChange={(e) => setNewAddress((f) => ({ ...f, city: e.target.value }))}
            className="input"
          />
          <input
            required
            placeholder="State"
            value={newAddress.state}
            onChange={(e) => setNewAddress((f) => ({ ...f, state: e.target.value }))}
            className="input"
          />
          <input
            required
            placeholder="Postal Code"
            value={newAddress.postalCode}
            onChange={(e) => setNewAddress((f) => ({ ...f, postalCode: e.target.value }))}
            className="input"
          />
          <input
            required
            placeholder="Country"
            value={newAddress.country}
            onChange={(e) => setNewAddress((f) => ({ ...f, country: e.target.value }))}
            className="input"
          />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={newAddress.isDefault || false}
              onChange={(e) => setNewAddress((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            Set as default address
          </label>
          <button disabled={savingAddress} className="btn-primary sm:col-span-2">
            {savingAddress ? 'Adding...' : 'Add Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
