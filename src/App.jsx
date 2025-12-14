import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const Management = lazy(() => import('./pages/Management'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Team = lazy(() => import('./pages/Team'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load Admin pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminManagement = lazy(() => import('./pages/admin/AdminManagement'));
const AdminTeam = lazy(() => import('./pages/admin/AdminTeam'));
const AdminStats = lazy(() => import('./pages/admin/AdminStats'));
const Enquiries = lazy(() => import('./pages/admin/Enquiries'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/management" element={<Management />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<React.Fragment><meta httpEquiv="refresh" content="0; url=/admin/dashboard" /></React.Fragment>} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="management" element={<AdminManagement />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="stats" element={<AdminStats />} />
            <Route path="enquiries" element={<Enquiries />} />
            {/* Add placeholders for other admin routes if needed */}
          </Route>

          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
