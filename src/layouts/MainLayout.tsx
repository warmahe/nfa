import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change and auto scroll to top
  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  // Standardized clear navigation terms
  const navItems = [
    
    { label: "DESTINATIONS", href: "/destinations" },
    { label: "GALLERY", href: "/gallery" },
    { label: "BLOG", href: "/blog" },
    { label: "ABOUT", href: "/about" }
  ];

  return (
    <div className="min-h-screen bg-nfa-charcoal text-nfa-cream flex flex-col font-sans nfa-texture selection:bg-nfa-gold selection:text-nfa-charcoal">
      
      {/* ======================================= */}
      {/* GLOBAL NAVBAR (Strict h-20 for sizing)  */}
      {/* ======================================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#121212] border-b-[3px] border-[#9E1B1D]">
        <div className="w-full max-w-[1600px] mx-auto px-[clamp(1rem,4vw,3rem)] flex justify-between items-center h-full">
          
          {/* Brand/Logo Area */}
          <Link to="/" className="flex items-center gap-3 group relative z-[60]">
            <div className="bg-[#F4BF4B] w-6 h-6 rotate-45 flex items-center justify-center border-2 border-[#121212] group-hover:rotate-[135deg] transition-transform duration-500 ease-in-out"></div>
            <span className="font-brand font-black text-xl md:text-2xl text-[#FCFBF7] tracking-tighter uppercase leading-none mt-1">
              NO FIXED <br className="hidden lg:block"/><span className="text-[#F4BF4B]">ADDRESS.</span>
            </span>
          </Link>

          {/* Center Links (Desktop) */}
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

          {/* Right CTA & Mobile Toggle */}
          <div className="flex items-center h-full gap-4 relative z-[60]">
            <Link 
              to="/booking/oracle"
              className="hidden md:flex bg-[#F4BF4B] text-[#121212] px-6 lg:px-8 h-10 items-center text-[10px] lg:text-xs font-black uppercase tracking-widest border-2 border-[#121212] shadow-[3px_3px_0px_0px_#9E1B1D] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#9E1B1D] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
            >
              APPLY NOW
            </Link>
            
            <button 
              className="lg:hidden text-[#F4BF4B] p-1 -mr-2 bg-[#121212] border-2 border-transparent active:border-[#F4BF4B]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>

        {/* ======================================= */}
        {/* MOBILE DROPDOWN MENU (Brutalist panel) */}
        {/* ======================================= */}
        <div 
          className={`lg:hidden fixed top-20 left-0 w-full bg-[#121212] border-b-[6px] border-[#F4BF4B] overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] ${
            isMenuOpen ? 'max-h-[100svh] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col p-6 h-[calc(100vh-5rem)] pb-32">
            
            <span className="font-mono text-[#9E1B1D] text-[10px] uppercase font-bold tracking-[0.4em] mb-8 border-b-2 border-[#FCFBF7]/10 pb-4">
               MENU
            </span>

            <div className="flex flex-col gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname.includes(item.href) && item.href !== "/";
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`font-brand font-black text-4xl uppercase tracking-tighter transition-colors w-fit ${
                      isActive ? "text-[#F4BF4B]" : "text-[#FCFBF7] hover:text-[#9E1B1D]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-auto border-t-2 border-[#FCFBF7]/10 pt-8">
              <Link 
                to="/booking/oracle"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center bg-[#F4BF4B] text-[#121212] h-16 font-sans font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#9E1B1D] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                APPLY NOW
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ======================================= */}
      {/* MAIN ROUTER OUTLET                      */}
      {/* ======================================= */}
      {/* pt-20 exactly offsets the 5rem fixed navbar height we established. */}
      <main className="flex-1 w-full pt-20 flex flex-col relative z-0 bg-[#FCFBF7]">
        <Outlet />
      </main>

      {/* ======================================= */}
      {/* BRUTALIST FOOTER                        */}
      {/* ======================================= */}
      <footer className="border-t-[4px] border-[#121212] bg-[#FCFBF7] text-[#121212] relative z-10">
        <div className="w-full max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] py-16 lg:py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="lg:col-span-2">
            <h3 className="font-brand font-black text-5xl md:text-7xl text-[#121212] uppercase leading-[0.8] mb-6">No Fixed<br/><span className="text-[#9E1B1D]">Address.</span></h3>
            <p className="font-sans font-bold uppercase tracking-[0.1em] text-[10px] md:text-xs text-[#121212]/60 max-w-xs border-l-4 border-[#9E1B1D] pl-4">The world is not a map. It's a series of statements. Make yours.</p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F4BF4B] bg-[#121212] px-2 py-1 w-fit mb-2 shadow-[2px_2px_0_0_#9E1B1D]">NAVIGATION</h4>
            {navItems.map(i => (
              <Link key={i.href} to={i.href} className="font-sans text-xs uppercase font-bold tracking-widest text-[#121212] hover:text-[#9E1B1D] transition-colors">{i.label}</Link>
            ))}
            <Link to="/faq" className="font-sans text-xs uppercase font-bold tracking-widest text-[#121212] hover:text-[#9E1B1D] transition-colors">FAQ</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F4BF4B] bg-[#121212] px-2 py-1 w-fit mb-2 shadow-[2px_2px_0_0_#9E1B1D]">CONNECT</h4>
            <a href="#" className="font-sans text-xs uppercase font-bold tracking-widest text-[#121212] hover:text-[#9E1B1D] transition-colors">Instagram</a>
            <a href="#" className="font-sans text-xs uppercase font-bold tracking-widest text-[#121212] hover:text-[#9E1B1D] transition-colors">Twitter</a>
            <a href="mailto:hello@nofixedaddress.com" className="font-sans text-xs uppercase font-bold tracking-widest text-[#121212] hover:text-[#9E1B1D] transition-colors">Contact Us</a>
          </div>
        </div>

        {/* Footer Sub-Bar */}
        <div className="bg-[#121212] text-[#FCFBF7] border-t-2 border-[#FCFBF7]/10 px-[clamp(1rem,4vw,3rem)] py-6 flex flex-col md:flex-row justify-between text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase items-center text-center md:text-left gap-4">
          <p className="text-[#FCFBF7]/50">&copy; 2026 NO FIXED ADDRESS. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-[#F4BF4B] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#F4BF4B] transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default MainLayout;