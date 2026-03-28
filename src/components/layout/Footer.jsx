import { Link } from 'react-router-dom';
import { Building2, Mail, Phone } from 'lucide-react';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/hostels', label: 'Hostels' },
  { to: '/procedure', label: 'Procedure' },
  { to: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6 text-emerald-500" />
              <span className="text-lg font-bold text-white">UAF Hostels</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              University of Agriculture, Faisalabad — providing comfortable and
              affordable hostel accommodation for students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Chief Hall Warden (CHW) Office
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <a
                  href="mailto:chw@uaf.edu.pk"
                  className="hover:text-emerald-400 transition-colors"
                >
                  chw@uaf.edu.pk
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <a
                  href="tel:0419200190"
                  className="hover:text-emerald-400 transition-colors"
                >
                  041-9200190
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            &copy; 2024 University of Agriculture, Faisalabad. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
