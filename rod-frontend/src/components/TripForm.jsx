import { useState, useRef } from 'react';
import axiosInstance from '../api/api';
import ClipLoader from "react-spinners/ClipLoader";

export default function TripForm({ onSubmit }) {
  const [form, setForm] = useState({ current: '', pickup: '', dropoff: '', cycle: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cycleErrorDetails, setCycleErrorDetails] = useState(null);
  const cycleInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cycleNum = parseFloat(form.cycle);
    if (!form.current || !form.pickup || !form.dropoff || form.cycle === '' || isNaN(cycleNum) || cycleNum < 0) {
      setError("All fields are required, and cycle hours must be a non-negative number.");
      setCycleErrorDetails(null);
      return;
    }
    setLoading(true);
    setError(null);
    setCycleErrorDetails(null);
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
      const errorData = error.response?.data;
      if (errorData?.error === 'Insufficient cycle hours' && errorData?.details) {
        setCycleErrorDetails(errorData.details);
      } else {
        setError(errorData?.error || error.message || "Something went wrong");
      }
      console.log('Error details:', errorData);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    setForm({ ...form, cycle: '' }); 
    setCycleErrorDetails(null); 
    cycleInputRef.current.focus(); 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-20 bg-gray-300 p-6 rounded-lg shadow-lg">
      {/* General Error Message */}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>
      )}
      {/* Cycle Hours Error with Details */}
      {cycleErrorDetails && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md text-gray-800">
          <h3 className="text-lg font-semibold text-yellow-700">Cycle Hours Exhausted</h3>
          <p className="mt-1">{cycleErrorDetails.message}</p>
          <div className="mt-3 space-y-2">
            <p>
              <span className="font-medium">Required Hours:</span>{' '}
              {cycleErrorDetails.required_hours.toFixed(1)} hrs
            </p>
            <p>
              <span className="font-medium">Available Cycle Hours:</span>{' '}
              {cycleErrorDetails.available_cycle.toFixed(1)} hrs
            </p>
          </div>
          <button
            type="button"
            onClick={handleOk}
            className="mt-4 w-full p-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            OK
          </button>
        </div>
      )}
      {/* Form Fields */}
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
          ref={cycleInputRef}
          value={form.cycle}
          onChange={(e) => setForm({ ...form, cycle: e.target.value })}
          placeholder="Cycle Hours"
          type="number"
          step="0.1"
          className="w-full p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-1 w-full p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? <> <ClipLoader speedMultiplier={0.5} size={20} color='white' /> Please wait... </>: 'Calculate Route'}
      </button>
    </form>
  );
}
