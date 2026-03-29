import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  Users,
  GraduationCap,
  ArrowRight,
  UserPlus,
  Search,
  LogIn,
  ClipboardList,
  Upload,
  CheckCircle,
  Mail,
  Phone,
  Shield,
  Clock,
  Star,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const API = '/api';

const stats = [
  { icon: Building2, label: 'Female Hostels', value: '17', suffix: '' },
  { icon: BedDouble, label: 'Total Beds', value: '5,087', suffix: '+' },
  { icon: Users, label: 'Total Rooms', value: '1,354', suffix: '' },
  { icon: GraduationCap, label: 'Programs', value: 'UG · PG · Scholar', suffix: '' },
];

const steps = [
  {
    num: 1,
    title: 'Create Account',
    desc: 'Register with your university email and student credentials to get started',
    icon: UserPlus,
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    num: 2,
    title: 'Select Hostel & Bed',
    desc: 'Browse hostels filtered by your gender and program, then pick a vacant bed',
    icon: BedDouble,
    color: 'from-teal-500 to-teal-600',
  },
  {
    num: 3,
    title: 'Upload ID Card',
    desc: 'Upload a clear photo of your student ID card for identity verification',
    icon: Upload,
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    num: 4,
    title: 'Get Approved',
    desc: 'The hostel administration reviews your request and grants approval within 2-3 days',
    icon: CheckCircle,
    color: 'from-green-500 to-green-600',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Secure & Verified',
    desc: 'Every booking request is verified with student ID card or challan validation by hostel administration.',
  },
  {
    icon: Clock,
    title: 'Quick Processing',
    desc: 'Booking requests are processed within 2-3 working days with real-time status updates.',
  },
  {
    icon: Star,
    title: 'Women-Only Hostels',
    desc: '14 dedicated female hostels with 4,562+ beds ensuring a safe and comfortable stay.',
  },
  {
    icon: MapPin,
    title: 'On-Campus Living',
    desc: 'All hostels are located within the university campus with easy access to academic buildings.',
  },
];

