import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import SecurityMonitor from './components/SecurityMonitor';
import Home from './pages/Home'; // Eager load Home
import Courses from './pages/Courses';
import TeamManagement from './pages/TeamManagement';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import CourseDetails from './pages/CourseDetails';



// Lazy load pages - only generic ones
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
const AdminSecurity = lazy(() => import('./pages/admin/AdminSecurity'));
const AdminDiagnostics = lazy(() => import('./pages/admin/AdminDiagnostics'));
const Enquiries = lazy(() => import('./pages/admin/Enquiries'));
const AdminHomepage = lazy(() => import('./pages/admin/AdminHomepage'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));
const AdminFooter = lazy(() => import('./pages/admin/AdminFooter'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

// Lenis smooth scroll — disabled on admin pages
const SmoothScroll = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    const id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, [isAdmin]);

  return null;
};

function App() {
  return (
    <Router>
      <SmoothScroll />
      <SecurityMonitor>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ... routes ... */}
            {/* Public Routes */}
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetails />} />
              <Route path="/team-management" element={<TeamManagement />} />
              <Route path="/gallery" element={<Gallery />} />
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
              <Route path="security" element={<AdminSecurity />} />
              <Route path="diagnostics" element={<AdminDiagnostics />} />
              <Route path="enquiries" element={<Enquiries />} />
              <Route path="homepage" element={<AdminHomepage />} />
              <Route path="contact" element={<AdminContact />} />
              <Route path="footer" element={<AdminFooter />} />
              {/* Add placeholders for other admin routes if needed */}
            </Route>

            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Suspense>
      </SecurityMonitor>
    </Router>
  );
}

export default App;
