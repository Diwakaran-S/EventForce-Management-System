import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventDetails from './pages/EventDetails';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Venues from './pages/Venues';
import VenueDetails from './pages/VenueDetails';
import Vendors from './pages/Vendors';
import VendorDetails from './pages/VendorDetails';
import EventVendors from './pages/EventVendors';
import Feedback from './pages/Feedback';
import CancellationRequests from './pages/CancellationRequests';
import Reports from './pages/Reports';
import UsersPage from './pages/Users';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes inside DashboardLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Events */}
                <Route path="/events" element={<Events />} />
                <Route path="/events/create" element={<CreateEvent />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/events/:id/edit" element={<EditEvent />} />

                {/* Clients */}
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:id" element={<ClientDetails />} />

                {/* Venues */}
                <Route path="/venues" element={<Venues />} />
                <Route path="/venues/:id" element={<VenueDetails />} />

                {/* Vendors */}
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/vendors/:id" element={<VendorDetails />} />

                {/* Operations */}
                <Route path="/event-vendors" element={<EventVendors />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/cancellations" element={<CancellationRequests />} />

                {/* Reports & Analytics */}
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin Only */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/users" element={<UsersPage />} />
                </Route>
              </Route>
            </Route>

            {/* Default Redirection */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
