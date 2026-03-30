import { useState } from 'react';
import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Menu, X, User, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/bookings', label: 'My Bookings', icon: BookOpen, end: false },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isStudent } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-50 text-emerald-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            {user.studentId && (
              <p className="text-xs text-gray-500">{user.studentId}</p>
            )}
          </div>
        </div>
        {user.program && (
          <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            {user.program}
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={linkClasses}
            onClick={() => setSidebarOpen(false)}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* View Site + Logout */}
      <div className="p-4 border-t border-gray-100 space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <ExternalLink className="h-5 w-5" />
          View Website
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-gray-900">Student Portal</span>
          <div className="w-9" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
