import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { label: "MANIFESTO", href: "/about" },
    { label: "EXPEDITIONS", href: "/destinations" },
    { label: "TIMELINE", href: "/packages" },
    { label: "COLLECTIVE", href: "/testimonials" }
  ];

  return (
    <div className="min-h-screen bg-nfa-charcoal text-nfa-cream flex flex-col font-sans nfa-texture selection:bg-nfa-gold selection:text-nfa-charcoal">
      {/* Brutalist Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-nfa-gold/20 bg-nfa-charcoal">
        <div className="w-full px-4 md:px-8 flex justify-between items-center h-20">
          
          {/* Brand/Logo Area */}
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-nfa-gold w-6 h-6 rotate-45 flex items-center justify-center border-2 border-nfa-charcoal outline outline-1 outline-nfa-gold/30"></div>
            <span className="font-brand font-black text-xl md:text-2xl text-nfa-gold tracking-tight uppercase">No Fixed Address</span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex gap-8 lg:gap-16 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] text-nfa-cream/70 hover:text-nfa-gold transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right CTA / Mobile Toggle */}
          <div className="flex items-center">
            <Link 
              to="/booking/oracle"
              className="hidden md:flex bg-nfa-gold text-nfa-charcoal px-6 lg:px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-nfa-cream transition-colors"
            >
              Join the Expedition
            </Link>
            <button 
              className="md:hidden text-nfa-gold p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] border-b border-nfa-gold/20' : 'max-h-0'}`}>
          <div className="bg-nfa-charcoal p-6 flex flex-col gap-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-bold uppercase tracking-widest text-nfa-cream hover:text-nfa-gold transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link 
              to="/booking/oracle"
              className="w-full text-center bg-nfa-gold text-nfa-charcoal px-8 py-4 text-sm font-black uppercase tracking-widest mt-4"
            >
              Join the Expedition
            </Link>
          </div>
        </div>
      </nav>

      {/* Padding to account for fixed navbar */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Brutalist Footer */}
      <footer className="border-t border-white/10 bg-nfa-charcoal text-nfa-cream">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <h3 className="font-brand font-black text-5xl md:text-6xl text-nfa-gold uppercase leading-none mb-6">No Fixed<br/>Address.</h3>
            <p className="font-brand italic text-lg md:text-xl text-nfa-cream/60 max-w-sm">The world is not a map. It's a series of statements. Make yours.</p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-nfa-gold mb-2">Navigation</h4>
            {navItems.map(i => <Link key={i.href} to={i.href} className="text-sm font-medium hover:text-nfa-gold transition-colors">{i.label}</Link>)}
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-nfa-gold mb-2">Connect</h4>
            <a href="#" className="text-sm font-medium hover:text-nfa-gold transition-colors">Instagram</a>
            <a href="#" className="text-sm font-medium hover:text-nfa-gold transition-colors">Twitter</a>
            <a href="#" className="text-sm font-medium hover:text-nfa-gold transition-colors">Substack</a>
            <a href="mailto:hello@nfa.com" className="text-sm font-medium hover:text-nfa-gold transition-colors">Contact</a>
          </div>
        </div>
        <div className="border-t border-white/5 px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between text-[10px] font-medium tracking-wider text-nfa-cream/40 uppercase">
          <p>&copy; 2026 NO FIXED ADDRESS COLLECTIVE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;