import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { PackageBrowse } from "./pages/PackageBrowse";
import { Wishlist } from "./pages/Wishlist";
import { PriceAlerts } from "./pages/PriceAlerts";
import { Gallery } from "./pages/Gallery";
import { BlogPost } from "./pages/BlogPost";
import {
  Destinations,
  ItineraryDetail,
  Booking,
  About,
  Contact,
  Blog,
  FAQ,
  Testimonials,
  Dashboard,
  Admin
} from "./pages/Pages";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="packages" element={<PackageBrowse />} />
          <Route path="destinations" element={<Destinations />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="itinerary/:id" element={<ItineraryDetail />} />
          <Route path="booking/:id" element={<Booking />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="price-alerts" element={<PriceAlerts />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}
