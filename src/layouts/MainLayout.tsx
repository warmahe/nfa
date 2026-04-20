import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
   const navigate = useNavigate();

   const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.location.reload(); // Refresh if already on home
    } else {
      navigate('/'); // Navigate home if on another page
    }
  };

  // Reset dropdown and enforce scrolling position natively upon URL/Path shifts
  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Standardized clear navigation terms
  const navItems = [
    { label: "ABOUT", href: "/about" },
    { label: "DESTINATIONS", href: "/destinations" },

    { label: "GALLERY", href: "/gallery" },
    { label: "CONTACT", href: "/contact" },
    { label: "BLOG", href: "/blog" },
    { label: "REVIEWS", href: "/reviews" }
  ];
  

  return (
    // FIX: Using robust 100dvh guarantees it stretches perfectly on iPhone and Android screens, protecting footer position. 
    // Isolate explicitly prevents DOM painting bleeding crashes
    <div className="relative min-h-[100dvh] flex flex-col bg-[#FCFBF7] font-sans nfa-texture selection:bg-nfa-gold selection:text-nfa-charcoal isolate w-full">
      
      {/* ======================================= */}
      {/* BULLETPROOF TOP GLOBAL NAVIGATION      */}
      {/* ======================================= */}
      <header className="fixed top-0 left-0 right-0 z-[999] w-full">
        
        {/* Main Navbar Layer */}
        <nav className="relative h-20 w-full bg-[#121212] border-b-[4px] border-[#9E1B1D] px-[clamp(1rem,4vw,3rem)] flex justify-between items-center z-[60] shadow-md">
          
          {/* Logo Area */}
          <button 
            onClick={handleLogoClick} 
            className="flex items-center group text-left cursor-pointer outline-none"
          >
            <img 
              src="/logo.svg" 
              alt="No Fixed Address" 
              className="h-10 w-auto md:h-12 transition-transform duration-500 group-hover:scale-105" 
            />
          </button>

          {/* Desktop Center Links */}
          <div className="hidden lg:flex gap-10 items-center justify-center absolute left-1/2 -translate-x-1/2 h-full">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.href) && item.href !== "/";
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all py-2 border-b-2 flex flex-col items-center gap-1 ${
                    isActive 
                      ? "text-[#F4BF4B] border-[#F4BF4B]" 
                      : "text-[#FCFBF7]/60 border-transparent hover:text-[#FCFBF7]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Action Call & Safe Mobile Toggle Menu */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Safe button toggle preventing misfires. Force updating UI based on boolean */}
            <button 
              className="lg:hidden flex items-center justify-center p-2 border-2 text-[#F4BF4B] bg-[#121212] active:bg-[#9E1B1D] active:text-[#FCFBF7] active:border-[#121212] transition-colors border-transparent active:border-[#F4BF4B]"
              onClick={() => setIsMenuOpen(prev => !prev)}
              aria-label="Open Site Menu"
            >
              {isMenuOpen ? <X size={28} className="drop-shadow" /> : <Menu size={28} className="drop-shadow" />}
            </button>
          </div>
        </nav>

        {/* 
          FIX: Mobile Drawer rebuilt entirely.
          Instead of broken maxHeight hacks causing lag, we physically eject this modal upwards and glide it into screen via absolute translates!
          Now impossible to miss close actions.
        */}
        <div 
          className={`lg:hidden fixed top-20 left-0 w-full bg-[#121212] border-b-[6px] border-[#F4BF4B] overflow-y-auto transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-[50] ${
            isMenuOpen ? 'translate-y-0 opacity-100 shadow-[0_20px_40px_rgba(0,0,0,0.5)]' : '-translate-y-[150%] opacity-0'
          }`}
          style={{ maxHeight: 'calc(100dvh - 80px)' }}
        >
          <div className="flex flex-col p-8 pb-32 w-full h-full min-h-[500px]">
            
            <span className="font-mono text-[#9E1B1D] text-[10px] uppercase font-bold tracking-[0.4em] mb-10 border-b-2 border-[#FCFBF7]/10 pb-4">
               SITE OPERATIONS MENU
            </span>

            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-brand font-black text-3xl sm:text-4xl uppercase tracking-tighter transition-colors w-fit border-l-4 pl-4 hover:border-[#F4BF4B] hover:text-[#FCFBF7] ${
                    (location.pathname.includes(item.href) && item.href !== "/") ? "border-[#9E1B1D] text-[#F4BF4B]" : "border-transparent text-[#FCFBF7]/70"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="mt-16 pt-8 w-full border-t border-[#FCFBF7]/10">
            
            </div>
          </div>
        </div>

      </header>

      {/* ======================================= */}
      {/* PAGE ROUTES RENDERING                  */}
      {/* ======================================= */}
      {/* FIX: Set dynamically safe flex margins. `<main>` will forcefully eject content to space downwards guaranteeing zero crashes on short routes. mt-20 securely handles strict fixed sizing */}
      <main className="flex-1 flex flex-col w-full mt-20 relative z-0">
        <Outlet />
      </main>

      {/* ======================================= */}
      {/* ROOT GLOBAL FOOTER                      */}
      {/* ======================================= */}
      {/* FIX: Dropped risky floating `relative z-10`. Applied strict DOM sequence layout formatting */}
      <footer className="w-full border-t-[6px] border-[#121212] bg-[#FCFBF7] text-[#121212] block">
        
        {/* Core Detail Grid Layout */}
        <div className="w-full max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="lg:col-span-2">
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="h-12 w-auto mb-6 grayscale brightness-0" 
            />
            <p className="font-sans font-bold uppercase tracking-[0.1em] text-[10px] md:text-xs text-[#121212]/60 max-w-[280px] border-l-[3px] border-[#9E1B1D] pl-4">
              The world is not a map. It's a series of statements. Make yours.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4BF4B] bg-[#121212] px-3 py-1.5 w-fit mb-4 shadow-[3px_3px_0_0_#9E1B1D]">NAVIGATION</h4>
            {navItems.map(i => (
              <Link key={i.href} to={i.href} className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D] transition-colors">{i.label}</Link>
            ))}
            <Link to="/faq" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D] transition-colors">FAQ</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4BF4B] bg-[#121212] px-3 py-1.5 w-fit mb-4 shadow-[3px_3px_0_0_#9E1B1D]">CONNECT</h4>
            <a href="https://www.instagram.com/nfa.people/" target="_blank" rel="noopener noreferrer" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D] transition-colors">Instagram</a>
            <a href="https://www.facebook.com/people/No-Fixed-Address/" target="_blank" rel="noopener noreferrer" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D] transition-colors">Facebook / X</a>
            <a href="https://x.com/NOFIXEDADDRESS" target="_blank" rel="noopener noreferrer" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D] transition-colors">Twitter / X</a>
            <a href="mailto:hello@nofixedaddress.com" target="_blank" rel="noopener noreferrer" className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-[#121212] hover:text-[#9E1B1D] transition-colors">Email Transmission</a>
          </div>
        </div>

        {/* Base Meta Information Bar */}
        <div className="bg-[#121212] text-[#FCFBF7] px-[clamp(1rem,4vw,3rem)] py-6 md:py-8 flex flex-col md:flex-row justify-between text-[8px] md:text-[10px] font-bold tracking-[0.25em] uppercase items-center text-center md:text-left gap-4 md:gap-0 mt-6 border-t-2 border-[#121212]">
          <p className="text-[#FCFBF7]/50 max-w-[200px] md:max-w-none mx-auto md:mx-0 leading-relaxed">&copy; 2026 NO FIXED ADDRESS INC. <br className="md:hidden"/> ALL RIGHTS SECURED.</p>
          <div className="flex gap-4 sm:gap-6 mt-2 md:mt-0 text-[#FCFBF7]">
            <Link to="/privacy" className="hover:text-[#F4BF4B] transition-colors">Privacy Framework</Link>
            <span className="opacity-30">|</span>
            <Link to="/terms" className="hover:text-[#F4BF4B] transition-colors">Terms of Operations</Link>
          </div>
        </div>

      </footer>
    </div>
  );
};

export default MainLayout;