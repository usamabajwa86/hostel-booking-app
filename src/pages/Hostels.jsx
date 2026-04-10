import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, ArrowRight, BedDouble, DoorOpen, Users, Filter, GraduationCap } from 'lucide-react';

const API = '/api';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function Hostels() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState('all');
  const [search, setSearch] = useState('');
  const [gridRef, gridVisible] = useInView();

  useEffect(() => {
    fetch(`${API}/hostels`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.hostels || data.data || [];
        setHostels(list);
      })
      .catch(() => setHostels([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = hostels.filter((h) => {
    if (program !== 'all' && h.rooms) {
      const hasProgram = h.rooms.some(r => {
        const cat = (r.programCategory || '').toLowerCase();
        if (program === 'ug') return cat === 'undergraduate';
        if (program === 'pg') return cat === 'postgraduate';
        return true;
      });
      if (!hasProgram) return false;
    }
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const occupancy = (h) => {
    const total = h.totalBeds || h.totalCapacity || h.capacity || 0;
    let vacant = 0;
    if (h.rooms) {
      for (const room of h.rooms) {
        for (const bed of room.beds || []) {
          if (!bed.status || bed.status === 'vacant') vacant++;
        }
      }
    } else {
      vacant = h.vacantBeds ?? h.vacant ?? 0;
    }
    if (!total) return 0;
    return Math.round(((total - vacant) / total) * 100);
  };

  const totalBeds = hostels.reduce((sum, h) => {
    if (h.rooms) return sum + h.rooms.reduce((s, r) => s + (r.beds?.length || 0), 0);
    return sum + (h.totalBeds || h.totalCapacity || h.capacity || 0);
  }, 0);
  const totalRooms = hostels.reduce((sum, h) => sum + (h.rooms?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-700 text-white py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-500/15 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Building2 className="h-4 w-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">Women's Hostel Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3">Hostel Directory</h1>
          <p className="text-emerald-100/80 text-lg max-w-xl mx-auto">
            Explore {hostels.length} female residential halls with over {totalBeds.toLocaleString()} beds across campus
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Building2 className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-medium">{hostels.length} Hostels</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <DoorOpen className="h-4 w-4 text-pink-300" />
              <span className="text-sm font-medium">{totalRooms.toLocaleString()} Rooms</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <BedDouble className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-medium">{totalBeds.toLocaleString()} Beds</span>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" className="w-full h-auto fill-gray-50">
            <path d="M0,30 C360,60 720,0 1080,30 C1260,50 1380,40 1440,30 L1440,50 L0,50 Z" />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
            <Filter className="h-4 w-4" />
            Filter Hostels
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Program filter */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { val: 'all', label: 'All Programs' },
                { val: 'ug', label: 'UG Rooms' },
                { val: 'pg', label: 'PG Rooms' },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setProgram(p.val)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    program === p.val
                      ? 'bg-white shadow-sm text-emerald-700 scale-[1.02]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search hostel by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of{' '}
            <span className="font-semibold text-gray-800">{hostels.length}</span> hostels
          </p>
          {(program !== 'all' || search) && (
            <button
              onClick={() => { setProgram('all'); setSearch(''); }}
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Grid */}
        <div ref={gridRef}>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse">
                  <div className="h-2 rounded-t-2xl bg-gray-200" />
                  <div className="p-5 space-y-4">
                    <div className="h-5 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-2 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No hostels found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((h, i) => {
                const occ = occupancy(h);
                const totalRoomsCard = h.rooms ? h.rooms.length : (h.ugRooms || 0) + (h.pgRooms || 0);
                const bedCount = h.rooms ? h.rooms.reduce((s, r) => s + (r.beds?.length || 0), 0) : (h.totalBeds || h.totalCapacity || h.capacity || 0);
                const ugRooms = h.rooms ? h.rooms.filter(r => (r.programCategory || '').toLowerCase() === 'undergraduate').length : 0;
                const pgRooms = h.rooms ? h.rooms.filter(r => (r.programCategory || '').toLowerCase() === 'postgraduate').length : 0;
                const coverImage = h.images && h.images.length > 0 ? `${h.images[0]}` : null;

                return (
                  <Link
                    key={h.id}
                    to={`/hostels/${h.id}`}
                    className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${
                      gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${Math.min(i, 8) * 80}ms` }}
                  >
                    {/* Cover image or gradient bar */}
                    {coverImage ? (
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={coverImage}
                          alt={h.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-400 text-pink-950">
                            Female
                          </span>
                          {h.category === 'PG' && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500 text-white shadow">
                              PG Only
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3 text-white font-bold text-sm drop-shadow-lg">
                          {h.images.length} Photos
                        </div>
                      </div>
                    ) : (
                      <div className="h-1.5 bg-gradient-to-r from-pink-400 to-pink-500" />
                    )}

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-pink-50 text-pink-600 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{h.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                                Female
                              </span>
                              {h.category && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  {h.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <BedDouble className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-lg font-bold text-gray-900">{bedCount}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Beds</p>
                        </div>
                        <div className="text-center border-x border-gray-200">
                          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <DoorOpen className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-lg font-bold text-gray-900">{totalRoomsCard}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Rooms</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Users className="h-3.5 w-3.5" />
                          </div>
                          <p className={`text-lg font-bold ${occ > 90 ? 'text-red-600' : occ > 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{occ}%</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Full</p>
                        </div>
                      </div>

                      {/* UG/PG breakdown */}
                      {(ugRooms > 0 || pgRooms > 0) && (
                        <div className="flex gap-2 mb-3">
                          {ugRooms > 0 && (
                            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-blue-50 text-blue-700">
                              UG: {ugRooms} rooms
                            </span>
                          )}
                          {pgRooms > 0 && (
                            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-50 text-purple-700">
                              PG: {pgRooms} rooms
                            </span>
                          )}
                        </div>
                      )}

                      {/* Occupancy bar */}
                      <div className="mb-4">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              occ > 90 ? 'bg-red-500' : occ > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${occ}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                        View Details <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
