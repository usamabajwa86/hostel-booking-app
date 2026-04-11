import { useState } from 'react';
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
  IdCard,
  Mail,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

const faqs = [
  {
    q: 'Who is eligible to apply for a hostel?',
    a: 'All currently enrolled female students of the University of Agriculture, Faisalabad — undergraduate, postgraduate and PhD/Scholar — are eligible to apply for on-campus accommodation through this portal.',
  },
  {
    q: 'How does email verification work?',
    a: 'When you register, the portal sends a 6-digit verification code to your email address. You enter that code on the next screen to confirm your email before your account is created. The code expires after 10 minutes; you can request a new one at any time.',
  },
  {
    q: 'Why do I have to complete my student profile before booking?',
    a: 'Booking is locked until your profile is complete so that hostel staff have all the information they need (contact, guardian, emergency, medical) at hand the moment your booking is reviewed. You only fill the profile once — it stays with you through your whole degree.',
  },
  {
    q: 'I am a first semester student and do not have a registration number yet. Can I still apply?',
    a: 'Yes. First-semester students can apply using their bank challan details — you will be asked for the bank name, total amount paid, challan number, branch and submission date, plus a scanned copy of the paid voucher. Once your registration number is issued, you can update your profile.',
  },
  {
    q: 'I am in my 2nd semester or higher. What do I need?',
    a: 'Senior students must fill in their university registration number in the profile page. When booking, the system will automatically attach that number to your request — no challan is required.',
  },
  {
    q: 'What are the required profile fields?',
    a: "Father's name, CNIC, phone, permanent address, degree name, current semester, emergency contact number, guardian name, and guardian contact number are all required. Blood group and any medical illness or disability are optional but strongly encouraged so staff can respond appropriately in an emergency.",
  },
  {
    q: 'Why do you need an emergency contact and guardian details?',
    a: 'In case of any medical or safety emergency, hostel staff need someone they can reach immediately. This information is only visible to your hostel superintendent and the university administration — it is not shown publicly anywhere.',
  },
  {
    q: 'Is my medical information kept private?',
    a: 'Yes. Medical illness, disability and blood group are only visible to the superintendent of the hostel you book and to the UAF hostel administration. They are never shown on any public page.',
  },
  {
    q: 'How long does approval take?',
    a: 'Most booking requests are processed within 2-3 working days. During peak admission periods the review may take slightly longer. You can track the status of your request in real time from the "My Bookings" page.',
  },
  {
    q: 'Can I book more than one bed at the same time?',
    a: 'No. Only one pending booking request is allowed per student at a time. If your request is rejected or you vacate an existing booking, you can submit a new request immediately.',
  },
  {
    q: 'What happens if I am a UG student and try to book a PG-only hostel?',
    a: "The booking will be blocked and you will see a clear 'not eligible' message. Maryam Hall Block C is currently the only postgraduate-only hostel. Undergraduate students see the remaining 16 hostels, all of which have UG rooms available.",
  },
  {
    q: 'Can I change my room or hostel after it has been approved?',
    a: 'Yes. Vacate your current booking from the "My Bookings" page first, and then submit a new booking request for the room or hostel you prefer. Your booking history is preserved for audit purposes.',
  },
  {
    q: 'What is a UG room vs a PG room?',
    a: 'UG rooms are dormitory-style rooms (typically 5 beds per room) for undergraduate students. PG rooms are smaller "coupled" or "warden" rooms (typically 2-3 beds per room) for postgraduate students. The room types are marked clearly on every hostel detail page.',
  },
  {
    q: 'Why can only the hostel superintendent see my booking?',
    a: "Each of our 17 hostels has its own superintendent and its own scoped portal. Superintendents only see requests and residents from their own hostel. The central UAF hostel administration still has full access to every hostel's data for oversight and reporting.",
  },
  {
    q: 'What if I lose access to my email or forget my password?',
    a: 'Contact the hostel coordinator, Humera Razaq, directly. Her email and phone number are available on the Contact page. A manual account reset can be performed by the administration.',
  },
  {
    q: 'Is this portal only for female students?',
    a: 'Yes. The UAF Women\'s Hostel Accommodation Portal is dedicated exclusively to the 17 female residential halls on campus. Male hostels are managed through a separate system.',
  },
];

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

const steps = [
  {
    num: 1,
    title: 'Create Account & Verify Email',
    desc: 'Register with your name, email and password. Confirm your email with the 6-digit verification code.',
    icon: UserPlus,
  },
  {
    num: 2,
    title: 'Complete Student Profile',
    desc: 'Provide your degree, current semester, CNIC, contact details and registration number (if applicable).',
    icon: IdCard,
  },
  {
    num: 3,
    title: 'Browse Hostels',
    desc: 'View eligible female hostels with photos, room types and live bed availability.',
    icon: Search,
  },
  {
    num: 4,
    title: 'Select Room & Bed',
    desc: 'Choose a vacant bed from the interactive room grid of your selected hostel.',
    icon: BedDouble,
  },
  {
    num: 5,
    title: 'Submit Booking Details',
    desc: '1st semester students upload bank challan + voucher. Senior students use their university registration number.',
    icon: SendHorizonal,
  },
  {
    num: 6,
    title: 'Hostel Superintendent Review',
    desc: 'The superintendent of your selected hostel reviews your request and approves it within 2-3 working days.',
    icon: CheckCircle,
  },
];

const eligibility = [
  'All UAF women hostels are open to currently enrolled female students.',
  'Program-based filtering — Undergraduate, Postgraduate and PhD/Scholar rooms are allocated based on your profile.',
  'Profile completion is mandatory before any booking request can be submitted.',
];

const documents = [
  '1st semester: bank challan number, paid amount, branch and submission date + scanned voucher',
  'Senior students: university registration number from your profile',
  'Profile fields: CNIC, phone, address, degree, semester, department',
];

const rules = [
  'Only one pending booking request is allowed at a time.',
  'Your student profile must be complete before any booking can be submitted.',
  '1st semester students must provide complete bank challan details and upload the paid voucher.',
  '2nd semester and senior students must enter their university registration number in their profile.',
  'False information may lead to cancellation and disciplinary action.',
  'Approved bookings are valid for the current academic session only.',
];

export default function Procedure() {
  const [openFaq, setOpenFaq] = useState(0);
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
                <span>Hostel superintendent reviews documents and eligibility</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                <span>Approval or rejection notification sent</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-emerald-700 mb-2">
              <HelpCircle className="h-5 w-5" />
              <span className="text-xs font-bold tracking-widest uppercase">Help Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Answers to the most common questions about hostel booking at UAF.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {faqs.map((f, i) => (
              <FAQItem
                key={i}
                q={f.q}
                a={f.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Still have questions? Contact <a href="mailto:Humerarazzaq@gmail.com" className="text-emerald-700 font-semibold hover:underline">Humera Razaq</a> at 03326683378.
          </p>
        </div>
      </div>
    </div>
  );
}
