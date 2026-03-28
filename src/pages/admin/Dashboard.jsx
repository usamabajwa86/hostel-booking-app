import { useState, useEffect, useCallback } from "react";
import {
  BedDouble,
  CheckCircle,
  Clock,
  Users,
  Check,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatsCard from "../../components/ui/StatsCard";
import { useToast } from "../../components/ui/Toast";

const API = "/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, reqRes, hostelRes] = await Promise.all([
        fetch(`${API}/admin/stats`),
        fetch(`${API}/requests`),
        fetch(`${API}/hostels`),
      ]);
      setStats(await statsRes.json());
      const reqData = await reqRes.json();
      setRequests(Array.isArray(reqData) ? reqData : []);
      const hostelData = await hostelRes.json();
      setHostels(Array.isArray(hostelData) ? hostelData : []);
    } catch (err) {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await fetch(`${API}/requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      showToast(`Request ${status} successfully`, "success");
      fetchData();
    } catch {
      showToast(`Failed to ${status} request`, "error");
    }
  };

  const pendingRequests = requests
    .filter((r) => r.status === "pending")
    .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
    .slice(0, 5);

  const occupancyData = hostels.map((h) => {
    const totalBeds = (h.rooms || []).reduce(
      (sum, r) => sum + (r.beds ? r.beds.length : 0),
      0
    );
    const approvedForHostel = requests.filter(
      (r) => r.status === "approved" && r.hostelId === h.id
    ).length;
    const occupancy = totalBeds > 0 ? Math.round((approvedForHostel / totalBeds) * 100) : 0;
    return { name: h.name.replace(' Hall', '').replace(' Block ', ' '), occupancy };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Beds" value={stats?.totalBeds ?? 0} icon={BedDouble} color="slate" />
        <StatsCard title="Vacant Beds" value={stats?.vacantBeds ?? 0} icon={CheckCircle} color="emerald" />
        <StatsCard title="Pending Approvals" value={stats?.pendingRequests ?? 0} icon={Clock} color="amber" />
        <StatsCard title="Registered Students" value={stats?.registeredStudents ?? 0} icon={Users} color="indigo" />
      </div>

      {/* Recent Pending Requests */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Pending Requests
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No pending requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room / Bed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{req.userName || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{req.hostelName || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {req.roomNumber || "N/A"} / {req.bedId || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleAction(req.id, "approved")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition-colors text-xs font-medium"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "rejected")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Occupancy Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hostel Occupancy</h2>
        {occupancyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(300, occupancyData.length * 36)}>
            <BarChart data={occupancyData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="occupancy" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm">No hostel data available.</p>
        )}
      </div>
    </div>
  );
}