function useInView(threshold = 0.15) {
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

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView();

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target.replace(/,/g, ''), 10);
    if (isNaN(num)) { setCount(target); return; }
    let start = 0;
    const step = Math.ceil(num / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num.toLocaleString()); clearInterval(timer); }
      else setCount(start.toLocaleString());
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function Home() {
  const [hostels, setHostels] = useState([]);
  const [allHostels, setAllHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroRef, heroVisible] = useInView(0.1);
  const [stepsRef, stepsVisible] = useInView();
  const [featRef, featVisible] = useInView();
  const [hostelRef, hostelVisible] = useInView();
  useEffect(() => {
    fetch(`${API}/hostels`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.hostels || data.data || [];
        setAllHostels(list);
        setHostels(list.slice(0, 4));
      })
      .catch(() => setHostels([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-700 text-white"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/uaf-hero.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-emerald-800/85 to-green-700/80" />
        </div>
        {/* Decorative background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-green-500/15 rounded-full blur-3xl" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 transition-all duration-700 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-emerald-100">Women's Hostel Accommodation Portal</span>
            </div>

            {/* Title */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight transition-all duration-700 delay-100 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Women's Hostel
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-green-300">
                Accommodation Portal
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-lg sm:text-xl text-emerald-100/90 mb-4 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              University of Agriculture, Faisalabad
            </p>
            <p
              className={`text-sm sm:text-base text-emerald-200/70 mb-10 max-w-xl mx-auto transition-all duration-700 delay-300 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Simplifying hostel accommodation for thousands of students across 17 female hostels with a seamless digital booking experience.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-[400ms] ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <Link
                to="/hostels"
                className="group inline-flex items-center gap-2 bg-white text-emerald-800 px-7 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-900/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Search className="h-4 w-4" />
                Browse Hostels
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/procedure"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-white/20 transition-all duration-200"
              >
                <ClipboardList className="h-4 w-4" />
                How to Apply
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-emerald-600/50 backdrop-blur-sm border border-emerald-400/30 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-emerald-600/70 transition-all duration-200"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-auto fill-white">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="group bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {typeof s.value === 'string' && /^\d/.test(s.value.replace(/,/g, '')) && !s.value.includes('+') && !s.value.includes('·') ? (
                    <><AnimatedCounter target={s.value} />{s.suffix}</>
                  ) : (
                    <>{s.value}{s.suffix}</>
                  )}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT / INTRO ===== */}
      <section className="bg-emerald-50/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5">
              Welcome to UAF Women's Hostel Services
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              The University of Agriculture, Faisalabad provides on-campus hostel accommodation to female students enrolled in Undergraduate, Postgraduate, and Scholar programs. This portal brings together verified hostel pictures, room availability, and challan-based applications.
            </p>
            <p className="text-gray-500 leading-relaxed">
              This portal digitizes the entire booking process — from browsing available hostels and rooms to submitting your accommodation request and tracking its approval status.
            </p>
          </div>

          {/* Key highlights */}
          <div className="grid sm:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-pink-100 text-pink-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Women-Only Inventory</h3>
              <p className="text-sm text-gray-500">Every residence shown here is presented as part of the female hostel network.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-600 mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Challan-Based Application</h3>
              <p className="text-sm text-gray-500">First-semester students can apply with bank challan details even if a student ID has not been issued yet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VICE CHANCELLOR ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 border border-emerald-100">
            <img
              src="vc-zulfiqar-ali.jpg"
              alt="Prof. Dr. Zulfiqar Ali, Vice Chancellor"
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl object-cover shadow-lg flex-shrink-0"
            />
            <div>
              <span className="inline-block text-xs font-bold tracking-widest text-emerald-600 uppercase mb-2">Vice Chancellor</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Prof. Dr. Zulfiqar Ali</h2>
              <p className="text-emerald-700 font-semibold mb-4">Vice Chancellor, University of Agriculture Faisalabad</p>
              <p className="text-gray-600 leading-relaxed">
                This hostel dashboard now brings together verified hostel pictures, room availability, and challan-based applications so students can review accommodation more confidently before applying.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['University of Agriculture Faisalabad', "Women's Hostel Accommodation Portal", 'Student-Centered Digital Access'].map(badge => (
                  <span key={badge} className="text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 bg-white">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section ref={stepsRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              How It Works
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Get your hostel room in four easy steps — completely online, no paperwork needed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`relative group transition-all duration-500 ${
                  stepsVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                  {/* Step number badge */}
                  <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${s.color} text-white font-bold text-lg mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {s.num}
                  </div>
                  <div className="mb-3">
                    <s.icon className="h-7 w-7 mx-auto text-emerald-600 opacity-70" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>

                {/* Connector arrow (not on last item) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-5 -translate-y-1/2 text-gray-300">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section ref={featRef} className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">Benefits</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Why Choose Our Portal
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              A modern, transparent, and efficient hostel allocation system built for UAF students.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`group bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${
                  featVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 mb-4 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ===== FEATURED HOSTELS ===== */}
      <section ref={hostelRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">Explore</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Featured Hostels
              </h2>
              <p className="text-gray-500 mt-2">A glimpse of our residential halls</p>
            </div>
            <Link
              to="/hostels"
              className="hidden sm:inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-sm hover:text-emerald-800 transition-colors group"
            >
              View All Hostels
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-gray-100 rounded-2xl h-56 animate-pulse" />
              ))}
            </div>
          ) : hostels.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hostels available at the moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hostels.map((h, i) => {
                const totalBeds = h.rooms ? h.rooms.reduce((sum, r) => sum + r.beds.length, 0) : h.capacity;
                const isFemale = h.type === 'female';
                return (
                  <Link
                    key={h.id}
                    to={`/hostels/${h.id}`}
                    className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${
                      hostelVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {/* Top gradient bar */}
                    <div className={`h-2 ${isFemale ? 'bg-gradient-to-r from-pink-400 to-pink-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`} />

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${isFemale ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                          <Building2 className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isFemale ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isFemale ? 'Female' : 'Male'}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                        {h.name}
                      </h3>
                      <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-3">
                        {h.category}
                      </span>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4" />
                          {totalBeds} beds
                        </span>
                        <span>{h.totalRooms} rooms</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                        View Details <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="sm:hidden text-center mt-8">
            <Link
              to="/hostels"
              className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-sm"
            >
              View All Hostels <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOSTEL PICTURES GALLERY ===== */}
      {!loading && allHostels.filter(h => h.images && h.images.length > 0).length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">Hostel Pictures</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Visual Gallery for Hostel Buildings
              </h2>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto">
                Preview each residence with photos before opening its detailed profile.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allHostels.filter(h => h.images && h.images.length > 0).map((h) => (
                <Link
                  key={h.id}
                  to={`/hostels/${h.id}`}
                  className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={`${h.images[0]}`}
                      alt={h.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {h.images.length} Photos
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors">{h.name}</h3>
                    <div className="flex gap-2 overflow-hidden">
                      {h.images.slice(0, 4).map((img, j) => (
                        <div key={j} className="h-14 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          <img
                            src={`${img}`}
                            alt={`${h.name} ${j + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold mt-3 group-hover:gap-2.5 transition-all">
                      Open Gallery <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Book Your Hostel?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of UAF students who have already secured their hostel accommodation through our portal.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 bg-white text-emerald-800 px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ===== NEED HELP / CONTACT ===== */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 sm:p-12 border border-emerald-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Need Help?</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Contact Humera Razaq for hostel booking support. If any student needs help regarding hostel booking or any hostel-related matter, they can contact Humera Razaq directly through the email address and cell phone number below.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center sm:text-left">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="humera-razaq.jpg"
                    alt="Humera Razaq"
                    className="w-16 h-16 rounded-full object-cover shadow-md"
                  />
                  <h3 className="font-bold text-lg text-gray-900">Humera Razaq</h3>
                </div>
                <div className="space-y-2">
                  <a href="mailto:Humerarazzaq@gmail.com" className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Humerarazzaq@gmail.com</span>
                  </a>
                  <a href="tel:03326683378" className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">03326683378</span>
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center sm:text-left">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Location</h3>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">University of Agriculture, Faisalabad, Punjab, Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT STRIP ===== */}
      <section className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-lg mb-1">Women's Hostel Accommodation</h3>
              <p className="text-gray-400 text-sm">University of Agriculture, Faisalabad, Punjab, Pakistan</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="mailto:Humerarazzaq@gmail.com" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <div className="h-9 w-9 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm">Humerarazzaq@gmail.com</span>
              </a>
              <a href="tel:03326683378" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <div className="h-9 w-9 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm">03326683378</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
