import {
  UserPlus,
  Search,
  BedDouble,
  Upload,
  SendHorizonal,
  CheckCircle,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Clock,
} from 'lucide-react';

const steps = [
  {
    num: 1,
    title: 'Create Account',
    desc: 'Register with your student details including name, student ID, email, gender, and program.',
    icon: UserPlus,
  },
  {
    num: 2,
    title: 'Browse Hostels',
    desc: 'View eligible hostels based on your gender and academic program (UG/PG/Scholar).',
    icon: Search,
  },
  {
    num: 3,
    title: 'Select Room & Bed',
    desc: 'Choose a vacant bed from the interactive room grid of your selected hostel.',
    icon: BedDouble,
  },
  {
    num: 4,
    title: 'Upload ID Card',
    desc: 'Upload your student ID card image (PNG/JPG, max 5 MB) for verification.',
    icon: Upload,
  },
  {
    num: 5,
    title: 'Submit Request',
    desc: 'Confirm your selection and submit your booking request for admin review.',
    icon: SendHorizonal,
  },
  {
    num: 6,
    title: 'Get Approval',
    desc: 'Admin reviews your request and approves or rejects it within 2-3 working days.',
    icon: CheckCircle,
  },
];

const eligibility = [
  'Gender-based filtering ensures you only see hostels designated for your gender.',
  'Program-based room types — UG, PG, and Scholar rooms are allocated separately.',
  'Only currently enrolled UAF students are eligible to apply.',
];

const documents = [
  'Student ID Card (front side, clear image)',
  'Accepted formats: PNG or JPG',
  'Maximum file size: 5 MB',
];

const rules = [
  'Only one pending booking request is allowed at a time.',
  'You must upload a valid student ID card with your booking.',
  'False information may lead to cancellation and disciplinary action.',
  'Approved bookings are valid for the current academic session only.',
  'Room changes require a new booking request after cancelling the existing one.',
];

export default function Procedure() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-700 text-white py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <FileText className="h-4 w-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">Step-by-Step Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3">Booking Procedure</h1>
          <p className="text-emerald-100/80 text-lg max-w-xl mx-auto">Complete guide to securing your hostel accommodation at UAF</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full h-auto fill-gray-50">
            <path d="M0,25 C360,50 720,0 1080,25 C1260,40 1380,35 1440,25 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {steps.map((s) => (
            <div
              key={s.num}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                  {s.num}
                </span>
                <s.icon className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Info sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Eligibility */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold text-gray-900">Eligibility Criteria</h2>
            </div>
            <ul className="space-y-3">
              {eligibility.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold text-gray-900">Required Documents</h2>
            </div>
            <ul className="space-y-3">
              {documents.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Rules */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Important Rules</h2>
            </div>
            <ul className="space-y-3">
              {rules.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold text-gray-900">Processing Timeline</h2>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Booking requests are typically processed within{' '}
                <span className="font-semibold text-emerald-700">2-3 working days</span>. You will
                receive notification of your booking status via email. During peak admission periods,
                processing may take slightly longer.
              </p>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">1</span>
                <span>Submission received and queued</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
                <span>Admin reviews documents and eligibility</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                <span>Approval or rejection notification sent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
