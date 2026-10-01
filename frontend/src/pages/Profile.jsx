import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Shield, User, Info, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin':
        return 'Full system access to manage users, events, venues, vendors, clients, reports and review cancellation requests.';
      case 'coordinator':
        return 'Operational access to create and schedule events, assign venues, coordinate vendors, and manage client records.';
      case 'staff':
        return 'Standard team access to view scheduled assignments, inspect venues, check vendor allocations, and submit client ratings.';
      default:
        return 'Standard system access.';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Account Info Card */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            <div className="mt-2.5">
              <span className="inline-block uppercase tracking-wider text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {user?.role} Role
              </span>
            </div>
          </div>
        </div>

        <div className="pt-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Role Permissions & Scope</h2>
            <div className="mt-2 p-3.5 bg-slate-50 rounded border border-slate-200 text-sm text-slate-700 leading-relaxed">
              {getRoleDescription(user?.role)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 border border-slate-200 rounded bg-white">
              <p className="text-xs font-medium text-slate-500 uppercase">System Status</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-medium text-slate-800">Connected to Database (Online)</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded bg-white">
              <p className="text-xs font-medium text-slate-500 uppercase">Project Engineering</p>
              <p className="text-sm font-medium text-slate-800 mt-1.5">Developed by AI Warriors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Project Credits */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          About EventForce
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          EventForce is an Event Management System built by <strong>AI Warriors</strong> for full-lifecycle event scheduling, venue allocation, vendor coordination, and operations reporting.
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Version 1.0.0 (Production Build)</span>
          <span>Designed & Engineered by AI Warriors</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
