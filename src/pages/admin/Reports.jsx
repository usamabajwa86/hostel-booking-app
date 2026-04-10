import { useState, useEffect, useCallback } from "react";
import { BedDouble, CheckCircle, Clock, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import StatsCard from "../../components/ui/StatsCard";
import { useToast } from "../../components/ui/Toast";

const API = "/api";

const COLORS = {
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  indigo: "#6366f1",
  slate: "#64748b",
  sky: "#0ea5e9",
};

const STATUS_COLORS = [COLORS.amber, COLORS.emerald, COLORS.red];
const GENDER_COLORS = [COLORS.indigo, COLORS.sky];
const PROGRAM_COLORS = [COLORS.emerald, COLORS.amber, COLORS.indigo];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, hostelRes, reqRes, usersRes] = await Promise.all([
        fetch(`${API}/admin/stats`),
        fetch(`${API}/hostels`),
        fetch(`${API}/requests`),
        fetch(`${API}/users`),
      ]);
      const statsData = await statsRes.json();
      const hostelData = await hostelRes.json();
      const reqData = await reqRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setHostels(Array.isArray(hostelData) ? hostelData : hostelData.hostels || []);
      setRequests(Array.isArray(reqData) ? reqData : reqData.requests || []);
      setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
    } catch {
      showToast("Failed to load report data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Occupancy by Hostel
  const occupancyData = hostels.map((h) => {
    const totalBeds = (h.rooms || []).reduce(
      (sum, r) => sum + (r.beds ? r.beds.length : 0),
      0
    );
    const approved = requests.filter(
      (r) => r.status === "approved" && r.hostelId === h.id
    ).length;
    return {
      name: h.name,
      occupancy: totalBeds > 0 ? Math.round((approved / totalBeds) * 100) : 0,
    };
  });

  // Requests by Status
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;
  const statusData = [
    { name: "Pending", value: pendingCount },
    { name: "Approved", value: approvedCount },
    { name: "Rejected", value: rejectedCount },
  ];

  // Semester Status (1st sem vs senior)
  const students = users.filter((u) => u.role === "student");
  const firstSemCount = students.filter(
    (u) => (u.profile?.semesterStatus || "").toLowerCase() === "first"
  ).length;
  const seniorCount = students.filter(
    (u) => (u.profile?.semesterStatus || "").toLowerCase() === "senior"
  ).length;
  const noProfileCount = students.filter((u) => !u.profile).length;
  const genderData = [
    { name: "1st Semester", value: firstSemCount },
    { name: "Senior", value: seniorCount },
    { name: "Profile Pending", value: noProfileCount },
  ];

  // Program Distribution (read from profile.program first, fallback to top-level)
  const getProgram = (u) => (u.profile?.program || u.program || "").toLowerCase();
  const ugCount = students.filter((u) => {
    const p = getProgram(u);
    return p === "ug" || p === "undergraduate";
  }).length;
  const pgCount = students.filter((u) => {
    const p = getProgram(u);
    return p === "pg" || p === "postgraduate";
  }).length;
  const scholarCount = students.filter((u) => {
    const p = getProgram(u);
    return p === "scholar" || p === "phd";
  }).length;
  const programData = [
    { name: "UG", count: ugCount },
    { name: "PG", count: pgCount },
    { name: "Scholar", count: scholarCount },
  ];

  const renderCustomLabel = ({ name, percent }) =>
    `${name} ${(percent * 100).toFixed(0)}%`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Beds"
          value={stats?.totalBeds ?? 0}
          icon={BedDouble}
          color="slate"
        />
        <StatsCard
          title="Vacant Beds"
          value={stats?.vacantBeds ?? 0}
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          title="Pending Approvals"
          value={stats?.pendingRequests ?? 0}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Registered Students"
          value={stats?.registeredStudents ?? 0}
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Occupancy by Hostel */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Occupancy by Hostel
          </h2>
          {occupancyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(300, occupancyData.length * 36)}>
              <BarChart
                data={occupancyData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
                <Bar dataKey="occupancy" fill={COLORS.indigo} name="Occupancy %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No data available.</p>
          )}
        </div>

        {/* 2. Requests by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Requests by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Semester Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Students by Semester Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={GENDER_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Program Distribution */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Program Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Students">
                {programData.map((_, i) => (
                  <Cell key={i} fill={PROGRAM_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
