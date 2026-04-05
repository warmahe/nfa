import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { Gallery } from "./pages/Gallery";
import { EditorialGallery } from "./pages/EditorialGallery";
import { PackageBrowse } from "./pages/PackageBrowse";
import { BlogPost } from "./pages/BlogPost";

// Use these placeholders to stop the build from crashing
import { 
  Destinations, Booking, About, Contact, Blog, FAQ, 
  Testimonials, Dashboard, Admin, Wishlist, PriceAlerts, ItineraryDetail 
} from "./pages/PlaceholderPages";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="destinations" element={<Destinations />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="gallery/:id" element={<EditorialGallery />} />
          <Route path="packages" element={<PackageBrowse />} />
          <Route path="itinerary/:id" element={<ItineraryDetail />} />
          <Route path="booking/:id" element={<Booking />} />
          <Route path="about" element={<About />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<Contact />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="price-alerts" element={<PriceAlerts />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}