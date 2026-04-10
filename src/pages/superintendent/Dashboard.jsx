import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BedDouble, Users, ClipboardList, CheckCircle2,
  Loader2, ArrowRight, Building2, GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = '/api';

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function SuperintendentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.hostelId) return;
    try {
      const [statsRes, reqRes] = await Promise.all([
        fetch(`${API}/superintendent/${user.hostelId}/stats`),
        fetch(`${API}/superintendent/${user.hostelId}/requests`),
      ]);
      setStats(await statsRes.json());
      const reqs = await reqRes.json();
      setRecentRequests(
        reqs
          .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
          .slice(0, 5)
      );
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.hostelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-6 w-6" />
          <p className="text-sm font-medium text-emerald-100">{user.hostelName}</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome, {user.name}</h1>
        <p className="text-sm text-emerald-100 mt-1">
          You are managing booking requests and residents for {user.hostelName}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BedDouble} label="Total Beds" value={stats?.totalBeds ?? 0} color="text-slate-600" bgColor="bg-slate-100" />
        <StatCard icon={CheckCircle2} label="Vacant Beds" value={stats?.vacantBeds ?? 0} color="text-emerald-600" bgColor="bg-emerald-100" />
        <StatCard icon={ClipboardList} label="Pending Requests" value={stats?.pendingRequests ?? 0} color="text-amber-600" bgColor="bg-amber-100" />
        <StatCard icon={Users} label="Approved Bookings" value={stats?.approvedBookings ?? 0} color="text-indigo-600" bgColor="bg-indigo-100" />
      </div>

      {/* Program Breakdown */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-semibold text-blue-900">Undergraduate Rooms</p>
          </div>
          <p className="text-3xl font-extrabold text-blue-900">{stats?.ugRooms ?? 0}</p>
        </div>
        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-semibold text-purple-900">Postgraduate Rooms</p>
          </div>
          <p className="text-3xl font-extrabold text-purple-900">{stats?.pgRooms ?? 0}</p>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Hostel Occupancy</p>
          <p className="text-sm font-bold text-gray-900">{stats?.occupancyPercent ?? 0}%</p>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              (stats?.occupancyPercent ?? 0) > 90 ? 'bg-red-500'
                : (stats?.occupancyPercent ?? 0) > 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${stats?.occupancyPercent ?? 0}%` }}
          />
        </div>
      </div>

      {/* Recent requests */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
          <Link
            to="/superintendent/requests"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No booking requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room / Bed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{r.userName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.roomNumber} / {r.bedId?.split('-').pop()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        r.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
