import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BedGrid from '../../components/ui/BedGrid';

const API = '/api';

export default function SuperintendentBedMap() {
  const { user } = useAuth();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHostel = useCallback(async () => {
    if (!user?.hostelId) return;
    try {
      const res = await fetch(`${API}/hostels/${user.hostelId}`);
      const data = await res.json();
      setHostel(data);
    } catch (err) {
      console.error('Failed to load hostel:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.hostelId]);

  useEffect(() => { fetchHostel(); }, [fetchHostel]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!hostel) return <p className="text-gray-500">Could not load hostel.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bed Map</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live view of all rooms and beds for {hostel.name}.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <BedGrid rooms={hostel.rooms || []} />
      </div>
    </div>
  );
}
