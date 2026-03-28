import { useState, useEffect, useCallback } from "react";
import { Search, Download } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import { useToast } from "../../components/ui/Toast";

const API = "http://localhost:5000/api";

export default function Students() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programFilter, setProgramFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, reqRes] = await Promise.all([
        fetch(`${API}/users`),
        fetch(`${API}/requests`),
      ]);
      const usersData = await usersRes.json();
      const reqData = await reqRes.json();
      setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      setRequests(Array.isArray(reqData) ? reqData : reqData.requests || []);
    } catch {
      showToast("Failed to load student data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build a map of userId/studentId -> latest approved request
  const bookingMap = {};
  requests
    .filter((r) => r.status === "approved")
    .forEach((r) => {
      const key = r.userId || r.studentId || r.email;
      if (key) bookingMap[key] = r;
    });

  const getBooking = (user) => {
    return (
      bookingMap[user.id] ||
      bookingMap[user.studentId] ||
      bookingMap[user.email] ||
      null
    );
  };

  const filtered = users.filter((u) => {
    // Only show students
    if (u.role === "admin") return false;

    if (programFilter !== "all") {
      const program = (u.program || "").toLowerCase();
      if (programFilter === "ug" && program !== "ug" && program !== "undergraduate") return false;
      if (programFilter === "pg" && program !== "pg" && program !== "postgraduate") return false;
      if (programFilter === "scholar" && program !== "scholar" && program !== "phd") return false;
    }

    if (genderFilter !== "all") {
      const gender = (u.gender || "").toLowerCase();
      if (gender !== genderFilter) return false;
    }

    const booking = getBooking(u);
    if (bookingFilter === "has_booking" && !booking) return false;
    if (bookingFilter === "no_booking" && booking) return false;

    if (search) {
      const q = search.toLowerCase();
      const nameMatch = (u.name || "").toLowerCase().includes(q);
      const idMatch = (u.studentId || "").toLowerCase().includes(q);
      if (!nameMatch && !idMatch) return false;
    }

    return true;
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Student Registry</h1>
        <a
          href="http://localhost:5000/api/admin/export/students"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Programs</option>
          <option value="ug">UG</option>
          <option value="pg">PG</option>
          <option value="scholar">Scholar</option>
        </select>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select
          value={bookingFilter}
          onChange={(e) => setBookingFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Booking Status</option>
          <option value="has_booking">Has Booking</option>
          <option value="no_booking">No Booking</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Student ID", "Email", "Program", "Gender", "Booking Status", "Hostel", "Room"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const booking = getBooking(user);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {user.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.studentId || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                      {user.program || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                      {user.gender || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {booking ? (
                        <StatusBadge status="approved" />
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          No Booking
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {booking
                        ? booking.hostelName || booking.hostel || "N/A"
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {booking
                        ? `${booking.roomNumber || "N/A"} / ${booking.bedId || "N/A"}`
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filtered.length} student{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
