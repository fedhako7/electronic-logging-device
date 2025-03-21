import { useState } from 'react';
import axiosInstance from '../api/api';

export default function TripForm({ onSubmit }) {
  const [form, setForm] = useState({ current: '', pickup: '', dropoff: '', cycle: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cycleNum = parseFloat(form.cycle);
    if (!form.current || !form.pickup || !form.dropoff || form.cycle === '' || isNaN(cycleNum) || cycleNum < 0) {
      setError("All fields are required, and cycle hours must be a non-negative number.");
      return;
    }
    setLoading(true);
    setError(null);
    console.log('Sending:', {
      current_location: form.current,
      pickup_location: form.pickup,
      dropoff_location: form.dropoff,
      cycle_hours: form.cycle,
    });
    try {
      const res = await axiosInstance.post('trips/', {
        current_location: form.current,
        pickup_location: form.pickup,
        dropoff_location: form.dropoff,
        cycle_hours: form.cycle,
      });
      onSubmit(res.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || "Something went wrong";
      setError(errorMsg);
      console.log('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-20 bg-gray-300 p-6 rounded-lg shadow-lg">
      {error && <p className="text-red-600">{error}</p>}
      <div>
        <input
          value={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.value })}
          placeholder="Current Location"
          className="w-full p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <div>
        <input
          value={form.pickup}
          onChange={(e) => setForm({ ...form, pickup: e.target.value })}
          placeholder="Pickup Location"
          className="w-full p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <div>
        <input
          value={form.dropoff}
          onChange={(e) => setForm({ ...form, dropoff: e.target.value })}
          placeholder="Dropoff Location"
          className="w-full p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <div>
        <input
          value={form.cycle}
          onChange={(e) => setForm({ ...form, cycle: e.target.value })}
          placeholder="Cycle Hours"
          type="number"
          className="w-full p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="w-full p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Calculate Route'}
      </button>
    </form>
  );
}
