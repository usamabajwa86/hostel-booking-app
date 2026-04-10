import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, BedDouble, Clock, ArrowRight, Loader2,
  AlertTriangle, UserCheck, GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = '/api';

export default function Dashboard() {
  const { user, isProfileComplete } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [hostelsRes, bookingsRes] = await Promise.all([
          fetch(`${API}/hostels`),
          fetch(`${API}/requests?userId=${user.id}`),
        ]);
        const hostelsData = await hostelsRes.json();
        const bookingsData = await bookingsRes.json();
        setHostels(Array.isArray(hostelsData) ? hostelsData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.id]);

  const activeCount = bookings.filter((b) => b.status === 'approved').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  // Use program from profile if set, fall back to top-level
  const userProgram = (user?.profile?.program || user?.program || '').toLowerCase();

  const eligibleHostels = useMemo(() => {
    return hostels.filter((hostel) => {
      // Program filter
      const category = hostel.category?.toLowerCase();
      if (userProgram === 'ug') {
        if (category === 'pg') return false;
      } else if (userProgram === 'pg') {
        // PG students can use any hostel that has PG rooms (Mixed or PG)
      }
      return true;
    });
  }, [hostels, userProgram]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your hostel bookings and browse available hostels.
        </p>
      </div>

      {/* Profile completion gate */}
      {!isProfileComplete && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-900">Complete your student profile</h3>
            <p className="text-sm text-amber-700 mt-1">
              You must provide your degree, semester, CNIC and contact details before you can book a hostel bed.
              This information is required only once and stays with you from 1st through 8th semester.
            </p>
            <Link
              to="/dashboard/profile"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              <UserCheck className="h-4 w-4" /> Complete Profile
            </Link>
          </div>
        </div>
      )}

      {/* Profile summary if complete */}
      {isProfileComplete && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.profile.degreeName}</p>
              <p className="text-xs text-gray-500">{user.profile.semester} Semester · {user.profile.program}</p>
            </div>
            <Link
              to="/dashboard/profile"
              className="ml-auto text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Edit Profile
            </Link>
          </div>
          {user.profile.semesterStatus === 'first' ? (
            <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-2.5 py-1.5 inline-block">
              1st semester student — bookings use bank challan details
            </p>
          ) : (
            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-md px-2.5 py-1.5 inline-block">
              Senior student — Reg #: <strong>{user.profile.registrationNumber}</strong>
            </p>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <BedDouble className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Requests</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Eligible Hostels */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-600" />
          Eligible Hostels
        </h2>

        {eligibleHostels.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No eligible hostels found for your program.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibleHostels.map((hostel) => {
              const capacity =
                hostel.totalCapacity ||
                hostel.capacity ||
                (hostel.rooms || []).reduce((s, r) => s + (r.beds?.length || 0), 0);
              let vacant = 0;
              if (hostel.rooms) {
                for (const room of hostel.rooms) {
                  for (const bed of room.beds || []) {
                    if (!bed.status || bed.status === 'vacant') vacant++;
                  }
                }
              } else {
                vacant = hostel.vacantBeds ?? hostel.vacant ?? 0;
              }
              const occupied = capacity - vacant;
              const occupancyPercent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;

              return (
                <div
                  key={hostel._id || hostel.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col"
                >
                  <h3 className="text-base font-semibold text-gray-900">{hostel.name}</h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-500 flex-1">
                    <div className="flex justify-between">
                      <span>Capacity</span>
                      <span className="font-medium text-gray-700">{capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vacant Beds</span>
                      <span className="font-medium text-emerald-600">{vacant}</span>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Occupancy</span>
                      <span>{occupancyPercent}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPercent > 90
                            ? 'bg-red-500'
                            : occupancyPercent > 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  </div>

                  {isProfileComplete ? (
                    <Link
                      to={`/dashboard/book/${hostel._id || hostel.id}`}
                      className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      Select & Book
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/profile"
                      className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      Complete profile to book
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
