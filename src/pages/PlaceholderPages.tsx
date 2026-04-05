import React from 'react';

const Base = ({ title }: { title: string }) => (
  <div className="pt-24 text-center min-h-screen"><h1>{title}</h1></div>
);

export const Destinations = () => <Base title="Destinations" />;
export const Booking = () => <Base title="Booking" />;
export const About = () => <Base title="About" />;
export const Contact = () => <Base title="Contact" />;
export const Blog = () => <Base title="Blog" />;
export const FAQ = () => <Base title="FAQ" />;
export const Testimonials = () => <Base title="Testimonials" />;
export const Dashboard = () => <Base title="Dashboard" />;
export const Admin = () => <Base title="Admin" />;
export const Wishlist = () => <Base title="Wishlist" />;
export const PriceAlerts = () => <Base title="Price Alerts" />;
export const ItineraryDetail = () => <Base title="Itinerary" />;