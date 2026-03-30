import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Star, ArrowRight, MapPin, Calendar, Shield, CreditCard, Clock } from "lucide-react";
import { DESTINATIONS, PACKAGES, REVIEWS } from "../constants";

export const Home = () => {
  const [email, setEmail] = useState("");

  const services = [
    {
      icon: CreditCard,
      title: "Best Rates",
      description: "Competitive pricing with transparent costs and no hidden fees."
    },
    {
      icon: Shield,
      title: "Secure Booking",
      description: "Enterprise-level security protecting your travel plans."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock support whenever you need assistance."
    }
  ];

  return (
    <div className="bg-charcoal text-cream">
      {/* Hero Section */}
      <div className="relative pt-20 h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80" 
            alt="Adventure" 
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/40 to-charcoal/70" />
        </div>

        <div className="relative z-20 text-center max-w-5xl mx-auto px-6 w-full">
          <motion.h1 
            className="text-6xl md:text-7xl font-black leading-tight mb-6 text-cream"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            TRAVEL AND EXPLORE
          </motion.h1>

          {/* Search Box */}
          <motion.div 
            className="bg-white/95 rounded-2xl shadow-2xl max-w-3xl mx-auto p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 border-r border-gray-300 md:border-r">
                <MapPin size={20} className="text-gray-600" />
                <input 
                  type="text" 
                  placeholder="Where You Want to go" 
                  className="flex-1 bg-transparent outline-none text-charcoal placeholder-gray-400 text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2 border-r border-gray-300 md:border-r">
                <Calendar size={20} className="text-gray-600" />
                <input 
                  type="text" 
                  placeholder="Check-in" 
                  className="flex-1 bg-transparent outline-none text-charcoal placeholder-gray-400 text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2 border-r border-gray-300">
                <Calendar size={20} className="text-gray-600" />
                <input 
                  type="text" 
                  placeholder="Check-out" 
                  className="flex-1 bg-transparent outline-none text-charcoal placeholder-gray-400 text-sm"
                />
              </div>

              <button className="bg-red hover:bg-red/90 text-white font-bold rounded-lg px-6 py-2 flex items-center justify-center gap-2 transition-colors text-sm">
                <Search size={18} /> Explore
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Top Destinations */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <h2 className="text-4xl font-black text-center text-cream mb-4">Top Destinations</h2>
          <p className="text-center text-cream/60 mb-12 font-serif">Explore the world's most coveted travel experiences</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESTINATIONS.slice(0, 4).map((dest) => (
              <motion.div
                key={dest.id}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-charcoal mb-1">Trip To {dest.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dest.description}</p>
                  <p className="text-xs text-gray-500">10 Days Pricing</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* What People Say */}
      <section className="py-20 px-6 bg-charcoal/50 border-y border-gold/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center text-cream mb-16">What people say about Us.</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Featured Testimonial */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-gold mb-4">{REVIEWS[0]?.author}</h3>
                <p className="text-cream text-lg font-serif italic leading-relaxed">"{REVIEWS[0]?.content}"</p>
              </div>

              {/* Thumbnail Image */}
              <div className="h-64 rounded-2xl overflow-hidden shadow-xl border-4 border-gold/30">
                <img 
                  src={REVIEWS[0]?.avatar}
                  alt={REVIEWS[0]?.author}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-4">
                <img 
                  src={REVIEWS[0]?.avatar}
                  alt={REVIEWS[0]?.author}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full border-2 border-gold object-cover"
                />
                <div>
                  <p className="font-bold text-cream">{REVIEWS[0]?.author}</p>
                  <div className="flex gap-1">
                    {Array(5).fill(null).map((_, i) => (
                      <Star key={i} size={14} className="fill-gold text-gold" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - More Testimonials */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {REVIEWS.slice(1).map((review) => (
                <div key={review.id} className="bg-white/10 rounded-2xl p-6 backdrop-blur border border-gold/20">
                  <div className="flex items-center gap-4 mb-3">
                    <img 
                      src={review.avatar}
                      alt={review.author}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gold"
                    />
                    <div>
                      <p className="font-bold text-cream">{review.author}</p>
                      <div className="flex gap-1">
                        {Array(5).fill(null).map((_, i) => (
                          <Star key={i} size={12} className="fill-gold text-gold" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-cream/80 text-sm italic">"{review.content}"</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* We Offer Best Services */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <h2 className="text-4xl font-black text-center text-cream mb-16">We Offer Best Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-gold/30 hover:border-gold/60 transition-colors text-center"
                >
                  <div className="flex justify-center mb-6">
                    <div className="bg-red/20 p-4 rounded-full">
                      <Icon size={32} className="text-gold" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-cream mb-3">{service.title}</h3>
                  <p className="text-cream/70 text-sm">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Popular Tours Grid */}
      <section className="py-20 px-6 bg-charcoal/50 border-t border-gold/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center text-cream mb-4">Popular Tours & Packages</h2>
          <p className="text-center text-cream/60 mb-12">Handpicked travel experiences for the discerning explorer</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden border border-gold/30 hover:border-gold/60 transition-colors group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={pkg.image} 
                    alt={pkg.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-red text-white px-4 py-2 rounded-full text-sm font-bold">
                    {pkg.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-bold">{pkg.destination}</span>
                    <div className="flex items-center gap-1 text-gold">
                      <Star size={14} className="fill-gold" />
                      <span className="text-xs font-bold">{pkg.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-cream mb-2">{pkg.title}</h3>
                  <p className="text-cream/60 text-sm mb-4">{pkg.description}</p>
                  
                  <div className="flex items-center gap-2 text-cream/70 text-sm mb-6 pb-6 border-b border-gold/20">
                    <Calendar size={16} className="text-gold" />
                    <span>{pkg.duration}</span>
                  </div>

                  <Link 
                    to={`/itinerary/${pkg.id}`} 
                    className="w-full py-3 bg-gold text-charcoal font-bold text-center rounded-lg hover:bg-cream transition-colors flex items-center justify-center gap-2"
                  >
                    View Details <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 bg-charcoal border-t border-gold/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-cream mb-4">Subscribe to get information, latest news and other</h2>
          <p className="text-cream/60 mb-8">Interesting offers about us</p>
          
          <motion.div 
            className="flex gap-3 flex-col sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-3 rounded-lg bg-white text-charcoal placeholder-gray-400 outline-none focus:ring-2 focus:ring-gold"
            />
            <button className="px-8 py-3 bg-red hover:bg-red/90 text-white font-bold rounded-lg transition-colors">
              Subscribe
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
