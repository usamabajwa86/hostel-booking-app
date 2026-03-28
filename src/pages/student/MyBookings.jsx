import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Loader2, Trash2, Building2, Clock, CheckCircle, XCircle, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';

const API = 'http://localhost:5000/api';

const timelineIcons = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  approved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  vacated: { icon: LogOut, color: 'text-gray-500', bg: 'bg-gray-50' },
};

function BookingTimeline({ history = [] }) {
  if (!history.length) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 mb-2">Booking Timeline</p>
      <div className="space-y-2">
        {history.map((entry, i) => {
          const config = timelineIcons[entry.status] || timelineIcons.pending;
          const Icon = config.icon;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`flex-shrink-0 h-6 w-6 rounded-full ${config.bg} flex items-center justify-center`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">{entry.note}</p>
                <p className="text-[10px] text-gray-400">
                  {new Date(entry.timestamp).toLocaleString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vacateTarget, setVacateTarget] = useState(null);
  const [vacating, setVacating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API}/requests?userId=${user.id}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
      setBookings(list);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user.id]);

  const handleVacate = async () => {
    if (!vacateTarget) return;
    setVacating(true);
    try {
      const res = await fetch(`${API}/requests/${vacateTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to vacate booking');
      toast({ title: 'Booking Vacated', description: 'Your booking has been vacated.', variant: 'success' });
      setVacateTarget(null);
      fetchBookings();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'error' });
    } finally {
      setVacating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const canVacate = (status) => status === 'pending' || status === 'approved';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-emerald-600" />
          My Bookings
        </h1>
        <p className="mt-1 text-sm text-gray-500">Track and manage your hostel booking requests.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No bookings yet</h3>
          <p className="text-sm text-gray-500 mb-4">Browse Hostels to get started.</p>
          <Link to="/dashboard" className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            Browse Hostels
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{booking.hostelName}</h3>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                      <span>Room: <span className="text-gray-700 font-medium">{booking.roomNumber}</span></span>
                      <span>Bed: <span className="text-gray-700 font-medium">{booking.bedId}</span></span>
                      <span>Submitted: <span className="text-gray-700">{formatDate(booking.submittedAt)}</span></span>
                      {booking.approvedAt && <span>Approved: <span className="text-emerald-600">{formatDate(booking.approvedAt)}</span></span>}
                      {booking.rejectedAt && <span>Rejected: <span className="text-red-600">{formatDate(booking.rejectedAt)}</span></span>}
                      {booking.vacatedAt && <span>Vacated: <span className="text-gray-600">{formatDate(booking.vacatedAt)}</span></span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canVacate(booking.status) && (
                      <button
                        onClick={() => setVacateTarget(booking)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Vacate
                      </button>
                    )}
                    {booking.history && booking.history.length > 0 && (
                      <button
                        onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 border border-gray-200 transition-colors"
                      >
                        {expandedId === booking.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        History
                      </button>
                    )}
                  </div>
                </div>

                {expandedId === booking.id && (
                  <BookingTimeline history={booking.history} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vacate Modal */}
      <Modal isOpen={!!vacateTarget} onClose={() => setVacateTarget(null)} title="Vacate Booking">
        {vacateTarget && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">Are you sure you want to vacate this booking? This action cannot be undone.</p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Hostel</span><span className="font-medium text-gray-900">{vacateTarget.hostelName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Room</span><span className="font-medium text-gray-900">{vacateTarget.roomNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Bed</span><span className="font-medium text-gray-900">{vacateTarget.bedId}</span></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setVacateTarget(null)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors" disabled={vacating}>Cancel</button>
              <button onClick={handleVacate} disabled={vacating} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {vacating ? <><Loader2 className="h-4 w-4 animate-spin" /> Vacating...</> : 'Confirm Vacate'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
