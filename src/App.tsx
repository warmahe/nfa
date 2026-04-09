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
import { Testimonials } from "./pages/public/Testimonials";

// USER PAGES
import { Booking } from "./pages/user/Booking";
import { Wishlist } from "./pages/user/Wishlist";
import { PriceAlerts } from "./pages/user/PriceAlerts";
import { Dashboard } from "./pages/user/Dashboard";

// SYSTEM PAGES
import { Admin } from "./pages/system/Admin";


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
          
          {/* Gallery System */}
          <Route path="gallery" element={<Gallery />} />
          <Route path="gallery/:id" element={<EditorialGallery />} />
          
          {/* Content System */}
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="testimonials" element={<Testimonials />} />
          {/* User Secure Area */}
          <Route path="booking/:id" element={<Booking />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="price-alerts" element={<PriceAlerts />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Management */}
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}