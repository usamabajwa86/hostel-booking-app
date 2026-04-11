import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, IdCard, Phone, Home as HomeIcon, GraduationCap, Hash,
  CalendarDays, BookOpen, Save, CheckCircle2, AlertTriangle, Loader2,
  ShieldAlert, Heart, Users as UsersIcon, Droplet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const API = '/api';

const SEMESTERS = [
  '1st', '2nd', '3rd', '4th', '5th', '6th',
  '7th', '8th', '9th', '10th',
];

const PROGRAMS = [
  { value: 'UG', label: 'Undergraduate (UG)' },
  { value: 'PG', label: 'Postgraduate (PG)' },
  { value: 'Scholar', label: 'PhD / Scholar' },
];

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fatherName: '',
    cnic: '',
    phone: '',
    address: '',
    program: 'UG',
    degreeName: '',
    department: '',
    semester: '1st',
    enrollmentYear: new Date().getFullYear().toString(),
    semesterStatus: 'first', // 'first' or 'senior'
    registrationNumber: '',
    // Emergency + Guardian
    emergencyContact: '',
    guardianName: '',
    guardianRelation: 'Father',
    guardianContact: '',
    // Medical
    bloodGroup: '',
    medicalIllness: '',
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from existing profile
  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        const fresh = await refreshUser();
        const profile = fresh?.profile || user.profile;
        if (profile) {
          setForm((prev) => ({ ...prev, ...profile }));
        }
      } catch {
        if (user.profile) setForm((prev) => ({ ...prev, ...user.profile }));
      } finally {
        setLoaded(true);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // When switching to "first semester", ensure semester is set to 1st
      if (name === 'semesterStatus' && value === 'first') {
        next.semester = '1st';
        next.registrationNumber = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      // Senior students must have a registration number
      if (payload.semesterStatus === 'senior' && !payload.registrationNumber) {
        showToast('Senior students must provide their registration number', 'error');
        setSaving(false);
        return;
      }

      const res = await fetch(`${API}/users/${user.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      updateUser(data);
      showToast('Profile saved successfully', 'success');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const isFirstSem = form.semesterStatus === 'first';
  const profileWasComplete = Boolean(user?.profile?.degreeName);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          {profileWasComplete
            ? 'Update your profile information below.'
            : 'Complete your profile to unlock hostel booking. Your information is required only once.'}
        </p>
      </div>

      {!profileWasComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Profile required before booking</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Hostel booking is disabled until you provide all required student details. This information stays with your account from 1st through 8th semester.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Father's Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter father's name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CNIC <span className="text-red-500">*</span></label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="cnic"
                  value={form.cnic}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{5}-?[0-9]{7}-?[0-9]"
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="35202-1234567-8"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="03001234567"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Permanent Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <HomeIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="House, street, city, district"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Academic Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Program <span className="text-red-500">*</span></label>
              <select
                name="program"
                value={form.program}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PROGRAMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Degree Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="degreeName"
                  value={form.degreeName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. BS Agriculture, MSc Food Tech"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department / Faculty</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Agronomy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Enrollment Year</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="enrollmentYear"
                  value={form.enrollmentYear}
                  onChange={handleChange}
                  min="2018"
                  max={new Date().getFullYear() + 1}
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Semester / Verification Source */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Hash className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Semester & Verification</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'semesterStatus', value: 'first' } })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  isFirstSem
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-bold text-gray-900">1st Semester Student</p>
                <p className="text-xs text-gray-500 mt-1">No registration number yet — use bank challan to apply.</p>
              </button>
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'semesterStatus', value: 'senior' } })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  !isFirstSem
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-bold text-gray-900">2nd Semester or Above</p>
                <p className="text-xs text-gray-500 mt-1">Use your university registration number.</p>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Semester <span className="text-red-500">*</span></label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
                disabled={isFirstSem}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                {SEMESTERS.map((s) => <option key={s} value={s}>{s} Semester</option>)}
              </select>
            </div>

            {!isFirstSem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">University Registration Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  required={!isFirstSem}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 2022-ag-1234"
                />
              </div>
            )}

            {isFirstSem && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-700">
                As a first-semester student you will provide bank challan details when booking your bed. Once your university registration number is issued, you can update this section.
              </div>
            )}
          </div>
        </section>

        {/* Emergency Contact & Guardian */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldAlert className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Emergency Contact &amp; Guardian</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4 -mt-2">
            These details are used by hostel staff in case of any emergency. All fields marked with <span className="text-red-500">*</span> are mandatory.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Emergency Contact Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="A number we can reach in an emergency"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Usually a parent, sibling or close relative who can respond immediately.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Guardian Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="guardianName"
                  value={form.guardianName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Full name of guardian"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Relationship</label>
              <select
                name="guardianRelation"
                value={form.guardianRelation}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Uncle">Uncle</option>
                <option value="Aunt">Aunt</option>
                <option value="Guardian">Legal Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Guardian Contact Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="guardianContact"
                  value={form.guardianContact}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 03001234567"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Medical Information */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Heart className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Medical Information</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4 -mt-2">
            These fields are optional but help hostel staff respond appropriately if you need care.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
              <div className="relative">
                <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Medical Illness / Disability
              </label>
              <textarea
                name="medicalIllness"
                value={form.medicalIllness}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Asthma, diabetes, physical disability, allergies — or 'None'"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                This information remains private and is only visible to the hostel superintendent and administration for your safety.
              </p>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {profileWasComplete ? <Save className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {profileWasComplete ? 'Update Profile' : 'Save Profile & Continue'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
