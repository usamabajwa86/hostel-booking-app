import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const API = "/api";
const SERVER = "";
const PER_PAGE = 20;

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [hostelFilter, setHostelFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReq, setSelectedReq] = useState(null);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [reqRes, hostelRes] = await Promise.all([
        fetch(`${API}/requests`),
        fetch(`${API}/hostels`),
      ]);
      const reqData = await reqRes.json();
      const hostelData = await hostelRes.json();
      setRequests(Array.isArray(reqData) ? reqData : []);
      setHostels(Array.isArray(hostelData) ? hostelData : []);
    } catch {
      showToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      showToast(`Request ${status} successfully`, "success");
      setSelectedReq(null);
      fetchData();
    } catch {
      showToast("Failed to update request", "error");
    }
  };

  const handleVacate = async (id) => {
    if (!window.confirm("Are you sure you want to vacate this booking?")) return;
    try {
      const res = await fetch(`${API}/requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Booking vacated successfully", "success");
      fetchData();
    } catch {
      showToast("Failed to vacate booking", "error");
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (hostelFilter !== "all" && r.hostelId !== hostelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = (r.userName || "").toLowerCase().includes(q);
      const emailMatch = (r.userEmail || "").toLowerCase().includes(q);
      const idMatch = (r.studentId || "").toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !idMatch) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, hostelFilter, search]);

  const exportCSV = () => {
    const headers = ["Request ID", "Name", "Student ID", "Email", "Hostel", "Room", "Bed", "Status", "Date"];
    const rows = filtered.map((r) => [
      r.id,
      r.userName || "",
      r.studentId || "",
      r.userEmail || "",
      r.hostelName || "",
      r.roomNumber || "",
      r.bedId || "",
      r.status || "",
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "booking_requests.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Manage Requests</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" /> Export Requests
          </button>
          <a
            href="/api/admin/export/students"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" /> Students CSV
          </a>
          <a
            href="/api/admin/export/beds"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" /> Bed Map CSV
          </a>
          <a
            href="/api/admin/export/history"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" /> History CSV
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="vacated">Vacated</option>
        </select>

        <select
          value={hostelFilter}
          onChange={(e) => setHostelFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Hostels</option>
          {hostels.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["ID", "Name", "Student ID", "Hostel", "Room/Bed", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">No requests found.</td>
              </tr>
            ) : (
              paginated.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{req.id?.slice(-8) || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{req.userName || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{req.studentId || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{req.hostelName || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{req.roomNumber || "N/A"} / {req.bedId || "N/A"}</td>
                  <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedReq(req)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      {req.status === "pending" && (
                        <>
                          <button onClick={() => handleStatus(req.id, "approved")} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Approve">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleStatus(req.id, "rejected")} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Reject">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {(req.status === "approved" || req.status === "pending") && (
                        <button onClick={() => handleVacate(req.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Vacate">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1} - {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} requests
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <Modal isOpen={!!selectedReq} onClose={() => setSelectedReq(null)} title="Booking Details">
        {selectedReq && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium text-gray-500">Name</span><p className="text-gray-900">{selectedReq.userName || "N/A"}</p></div>
              <div><span className="font-medium text-gray-500">Email</span><p className="text-gray-900">{selectedReq.userEmail || "N/A"}</p></div>
              <div><span className="font-medium text-gray-500">Reg / Student ID</span><p className="text-gray-900 font-mono text-xs">{selectedReq.registrationNumber || selectedReq.studentId || "N/A"}</p></div>
              <div><span className="font-medium text-gray-500">Type</span>
                <p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    selectedReq.semesterStatus === 'first' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {selectedReq.semesterStatus === 'first' ? '1st Semester' : selectedReq.semesterStatus === 'senior' ? 'Senior' : '—'}
                  </span>
                </p>
              </div>
              <div><span className="font-medium text-gray-500">Hostel</span><p className="text-gray-900">{selectedReq.hostelName || "N/A"}</p></div>
              <div><span className="font-medium text-gray-500">Room</span><p className="text-gray-900">{selectedReq.roomNumber || "N/A"}</p></div>
              <div><span className="font-medium text-gray-500">Bed</span><p className="text-gray-900 font-mono text-xs">{selectedReq.bedId || "N/A"}</p></div>
              <div><span className="font-medium text-gray-500">Status</span><div><StatusBadge status={selectedReq.status} /></div></div>
            </div>

            {/* Challan details (1st semester) */}
            {selectedReq.challan && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Bank Challan</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-blue-600">Bank:</span> <span className="text-blue-900 font-medium">{selectedReq.challan.bankName}</span></div>
                  <div><span className="text-blue-600">Amount:</span> <span className="text-blue-900 font-medium">Rs. {selectedReq.challan.paidAmount}</span></div>
                  <div><span className="text-blue-600">Challan #:</span> <span className="text-blue-900 font-medium">{selectedReq.challan.challanNumber}</span></div>
                  <div><span className="text-blue-600">Branch:</span> <span className="text-blue-900 font-medium">{selectedReq.challan.bankBranch}</span></div>
                  <div className="col-span-2"><span className="text-blue-600">Submitted on:</span> <span className="text-blue-900 font-medium">{selectedReq.challan.submissionDate}</span></div>
                </div>
              </div>
            )}

            {/* Voucher image */}
            {selectedReq.idCardImage && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Paid Voucher</p>
                <a href={`${SERVER}/${selectedReq.idCardImage}`} target="_blank" rel="noreferrer">
                  <img
                    src={`${SERVER}/${selectedReq.idCardImage}`}
                    alt="Paid Voucher"
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-200 hover:opacity-90 transition"
                  />
                </a>
              </div>
            )}

            {selectedReq.status === "pending" && (
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button onClick={() => handleStatus(selectedReq.id, "approved")} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button onClick={() => handleStatus(selectedReq.id, "rejected")} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
