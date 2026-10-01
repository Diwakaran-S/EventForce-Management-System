import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  Briefcase,
  Layers,
  MessageSquare,
  FileText,
  BarChart3,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: null,
      links: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'EVENT MANAGEMENT',
      links: [
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'Clients', path: '/clients', icon: Users },
        { name: 'Venues', path: '/venues', icon: MapPin },
        { name: 'Vendors', path: '/vendors', icon: Briefcase },
      ],
    },
    {
      title: 'OPERATIONS',
      links: [
        { name: 'Event Vendors', path: '/event-vendors', icon: Layers },
        { name: 'Feedback', path: '/feedback', icon: MessageSquare },
        { name: 'Cancellation Requests', path: '/cancellations', icon: FileText },
      ],
    },
    {
      title: 'ANALYTICS',
      links: [
        { name: 'Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: 'ADMINISTRATION',
            links: [
              { name: 'Users', path: '/users', icon: Shield },
            ],
          },
        ]
      : []),
  ];

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'coordinator':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'staff':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">EventForce</span>
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Management System
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {section.title}
              </p>
            )}
            {section.links.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(link.path);

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Section & Developer Credit */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <NavLink
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 p-2 rounded-md transition-colors ${
            location.pathname === '/profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
            <span
              className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded border ${getRoleBadge(
                user?.role
              )}`}
            >
              {user?.role}
            </span>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        {/* AI Warriors sidebar credit */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400">
            Developed by <span className="font-semibold text-slate-200">AI Warriors</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen z-30 shadow-md">
        <Sidebar />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-xl z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-gray-800">
              Event Management Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-gray-800 block">{user?.name}</span>
              <span className="text-[11px] text-gray-500">{user?.email}</span>
            </div>
            <span
              className={`text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border ${getRoleBadge(
                user?.role
              )}`}
            >
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Developed by AI Warriors - Application Footer */}
        <footer className="mt-auto border-t border-gray-200 bg-white py-3.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© 2026 EventForce &bull; Event Management System</p>
            <p>
              Developed by <strong className="font-semibold text-gray-800">AI Warriors</strong>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
