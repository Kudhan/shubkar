import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VendorDashboard from './pages/VendorDashboard';
import VendorRegister from './pages/VendorRegister';
import VendorSearch from './pages/VendorSearch';
import VendorDetails from './pages/VendorDetails';
import AIPlanEvent from './pages/AIPlanEvent';
import EventsPage from './pages/EventsPage';
import AdminDashboard from './pages/AdminDashboard';
import Timeline from './pages/Timeline';
import Checkout from './pages/Checkout'; // Import Checkout
import CustomerProfile from './pages/CustomerProfile';
import CreateEvent from './pages/CreateEvent';
import EventDashboard from './pages/EventDashboard';
import EventVendorSearch from './pages/EventVendorSearch'; // Import fixed
import EditEvent from './pages/EditEvent';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AIChat from './components/AIChat';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981', // green-500
                color: 'white',
              },
              iconTheme: {
                primary: 'white',
                secondary: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444', // red-500
                color: 'white',
              },
              iconTheme: {
                primary: 'white',
                secondary: '#EF4444',
              },
            },
          }}
        />
        <Routes>
          {/* Unrestricted Public Routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Public Routes (Redirect if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />

            <Route path="/vendor/register" element={<VendorRegister />} />
          </Route>

          {/* Protected Routes for Customer */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'admin', 'superadmin']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<CustomerProfile />} />
            <Route path="/vendors" element={<VendorSearch />} />
            <Route path="/vendors/:id" element={<VendorDetails />} />
            <Route path="/ai-planner" element={<AIPlanEvent />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/checkout" element={<Checkout />} /> {/* Checkout Route */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/create" element={<CreateEvent />} />
            <Route path="/events/:id" element={<EventDashboard />} />
            <Route path="/events/:id/vendors" element={<EventVendorSearch />} /> {/* New Route */}
            <Route path="/events/:id/edit" element={<EditEvent />} /> {/* New Route */}
          </Route>

          {/* Protected Routes for Vendor */}
          <Route element={<ProtectedRoute allowedRoles={['vendor', 'admin', 'superadmin']} />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          </Route>

          {/* Protected Routes for Admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
        <AIChat />
      </Router>
    </AuthProvider>
  );
}

export default App;
