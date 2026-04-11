import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, Check, X, FileText, Hash, Calendar, Eye,
  Phone, ShieldAlert, Heart, IdCard, Users as UsersIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';

const API = '/api';

const STATUS_CHIPS = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  vacated: 'bg-gray-100 text-gray-700',
};

export default function SuperintendentRequests() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchRequests = useCallback(async () => {
    if (!user?.hostelId) return;
    try {
      const res = await fetch(`${API}/superintendent/${user.hostelId}/requests`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.hostelId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id, status) => {
    try {
      const res = await fetch(`${API}/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actorRole: 'superintendent', actorName: user.name }),
      });
      if (!res.ok) throw new Error();
      showToast(`Request ${status} successfully`, 'success');
      setSelected(null);
      fetchRequests();
    } catch {
      showToast(`Failed to ${status} request`, 'error');
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve booking requests for {user.hostelName}.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-xl p-2">
        {[
          { val: 'all', label: 'All' },
          { val: 'pending', label: 'Pending' },
          { val: 'approved', label: 'Approved' },
          { val: 'rejected', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setFilter(tab.val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.val
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label} <span className="ml-1 text-xs opacity-75">({counts[tab.val]})</span>
          </button>
        ))}
      </div>

      {/* Requests list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No requests in this category.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room / Bed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{r.userName}</p>
                      <p className="text-xs text-gray-500">{r.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <p>Room {r.roomNumber}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.bedId}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        r.semesterStatus === 'first' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {r.semesterStatus === 'first' ? '1st sem' : 'Senior'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CHIPS[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right space-x-1">
                      <button
                        onClick={() => setSelected(r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 text-xs font-medium"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(r.id, 'approved')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 text-xs font-medium"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(r.id, 'rejected')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-xs font-medium"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selected.userName}</h3>
              <p className="text-sm text-gray-500">{selected.userEmail}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Hostel</p>
                <p className="font-semibold text-gray-900">{selected.hostelName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Room</p>
                <p className="font-semibold text-gray-900">{selected.roomNumber}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Bed</p>
                <p className="font-semibold text-gray-900 font-mono">{selected.bedId}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Semester Type</p>
                <p className="font-semibold text-gray-900 capitalize">{selected.semesterStatus || '—'}</p>
              </div>
            </div>

            {/* Challan details if first semester */}
            {selected.challan && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1">
                  <Hash className="h-4 w-4" /> Bank Challan
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-blue-600">Bank:</span> <span className="text-blue-900 font-medium">{selected.challan.bankName}</span></div>
                  <div><span className="text-blue-600">Amount:</span> <span className="text-blue-900 font-medium">Rs. {selected.challan.paidAmount}</span></div>
                  <div><span className="text-blue-600">Challan #:</span> <span className="text-blue-900 font-medium">{selected.challan.challanNumber}</span></div>
                  <div><span className="text-blue-600">Branch:</span> <span className="text-blue-900 font-medium">{selected.challan.bankBranch}</span></div>
                  <div className="col-span-2"><span className="text-blue-600">Submitted on:</span> <span className="text-blue-900 font-medium">{selected.challan.submissionDate}</span></div>
                </div>
              </div>
            )}

            {/* Registration number for senior students */}
            {selected.registrationNumber && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                <p className="text-sm font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                  <Hash className="h-4 w-4" /> Registration Number
                </p>
                <p className="font-mono text-emerald-900">{selected.registrationNumber}</p>
              </div>
            )}

            {/* Student profile snapshot */}
            {selected.profileSnapshot && (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                    <IdCard className="h-4 w-4 text-gray-500" /> Student Profile
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {selected.profileSnapshot.fatherName && (
                      <div>
                        <p className="text-gray-500">Father's Name</p>
                        <p className="font-medium text-gray-900">{selected.profileSnapshot.fatherName}</p>
                      </div>
                    )}
                    {selected.profileSnapshot.cnic && (
                      <div>
                        <p className="text-gray-500">CNIC</p>
                        <p className="font-medium text-gray-900 font-mono">{selected.profileSnapshot.cnic}</p>
                      </div>
                    )}
                    {selected.profileSnapshot.phone && (
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {selected.profileSnapshot.phone}
                        </p>
                      </div>
                    )}
                    {selected.profileSnapshot.degreeName && (
                      <div>
                        <p className="text-gray-500">Degree / Semester</p>
                        <p className="font-medium text-gray-900">{selected.profileSnapshot.degreeName} · {selected.profileSnapshot.semester}</p>
                      </div>
                    )}
                    {selected.profileSnapshot.address && (
                      <div className="col-span-2">
                        <p className="text-gray-500">Permanent Address</p>
                        <p className="font-medium text-gray-900">{selected.profileSnapshot.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency & Guardian */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-600" /> Emergency Contact &amp; Guardian
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {selected.profileSnapshot.emergencyContact && (
                      <div className="col-span-2">
                        <p className="text-amber-700">Emergency Number</p>
                        <p className="font-bold text-amber-900 text-sm flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> {selected.profileSnapshot.emergencyContact}
                        </p>
                      </div>
                    )}
                    {selected.profileSnapshot.guardianName && (
                      <div>
                        <p className="text-amber-700">Guardian</p>
                        <p className="font-medium text-amber-900 flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          {selected.profileSnapshot.guardianName}
                          {selected.profileSnapshot.guardianRelation && (
                            <span className="text-amber-600">({selected.profileSnapshot.guardianRelation})</span>
                          )}
                        </p>
                      </div>
                    )}
                    {selected.profileSnapshot.guardianContact && (
                      <div>
                        <p className="text-amber-700">Guardian Contact</p>
                        <p className="font-medium text-amber-900 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {selected.profileSnapshot.guardianContact}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical info */}
                {(selected.profileSnapshot.bloodGroup || selected.profileSnapshot.medicalIllness) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-red-600" /> Medical Information
                    </p>
                    <div className="space-y-2 text-xs">
                      {selected.profileSnapshot.bloodGroup && (
                        <div>
                          <span className="text-red-700">Blood Group: </span>
                          <span className="font-bold text-red-900 font-mono">{selected.profileSnapshot.bloodGroup}</span>
                        </div>
                      )}
                      {selected.profileSnapshot.medicalIllness && (
                        <div>
                          <p className="text-red-700">Medical Illness / Disability</p>
                          <p className="text-red-900 mt-0.5 whitespace-pre-wrap">{selected.profileSnapshot.medicalIllness}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Voucher image */}
            {selected.idCardImage && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Paid Voucher</p>
                <a href={`/${selected.idCardImage}`} target="_blank" rel="noreferrer">
                  <img
                    src={`/${selected.idCardImage}`}
                    alt="Voucher"
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-200 hover:opacity-90 transition"
                  />
                </a>
              </div>
            )}

            {/* History */}
            {selected.history?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Audit Trail
                </p>
                <ul className="space-y-1.5 text-xs">
                  {selected.history.map((h, i) => (
                    <li key={i} className="bg-gray-50 rounded px-3 py-2">
                      <span className="font-semibold text-gray-700 capitalize">{h.status}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-500">{new Date(h.timestamp).toLocaleString()}</span>
                      {h.note && <p className="text-gray-500 mt-0.5">{h.note}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            {selected.status === 'pending' && (
              <div className="flex gap-3 pt-2 border-t">
                <button
                  onClick={() => handleAction(selected.id, 'rejected')}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selected.id, 'approved')}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Approve Booking
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
