import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { Home } from "./pages/public/Home";
import { Destinations } from "./pages/public/Destinations";
import { Gallery } from "./pages/public/Gallery";
import { EditorialGallery } from "./pages/public/EditorialGallery";
import { About } from "./pages/public/About";
import { Contact } from "./pages/public/Contact";
import { BlogPost as Blog } from "./pages/public/Blog";
import { PackageBrowse } from "./pages/public/PackageBrowse";
import ItineraryDetail from "./pages/public/ItineraryDetail";

import Booking from "./pages/user/Booking";
import { Wishlist } from "./pages/user/Wishlist";
import { PriceAlerts } from "./pages/user/PriceAlerts";
import { Dashboard } from "./pages/user/Dashboard";

import { Admin } from "./pages/system/Admin";

// Stubs for missing pages
const FAQ = () => <div>FAQ</div>;
const Testimonials = () => <div>Testimonials</div>;

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
          <Route path="blog/:slug" element={<Blog />} />
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