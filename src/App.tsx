import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// PUBLIC PAGES
import { Home } from "./pages/public/Home";
import { Packages } from "./pages/public/Packages";
import { Destinations } from "./pages/public/Destinations";
import { Gallery } from "./pages/public/Gallery";
import { EditorialGallery } from "./pages/public/EditorialGallery";
import { About } from "./pages/public/About";
import { Contact } from "./pages/public/Contact";
import { Blog } from "./pages/public/Blog";
import { BlogPost } from "./pages/public/BlogPost";
import { ItineraryDetail } from "./pages/public/ItineraryDetail";
import { FAQ } from "./pages/public/FAQ";
import { Reviews } from "./pages/public/Reviews";
import { Testimonials } from "./pages/public/Testimonials";
import { Privacy } from "./pages/public/Privacy";
import { Terms } from "./pages/public/Terms";
import { Login } from "./pages/system/Login";

// USER & SYSTEM
import { Booking } from "./pages/user/Booking";
import { Dashboard } from "./pages/user/Dashboard";
import { Wishlist } from "./pages/user/Wishlist";
import { PriceAlerts } from "./pages/user/PriceAlerts";
import { Admin } from "./pages/system/Admin";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Main Public Flow */}
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="packages" element={<Packages />} />
          <Route path="destinations" element={<Destinations />} />
          <Route path="itinerary/:id" element={<ItineraryDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="gallery/:id" element={<EditorialGallery />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="price-alerts" element={<PriceAlerts />} />

          {/* Legal Pages */}
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />

          {/* Authentication */}
          <Route path="login" element={<Login />} />

          {/* User Secure Area */}
          <Route path="booking/:id" element={<Booking />} />

          {/* Fallback - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Admin Dashboard — outside MainLayout (no header/footer) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}