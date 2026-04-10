import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import StudentLayout from './components/layout/StudentLayout'
import AdminLayout from './components/layout/AdminLayout'
import SuperintendentLayout from './components/layout/SuperintendentLayout'

import Home from './pages/Home'
import Hostels from './pages/Hostels'
import HostelDetail from './pages/HostelDetail'
import Procedure from './pages/Procedure'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'

import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import BookBed from './pages/student/BookBed'
import MyBookings from './pages/student/MyBookings'

import AdminDashboard from './pages/admin/Dashboard'
import Requests from './pages/admin/Requests'
import HostelView from './pages/admin/HostelView'
import Students from './pages/admin/Students'
import Reports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'

import SupDashboard from './pages/superintendent/Dashboard'
import SupRequests from './pages/superintendent/Requests'
import SupStudents from './pages/superintendent/Students'
import SupBedMap from './pages/superintendent/BedMap'

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/hostels" element={<PublicLayout><Hostels /></PublicLayout>} />
      <Route path="/hostels/:id" element={<PublicLayout><HostelDetail /></PublicLayout>} />
      <Route path="/procedure" element={<PublicLayout><Procedure /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

      {/* Student routes */}
      <Route path="/dashboard" element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="book/:hostelId" element={<BookBed />} />
        <Route path="bookings" element={<MyBookings />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="requests" element={<Requests />} />
        <Route path="hostels" element={<HostelView />} />
        <Route path="students" element={<Students />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Superintendent routes (per-hostel) */}
      <Route path="/superintendent" element={<SuperintendentLayout />}>
        <Route index element={<SupDashboard />} />
        <Route path="requests" element={<SupRequests />} />
        <Route path="students" element={<SupStudents />} />
        <Route path="beds" element={<SupBedMap />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
