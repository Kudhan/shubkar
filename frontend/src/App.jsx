import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VendorDashboard from './pages/VendorDashboard';
import VendorRegister from './pages/VendorRegister';
import VendorSearch from './pages/VendorSearch';
import AIPlanEvent from './pages/AIPlanEvent';
import AdminDashboard from './pages/AdminDashboard';
import Timeline from './pages/Timeline';
import Checkout from './pages/Checkout'; // Import Checkout
import ProtectedRoute from './components/ProtectedRoute';

import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Router>
      <Routes>
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
          <Route path="/vendors" element={<VendorSearch />} />
          <Route path="/ai-planner" element={<AIPlanEvent />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/checkout" element={<Checkout />} /> {/* Checkout Route */}
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
    </Router>
  );
}






export default App;
