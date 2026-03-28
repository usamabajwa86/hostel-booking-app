import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BedDouble, Building2, DoorOpen, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import BedGrid from '../../components/ui/BedGrid';
import IdCardUpload from '../../components/ui/IdCardUpload';
import Modal from '../../components/ui/Modal';

const API = '/api';

export default function BookBed() {
  const { hostelId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [idCardImage, setIdCardImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  const fetchHostel = useCallback(async () => {
    try {
      const res = await fetch(`${API}/hostels/${hostelId}`);
      const data = await res.json();
      setHostel(data);
    } catch (err) {
      console.error('Failed to fetch hostel:', err);
    } finally {
      setLoading(false);
    }
  }, [hostelId]);

  const checkPendingRequest = useCallback(async () => {
    try {
      const res = await fetch(`${API}/requests?userId=${user.id}`);
      const data = await res.json();
      const pending = Array.isArray(data)
        ? data.some((r) => r.status === 'pending')
        : false;
      setHasPendingRequest(pending);
    } catch (err) {
      console.error('Failed to check pending requests:', err);
    }
  }, [user.id]);

  useEffect(() => {
    fetchHostel();
    checkPendingRequest();
  }, [fetchHostel, checkPendingRequest]);

  const handleBedClick = (bed, roomNumber) => {
    if (hasPendingRequest) {
      toast({
        title: 'Booking Restricted',
        description: 'You already have a pending booking request. Please wait for it to be processed.',
        variant: 'warning',
      });
      return;
    }
    setSelectedBed({ ...bed, roomNumber });
    setIdCardImage(null);
    setModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!idCardImage || !selectedBed) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          studentId: user.studentId,
          hostelId,
          hostelName: hostel.name,
          roomNumber: selectedBed.roomNumber,
          bedId: selectedBed.id,
          idCardImage,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Booking request failed');
      }

      const result = await res.json();

      setModalOpen(false);
      setConfirmation({
        hostelName: hostel.name,
        roomNumber: selectedBed.roomNumber,
        bedNumber: selectedBed.bedNumber || selectedBed.number,
        status: 'pending',
        ...result,
      });

      toast({
        title: 'Booking Submitted!',
        description: 'Your booking request has been submitted successfully.',
        variant: 'success',
      });

      // Refresh data
      fetchHostel();
      checkPendingRequest();
    } catch (err) {
      toast({
        title: 'Booking Failed',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="text-center py-16">
        <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Hostel not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-emerald-600 hover:underline text-sm">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const totalRooms = hostel.rooms?.length || hostel.totalRooms || 0;
  const totalBeds = hostel.capacity || hostel.totalBeds || 0;
  const vacantBeds = hostel.vacantBeds ?? hostel.vacant ?? 0;

  // If confirmation is shown
  if (confirmation) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Request Submitted</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your request is being reviewed by the administration.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Hostel</span>
              <span className="font-medium text-gray-900">{confirmation.hostelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Room</span>
              <span className="font-medium text-gray-900">{confirmation.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bed</span>
              <span className="font-medium text-gray-900">{confirmation.bedNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Pending
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard/bookings"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-center"
            >
              View My Bookings
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/dashboard" className="text-sm text-emerald-600 hover:underline mb-2 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{hostel.name}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <DoorOpen className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Total Rooms</p>
            <p className="text-lg font-bold text-gray-900">{totalRooms}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <BedDouble className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Total Beds</p>
            <p className="text-lg font-bold text-gray-900">{totalBeds}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <BedDouble className="h-5 w-5 text-emerald-500" />
          <div>
            <p className="text-xs text-gray-500">Vacant Beds</p>
            <p className="text-lg font-bold text-emerald-600">{vacantBeds}</p>
          </div>
        </div>
      </div>

      {/* Pending Warning */}
      {hasPendingRequest && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-amber-700 text-xs font-bold">!</span>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">You have a pending booking request</p>
            <p className="text-sm text-amber-600 mt-0.5">
              Please wait for your current request to be processed before making a new one.
            </p>
          </div>
        </div>
      )}

      {/* Bed Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Bed</h2>
        <BedGrid rooms={hostel.rooms || []} onBedClick={handleBedClick} />
      </div>

      {/* Booking Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Confirm Booking</h3>
            <p className="text-sm text-gray-500 mt-1">Review your selection before submitting.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Hostel</span>
              <span className="font-medium text-gray-900">{hostel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Room</span>
              <span className="font-medium text-gray-900">{selectedBed?.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bed</span>
              <span className="font-medium text-gray-900">
                {selectedBed?.bedNumber || selectedBed?.number}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload ID Card <span className="text-red-500">*</span>
            </label>
            <IdCardUpload value={idCardImage} onChange={setIdCardImage} />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={!idCardImage || submitting}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
