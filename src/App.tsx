import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// PUBLIC PAGES
import { Home } from "./pages/public/Home";
import { Packages } from "./pages/public/Packages";
import { Destinations } from "./pages/public/Destinations";
import { DestinationDetail } from "./pages/public/DestinationDetail";
import { Gallery } from "./pages/public/Gallery";
import { EditorialGallery } from "./pages/public/EditorialGallery";
import { About } from "./pages/public/About";
import { Contact } from "./pages/public/Contact";
import { Stories } from "./pages/public/Stories";
import { StoryDetail } from "./pages/public/StoryDetail";
import { ItineraryDetail } from "./pages/public/ItineraryDetail";
import { FAQ } from "./pages/public/FAQ";
import { Reviews } from "./pages/public/Reviews";
import { Testimonials } from "./pages/public/Testimonials";
import { Privacy } from "./pages/public/Privacy";
import { Terms } from "./pages/public/Terms";
import { Login } from "./pages/system/Login";

// USER & SYSTEM
import { Dashboard } from "./pages/user/Dashboard";
import { Wishlist } from "./pages/user/Wishlist";
import { MyJourneyView } from "./pages/user/MyJourneyView";
import { Admin } from "./pages/system/Admin";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { AdminDialogProvider } from "./components/admin/AdminDialogContext";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Main Public Flow */}
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="packages" element={<Packages />} />
            <Route path="destinations" element={<Destinations />} />
            <Route path="destinations/:slug" element={<DestinationDetail />} />
            <Route path="itinerary/:id" element={<ItineraryDetail />} />
            <Route path="itineraries/:id" element={<ItineraryDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="gallery/:id" element={<EditorialGallery />} />

            {/* E13 Customer Stories */}
            <Route path="stories" element={<Stories />} />
            <Route path="stories/:slug" element={<StoryDetail />} />
            <Route path="blog" element={<Navigate to="/stories" replace />} />
            <Route path="blog/:slug" element={<Navigate to="/stories" replace />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="wishlist" element={<Wishlist />} />

            {/* E9 Booked Customer Journey View */}
            <Route
              path="my-journey/:bookingId"
              element={
                <ProtectedRoute>
                  <MyJourneyView />
                </ProtectedRoute>
              }
            />

            {/* Legal Pages */}
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />

            {/* Authentication */}
            <Route path="login" element={<Login />} />

            {/* Fallback - 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Admin Dashboard — outside MainLayout (no header/footer) */}
          <Route
            path="/admin"
            element={
              <ErrorBoundary fallbackTitle="Admin Workspace Diagnostics">
                <ProtectedRoute>
                  <AdminDialogProvider>
                    <Admin />
                  </AdminDialogProvider>
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}