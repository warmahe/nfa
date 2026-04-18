import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// PUBLIC PAGES
import { Home } from "./pages/public/Home";
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
import { Login } from "./pages/system/Login"; // Ensure this is imported

// USER & SYSTEM
import { Booking } from "./pages/user/Booking";
import { Dashboard } from "./pages/user/Dashboard";
import { Admin } from "./pages/system/Admin";
import { ProtectedRoute } from "./components/shared/ProtectedRoute"; // Ensure this is imported

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Main Public Flow */}
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="destinations" element={<Destinations />} />
          <Route path="itinerary/:id" element={<ItineraryDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="gallery/:id" element={<EditorialGallery />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Login Page */}
          <Route path="login" element={<Login />} />

          {/* User Secure Area */}
          <Route path="booking/:id" element={<Booking />} />

          {/* ADMIN AREA - THE FIX IS HERE */}
          <Route 
            path="admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
}