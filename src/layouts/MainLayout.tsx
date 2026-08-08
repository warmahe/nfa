import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Exact Navigation Header requested
  const navItems = [
    { label: "ABOUT", href: "/about" },
    { label: "ITINERARIES", href: "/packages" },
    { label: "DESTINATIONS", href: "/destinations" },
    { label: "STORIES", href: "/stories" },
    { label: "CONTACT", href: "/contact" },
    { label: "BLOG", href: "/blog" }
  ];

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[#FCFBF7] font-sans nfa-texture selection:bg-[#F4BF4B] selection:text-[#121212] isolate w-full">
      <header className="fixed top-0 left-0 right-0 z-[999] w-full">
        <nav className="relative h-20 w-full bg-[#121212] border-b-[4px] border-[#9E1B1D] px-[clamp(1rem,4vw,3rem)] flex justify-between items-center z-[60] shadow-md">
          <button onClick={handleLogoClick} className="flex items-center group text-left cursor-pointer outline-none">
            <img src="/logo.svg" alt="No Fixed Address" className="h-10 w-auto md:h-12 transition-transform duration-500 group-hover:scale-105" />
          </button>

          <div className="hidden lg:flex gap-10 items-center justify-center absolute left-1/2 -translate-x-1/2 h-full">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all py-2 border-b-2 flex flex-col items-center gap-1 ${location.pathname.includes(item.href) && item.href !== "/"
                    ? "text-[#F4BF4B] border-[#F4BF4B]"
                    : "text-[#FCFBF7]/60 border-transparent hover:text-[#FCFBF7]"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              className="lg:hidden flex items-center justify-center p-2 text-[#F4BF4B] bg-[#121212] transition-colors"
              onClick={() => setIsMenuOpen(prev => !prev)}
              aria-label="Open Navigation Menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        <div className={`lg:hidden fixed top-20 left-0 w-full bg-[#121212] border-b-[6px] border-[#F4BF4B] overflow-y-auto transform transition-transform duration-500 z-[50] ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0'
          }`}>
          <div className="flex flex-col p-8 pb-32 gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="font-brand font-black text-3xl uppercase tracking-tighter text-[#FCFBF7]/80 hover:text-[#F4BF4B]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full mt-20 relative z-0">
        <Outlet />
      </main>

      <footer className="w-full border-t-[6px] border-[#121212] bg-[#FCFBF7] text-[#121212]">
        <div className="w-full max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img src="/logo.svg" alt="Logo" className="h-10 w-auto mb-6 grayscale brightness-0" />
            <p className="font-sans font-bold uppercase tracking-[0.1em] text-[10px] text-[#121212]/60 max-w-[280px]">
              Built from scratch. Not for tourists.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4BF4B] bg-[#121212] px-3 py-1 w-fit mb-2">NAVIGATION</h4>
            {navItems.map(i => (
              <Link key={i.href} to={i.href} className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D]">{i.label}</Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4BF4B] bg-[#121212] px-3 py-1 w-fit mb-2">INFORMATION</h4>
            <Link to="/faq" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D]">FAQ</Link>
            <Link to="/privacy" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D]">Privacy Policy</Link>
            <Link to="/terms" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D]">Terms of Operations</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4BF4B] bg-[#121212] px-3 py-1 w-fit mb-2">CONNECT</h4>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212]">Instagram</a>
            <a href="mailto:hello@nofixedaddress.cc" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212]">Contact Us</a>
          </div>
        </div>

        <div className="bg-[#121212] text-[#FCFBF7] px-[clamp(1rem,4vw,3rem)] py-6 flex flex-col md:flex-row justify-between text-[9px] font-bold tracking-[0.2em] uppercase items-center">
          <p>&copy; 2026 NO FIXED ADDRESS INC. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;