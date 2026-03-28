import { useState, useEffect, useCallback } from "react";
import { BedDouble, DoorOpen, CheckCircle, BarChart3 } from "lucide-react";
import StatsCard from "../../components/ui/StatsCard";
import BedGrid from "../../components/ui/BedGrid";
import { useToast } from "../../components/ui/Toast";

const API = "/api";

export default function HostelView() {
  const [hostels, setHostels] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [hostelRes, reqRes] = await Promise.all([
        fetch(`${API}/hostels`),
        fetch(`${API}/requests`),
      ]);
      const hostelData = await hostelRes.json();
      const reqData = await reqRes.json();
      const hostelList = Array.isArray(hostelData) ? hostelData : hostelData.hostels || [];
      setHostels(hostelList);
      setRequests(Array.isArray(reqData) ? reqData : reqData.requests || []);
      if (hostelList.length > 0 && !selectedHostelId) {
        setSelectedHostelId(hostelList[0]._id);
      }
    } catch {
      showToast("Failed to load hostel data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, selectedHostelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedHostel = hostels.find((h) => h.id === selectedHostelId);

  const approvedRequests = requests.filter(
    (r) =>
      r.status === "approved" &&
      (r.hostelId === selectedHostelId)
  );

  const totalRooms = selectedHostel?.rooms?.length || selectedHostel?.totalRooms || 0;
  const totalBeds = selectedHostel?.rooms
    ? selectedHostel.rooms.reduce((sum, r) => sum + (r.beds ? r.beds.length : 0), 0)
    : selectedHostel?.totalBeds || 0;
  const occupiedBeds = approvedRequests.length;
  const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Hostel Visualization</h1>
        <select
          value={selectedHostelId}
          onChange={(e) => setSelectedHostelId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px]"
        >
          {hostels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {selectedHostel ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Rooms"
              value={totalRooms}
              icon={DoorOpen}
              color="slate"
            />
            <StatsCard
              title="Total Beds"
              value={totalBeds}
              icon={BedDouble}
              color="indigo"
            />
            <StatsCard
              title="Vacant Beds"
              value={vacantBeds}
              icon={CheckCircle}
              color="emerald"
            />
            <StatsCard
              title="Occupancy %"
              value={`${occupancyPercent}%`}
              icon={BarChart3}
              color="amber"
            />
          </div>

          {/* Bed Grid */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Room & Bed Layout — {selectedHostel.name}
            </h2>
            <BedGrid rooms={selectedHostel.rooms || []} />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Select a hostel to view its room and bed layout.
        </div>
      )}
    </div>
  );
}
