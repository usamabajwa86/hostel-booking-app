import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  BedDouble,
  DoorOpen,
  Users,
  BarChart3,
  LogIn,
  ArrowLeft,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BedGrid from '../components/ui/BedGrid';

const API = 'http://localhost:5000/api';


function ImageGallery({ images, name }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative h-72 sm:h-96 rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => setLightbox(true)}
        >
          <img
            src={`http://localhost:5000${images[selected]}`}
            alt={`${name} - ${selected + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
            {selected + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 h-16 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                i === selected ? 'border-emerald-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={`http://localhost:5000${img}`}
                alt={`${name} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={() => setLightbox(false)}
          >
            <X className="h-8 w-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 bg-black/40 rounded-full p-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelected((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 bg-black/40 rounded-full p-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelected((prev) => (prev < images.length - 1 ? prev + 1 : 0));
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          <img
            src={`http://localhost:5000${images[selected]}`}
            alt={`${name} - ${selected + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {selected + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

export default function HostelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/hostels/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Hostel not found');
        return r.json();
      })
      .then((data) => {
        setHostel(data.hostel || data.data || data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-6 bg-white/10 rounded w-48 mb-6 animate-pulse" />
            <div className="h-10 bg-white/10 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
          <div className="bg-white rounded-2xl h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Building2 className="h-16 w-16 text-gray-200" />
        <p className="text-gray-500 text-lg">{error || 'Hostel not found'}</p>
        <Link
          to="/hostels"
          className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hostels
        </Link>
      </div>
    );
  }

  const isFemale = hostel.type === 'female';
  const totalRooms = hostel.rooms ? hostel.rooms.length : (hostel.ugRooms || 0) + (hostel.pgRooms || 0) || hostel.totalRooms || 0;
  const totalBeds = hostel.rooms ? hostel.rooms.reduce((s, r) => s + (r.beds?.length || 0), 0) : (hostel.totalBeds || hostel.totalCapacity || hostel.capacity || 0);

  let vacantBeds = 0;
  let pendingBeds = 0;
  let bookedBeds = 0;
  if (hostel.rooms) {
    for (const room of hostel.rooms) {
      for (const bed of room.beds || []) {
        if (bed.status === 'booked') bookedBeds++;
        else if (bed.status === 'pending') pendingBeds++;
        else vacantBeds++;
      }
    }
  } else {
    vacantBeds = hostel.vacantBeds ?? hostel.vacant ?? 0;
    bookedBeds = totalBeds - vacantBeds;
  }

  const occupancy = totalBeds > 0 ? Math.round(((totalBeds - vacantBeds) / totalBeds) * 100) : 0;
  const hasImages = hostel.images && hostel.images.length > 0;
  const coverImage = hasImages ? `http://localhost:5000${hostel.images[0]}` : null;

  const statCards = [
    { label: 'Total Rooms', value: totalRooms, icon: DoorOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Beds', value: totalBeds, icon: BedDouble, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Vacant Beds', value: vacantBeds, icon: Users, color: 'bg-green-50 text-green-600' },
    {
      label: 'Occupancy',
      value: `${occupancy}%`,
      icon: BarChart3,
      color: occupancy > 90 ? 'bg-red-50 text-red-600' : occupancy > 70 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative overflow-hidden text-white py-12 pb-16">
        {coverImage ? (
          <div className="absolute inset-0">
            <img src={coverImage} alt={hostel.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-emerald-800/80 to-green-700/60" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-700">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-500/15 rounded-full blur-3xl" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-emerald-200 mb-5">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/hostels" className="hover:text-white transition-colors">Hostels</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium">{hostel.name}</span>
          </nav>

          <div className="flex items-center gap-4 flex-wrap">
            <div className={`h-14 w-14 rounded-2xl ${isFemale ? 'bg-pink-500/20' : 'bg-blue-500/20'} flex items-center justify-center`}>
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">{hostel.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isFemale ? 'bg-pink-200 text-pink-800' : 'bg-blue-200 text-blue-800'
                  }`}
                >
                  {isFemale ? 'Female' : 'Male'}
                </span>
                {hostel.category && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white">
                    {hostel.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full h-auto fill-gray-50">
            <path d="M0,25 C360,50 720,0 1080,25 C1260,40 1380,35 1440,25 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        {hostel.images && hostel.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Gallery ({hostel.images.length} Photos)</h2>
            <ImageGallery images={hostel.images} name={hostel.name} />
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`h-12 w-12 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick availability summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Availability Summary</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{vacantBeds}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Vacant</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{pendingBeds}</p>
              <p className="text-xs text-amber-600 font-medium mt-1">Pending</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{bookedBeds}</p>
              <p className="text-xs text-red-600 font-medium mt-1">Booked</p>
            </div>
          </div>
          {/* Occupancy bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Occupancy</span>
              <span className="font-semibold text-gray-700">{occupancy}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  occupancy > 90 ? 'bg-red-500' : occupancy > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bed Grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Room & Bed Availability</h2>
          <BedGrid rooms={hostel.rooms || []} />
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          {user ? (
            <Link
              to={`/dashboard/book/${hostel.id}`}
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 hover:bg-emerald-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Book a Bed Now{' '}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 hover:bg-emerald-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <LogIn className="h-4 w-4" />
                Login to Book
              </Link>
              <p className="text-sm text-gray-500">Sign in with your student account to reserve a bed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
