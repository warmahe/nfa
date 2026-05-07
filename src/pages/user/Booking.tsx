import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { User, Calendar, CreditCard, ArrowRight, ArrowLeft, Check, Info, Loader2, Zap, Video, Shield, Wallet } from "lucide-react";
import { getDocumentById, db } from "../../services/firebaseService";
import { setDoc, doc, Timestamp } from "firebase/firestore";
import { Package } from "../../types/database";
import { 
  loadRazorpayScript, 
  createPaymentOrder, 
  initiateCheckout,
  processPaymentSuccess,
  processPaymentFailure,
  getRazorpaySettings
} from "../../services/razorpayService";

type BookingMode = 'meeting' | 'reserve' | 'book';

export const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [bookingMode, setBookingMode] = useState<BookingMode | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [travelerCount, setTravelerCount] = useState(1);
  const [travelers, setTravelers] = useState([{ firstName: '', lastName: '', email: '', phone: '', age: '' }]);
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [bookingId, setBookingId] = useState('');
  const [razorpaySettings, setRazorpaySettings] = useState<any>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        const data = await getDocumentById<Package>('packages', id);
        setPkg(data);
        const queryTravelers = searchParams.get('travelers');
        const queryAddons = searchParams.get('addons');
        if (queryTravelers) setTravelerCount(parseInt(queryTravelers) || 1);
        if (queryAddons) setSelectedAddOns(queryAddons.split(',').filter(Boolean));
        
        // Fetch global Razorpay settings
        const settings = await getRazorpaySettings();
        setRazorpaySettings(settings);
      } catch (err) {
        console.error("Booking fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
    loadRazorpayScript().catch(err => console.error('Failed to load Razorpay script:', err));
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center">
         <Loader2 className="animate-spin text-[#9E1B1D]" size={40} />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center p-8 text-center">
         <h2 className="font-brand font-black text-4xl uppercase mb-4">Transmission Lost.</h2>
         <p className="font-sans font-bold text-xs uppercase tracking-widest text-gray-500 mb-8">The requested itinerary could not be retrieved.</p>
         <button onClick={() => navigate('/destinations')} className="bg-[#121212] text-[#F4BF4B] px-8 py-4 font-black text-xs uppercase tracking-[0.2em]">Return to Base</button>
      </div>
    );
  }
  
  const basePriceInt = pkg.pricing?.basePrice || 0;
  const insuranceOptions = (pkg?.insuranceOptions || []).filter((ins: any) => ins.active);
  const insuranceCost = insuranceOptions
    .filter((ins: any) => selectedInsurance.includes(ins.id))
    .reduce((sum: number, ins: any) => sum + ((ins.pricePerPerson || 0) * travelerCount), 0);
  const addOnsTotal = (pkg?.predefinedAddons || [])
    .filter((addon: any) => selectedAddOns.includes(addon.id))
    .reduce((sum: number, addon: any) => sum + (addon.price || 0), 0);
  const baseTotalPrice = (basePriceInt * travelerCount) + 150 + insuranceCost + addOnsTotal;
  const advancePaymentAmount = pkg.advancePaymentFixed || 
    (pkg.advancePaymentPercentage ? Math.round(baseTotalPrice * (pkg.advancePaymentPercentage / 100)) : Math.round(baseTotalPrice * 0.3));
  const totalInvestment = baseTotalPrice;
  
  // Amount to pay based on booking mode
  const payableAmount = bookingMode === 'meeting' ? 0 : bookingMode === 'reserve' ? advancePaymentAmount : totalInvestment;

  const handleTravelerChange = (index: number, field: string, value: string) => {
    const newTravelers = [...travelers];
    newTravelers[index] = { ...newTravelers[index], [field]: value };
    setTravelers(newTravelers);
  };

  const handleTravelerCountChange = (count: number) => {
    if (count < 1) return;
    setTravelerCount(count);
    setTravelers(prev => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill({ firstName: '', lastName: '', email: '', phone: '', age: '' })];
      }
      return prev.slice(0, count);
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!travelers[0].firstName || !travelers[0].lastName || !travelers[0].email || !travelers[0].phone || !travelers[0].age) {
        alert("Please fill all fields for the Lead Traveler including age.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(travelers[0].email)) {
        alert("Please enter a valid email address.");
        return;
      }
      const phoneRegex = /^[+]?[\d\s()-]{7,15}$/;
      if (!phoneRegex.test(travelers[0].phone)) {
        alert("Please enter a valid phone number (7-15 digits).");
        return;
      }
      const age = parseInt(travelers[0].age);
      if (isNaN(age) || age < 1 || age > 120) {
        alert("Please enter a valid age (1-120).");
        return;
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const createBookingDoc = async () => {
    const newBookingId = `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setBookingId(newBookingId);
    await setDoc(doc(db, 'bookings', newBookingId), {
      id: newBookingId,
      packageId: pkg.id,
      packageTitle: pkg.title,
      userId: 'guest',
      bookingType: bookingMode,
      travelers: travelers,
      numberOfTravelers: travelerCount,
      primaryTraveler: travelers[0],
      selectedAddOns: selectedAddOns,
      pricing: {
        currency: pkg.pricing?.currency || 'INR',
        basePricePerPerson: basePriceInt,
        basePriceTotal: basePriceInt * travelerCount,
        selectedInsurance, insuranceCost, addOnsTotal,
        serviceFee: 150,
        total: totalInvestment,
        amountPaid: bookingMode === 'meeting' ? 0 : payableAmount
      },
      payment: {
        status: bookingMode === 'meeting' ? 'not_required' : 'pending',
        method: bookingMode === 'meeting' ? 'none' : 'razorpay',
        razorpayOrderId: '', razorpayPaymentId: '',
        advancePaymentAmount: bookingMode === 'reserve' ? advancePaymentAmount : 0,
      },
      bookingStatus: bookingMode === 'meeting' ? 'meeting_requested' : 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return newBookingId;
  };

  const processMeetingBooking = async () => {
    setPaymentStatus('processing');
    try {
      await createBookingDoc();
      setPaymentStatus('success');
      setStep(4);
    } catch (err) {
      console.error("Meeting booking failed:", err);
      setPaymentStatus('pending');
      alert('Failed to book meeting. Please try again.');
    }
  };

  const processPayment = async () => {
    setPaymentStatus('processing');
    try {
      const newBookingId = await createBookingDoc();
      const amountInPaise = Math.round(payableAmount * 100);

      const paymentResponse = await createPaymentOrder(
        newBookingId, pkg.id, 'guest', amountInPaise,
        pkg.pricing?.currency || 'INR',
        bookingMode === 'reserve', pkg.advancePaymentPercentage, addOnsTotal
      );

      if (!paymentResponse.success || !paymentResponse.orderId) {
        throw new Error('Failed to create payment order');
      }

      const checkoutSuccess = await initiateCheckout({
        key: razorpaySettings?.keyId || 'rzp_test_1234567890123456',
        orderId: paymentResponse.orderId,
        amount: amountInPaise,
        currency: pkg.pricing?.currency || 'INR',
        userEmail: travelers[0].email,
        userName: `${travelers[0].firstName} ${travelers[0].lastName}`,
        userPhone: travelers[0].phone,
        bookingTitle: pkg.title,
        onSuccess: async (response: any) => {
          await processPaymentSuccess(
            paymentResponse.orderId, response.razorpay_payment_id,
            response.razorpay_signature, newBookingId
          );
          setPaymentStatus('success');
          setStep(4);
        },
        onFailure: async (error: any) => {
          await processPaymentFailure(
            paymentResponse.orderId, error.error?.code || 'UNKNOWN',
            error.error?.description || error.error || 'Payment failed', newBookingId
          );
          setPaymentStatus('pending');
          alert(`Payment failed: ${error.error?.description || error.error || 'Please try again'}`);
        }
      });

      if (!checkoutSuccess) {
        setPaymentStatus('pending');
        alert('Failed to initiate payment. Please try again.');
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setPaymentStatus('pending');
      alert(`Error: ${err instanceof Error ? err.message : 'Payment processing failed'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-20 px-[clamp(1rem,4vw,3rem)] nfa-texture selection:bg-nfa-gold">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-12 border-b-4 border-[#121212] pb-8">
           <h1 className="font-brand font-black text-4xl md:text-7xl uppercase tracking-tighter text-[#121212]">
             Trip <br/><span className="text-[#9E1B1D]">Registration.</span>
           </h1>
           {step > 0 && (
           <div className="flex gap-4 mt-10 overflow-x-auto pb-2">
              {[
                { n: 1, label: "Your Details", icon: User },
                { n: 2, label: "Trip Review", icon: Calendar },
                { n: 3, label: bookingMode === 'meeting' ? "Confirm" : "Payment", icon: CreditCard }
              ].map((s) => (
                <div key={s.n} className={`flex items-center gap-3 shrink-0 transition-all ${step >= s.n ? 'opacity-100' : 'opacity-30'}`}>
                   <div className={`size-10 border-2 border-[#121212] flex items-center justify-center font-black ${step >= s.n ? 'bg-[#F4BF4B]' : 'bg-white'}`}>
                      {step > s.n ? <Check size={18}/> : s.n}
                   </div>
                   <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">{s.label}</span>
                   {s.n < 3 && <div className="w-8 h-0.5 bg-[#121212]/20 mx-2 hidden md:block" />}
                </div>
              ))}
           </div>
           )}
        </header>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-brand font-black text-3xl md:text-4xl uppercase tracking-tight text-[#121212]">How would you like to proceed?</h2>
              <p className="font-bold text-xs uppercase tracking-widest text-[#121212]/50 mt-3">Select your preferred booking option for <span className="text-[#9E1B1D]">{pkg.title}</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Book a Meeting */}
              <button onClick={() => { setBookingMode('meeting'); setStep(1); }} className="group text-left border-4 border-[#121212] p-8 bg-white hover:bg-[#F4BF4B] transition-all shadow-[6px_6px_0_0_#121212] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                <Video size={32} className="text-[#9E1B1D] mb-6" />
                <h3 className="font-brand font-black text-xl uppercase tracking-tight mb-3">Book a Meeting</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/60 leading-relaxed mb-6">Schedule a call with our team to discuss trip details, itinerary customization & more.</p>
                <div className="border-t-2 border-[#121212]/10 pt-4">
                  <span className="font-brand font-black text-2xl text-[#121212]">FREE</span>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#121212]/40 mt-1">No payment required</p>
                </div>
              </button>
              {/* Reserve the Slot */}
              <button onClick={() => { setBookingMode('reserve'); setStep(1); }} className="group text-left border-4 border-[#121212] p-8 bg-white hover:bg-[#F4BF4B] transition-all shadow-[6px_6px_0_0_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 relative">
                <div className="absolute -top-3 -right-3 bg-[#9E1B1D] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1">Popular</div>
                <Shield size={32} className="text-[#9E1B1D] mb-6" />
                <h3 className="font-brand font-black text-xl uppercase tracking-tight mb-3">Reserve Slot</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/60 leading-relaxed mb-6">Secure your spot with a partial advance payment. Pay the rest before departure.</p>
                <div className="border-t-2 border-[#121212]/10 pt-4">
                  <span className="font-brand font-black text-2xl text-[#9E1B1D]">₹{advancePaymentAmount.toLocaleString()}</span>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#121212]/40 mt-1">Advance payment</p>
                </div>
              </button>
              {/* Book Slot */}
              <button onClick={() => { setBookingMode('book'); setStep(1); }} className="group text-left border-4 border-[#121212] p-8 bg-[#121212] text-white hover:bg-[#9E1B1D] transition-all shadow-[6px_6px_0_0_#F4BF4B] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                <Wallet size={32} className="text-[#F4BF4B] mb-6" />
                <h3 className="font-brand font-black text-xl uppercase tracking-tight mb-3">Book Slot</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-relaxed mb-6">Complete your booking with full payment. Get instant confirmation & priority support.</p>
                <div className="border-t-2 border-white/20 pt-4">
                  <span className="font-brand font-black text-2xl text-[#F4BF4B]">₹{totalInvestment.toLocaleString()}</span>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">Full payment</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {step > 0 && step < 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="font-brand font-black text-3xl uppercase tracking-tight">Traveler Information</h2>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-[10px] uppercase tracking-widest text-[#121212]/60">Travelers</span>
                      <div className="flex items-center border-2 border-[#121212]">
                        <button onClick={() => handleTravelerCountChange(travelerCount - 1)} className="px-3 py-1 bg-[#FCFBF7] hover:bg-[#121212] hover:text-white transition-colors">-</button>
                        <span className="px-4 font-bold">{travelerCount}</span>
                        <button onClick={() => handleTravelerCountChange(travelerCount + 1)} className="px-3 py-1 bg-[#FCFBF7] hover:bg-[#121212] hover:text-white transition-colors">+</button>
                      </div>
                    </div>
                  </div>

                  {travelers.map((traveler, index) => (
                    <div key={index} className="pl-6 border-l-4 border-[#121212] mb-8 pb-4">
                      <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-[#9E1B1D]">
                        {index === 0 ? 'Lead Traveler' : `Traveler ${index + 1}`}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="flex flex-col gap-2">
                           <label className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">First Name</label>
                           <input type="text" value={traveler.firstName} onChange={(e) => handleTravelerChange(index, 'firstName', e.target.value)} placeholder="John" className="bg-white border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#FCFBF7] focus:shadow-[4px_4px_0_0_#F4BF4B] transition-all" />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Last Name</label>
                           <input type="text" value={traveler.lastName} onChange={(e) => handleTravelerChange(index, 'lastName', e.target.value)} placeholder="Doe" className="bg-white border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#FCFBF7] focus:shadow-[4px_4px_0_0_#F4BF4B] transition-all" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {index === 0 && (
                          <>
                          <div className="flex flex-col gap-2">
                             <label className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Email Address</label>
                             <input type="email" value={traveler.email} onChange={(e) => handleTravelerChange(index, 'email', e.target.value)} placeholder="john@example.com" pattern="[^\\s@]+@[^\\s@]+\\.[^\\s@]+" className="bg-white border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#FCFBF7] focus:shadow-[4px_4px_0_0_#F4BF4B] transition-all" />
                          </div>
                          <div className="flex flex-col gap-2">
                             <label className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Phone Number</label>
                             <input type="tel" value={traveler.phone} onChange={(e) => handleTravelerChange(index, 'phone', e.target.value)} placeholder="+91 98765 43210" pattern="[+]?[\\d\\s()-]{7,15}" className="bg-white border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#FCFBF7] focus:shadow-[4px_4px_0_0_#F4BF4B] transition-all" />
                          </div>
                          </>
                        )}
                        <div className="flex flex-col gap-2">
                           <label className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Age</label>
                           <input type="number" min="1" max="120" value={traveler.age} onChange={(e) => handleTravelerChange(index, 'age', e.target.value)} placeholder="25" className="bg-white border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#FCFBF7] focus:shadow-[4px_4px_0_0_#F4BF4B] transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button onClick={nextStep} className="w-full md:w-fit bg-[#121212] text-[#F4BF4B] px-12 py-5 font-black text-xs uppercase tracking-widest border-2 border-[#121212] shadow-[6px_6px_0_0_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                     Continue To Review
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                   <h2 className="font-brand font-black text-3xl uppercase tracking-tight mb-8">Confirm Details & Extras</h2>
                   <div className="border-4 border-[#121212] bg-[#F4BF4B] p-8 shadow-[8px_8px_0_0_#121212] mb-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                           <p className="text-[10px] font-black uppercase opacity-60 mb-1">Trip Name</p>
                           <h3 className="font-brand font-black text-3xl uppercase leading-none">{pkg.title}</h3>
                        </div>
                        <span className="bg-[#121212] text-white px-3 py-1 font-black text-[9px] uppercase tracking-widest">{travelerCount} Travelers</span>
                      </div>
                      <div className="grid grid-cols-2 gap-8 border-t-2 border-[#121212]/10 pt-6">
                         <div>
                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Check In</p>
                            <p className="font-bold uppercase tracking-widest text-sm">Oct 15, 2026</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Check Out</p>
                            <p className="font-bold uppercase tracking-widest text-sm">Oct 20, 2026</p>
                         </div>
                      </div>
                   </div>

                   {/* Insurance Options */}
                   {insuranceOptions.length > 0 && (
                     <div className="border-2 border-[#121212] p-6 space-y-4 bg-white">
                       <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                         <Check size={14} /> Expedition Insurance
                       </h4>
                       <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Select the coverage plans you need. Prices are per traveler.</p>
                       <div className="space-y-3">
                         {insuranceOptions.map((ins: any) => (
                           <label key={ins.id} className={`flex items-start gap-3 cursor-pointer p-3 rounded transition-all border-2 ${selectedInsurance.includes(ins.id) ? 'border-[#F4BF4B] bg-[#F4BF4B]/10' : 'border-transparent hover:bg-[#FCFBF7]'}`}>
                             <input
                               type="checkbox"
                               checked={selectedInsurance.includes(ins.id)}
                               onChange={(e) => {
                                 if (e.target.checked) setSelectedInsurance([...selectedInsurance, ins.id]);
                                 else setSelectedInsurance(selectedInsurance.filter(id => id !== ins.id));
                               }}
                               className="w-4 h-4 border-2 border-[#121212] rounded accent-[#F4BF4B] mt-1"
                             />
                             <div className="flex-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]">{ins.name}</p>
                               {ins.description && <p className="text-[8px] text-gray-600 mt-1">{ins.description}</p>}
                               <p className="text-[9px] font-bold text-[#9E1B1D] mt-2">₹{ins.pricePerPerson}/person × {travelerCount} = ₹{(ins.pricePerPerson * travelerCount).toLocaleString()}</p>
                             </div>
                           </label>
                         ))}
                       </div>
                       {selectedInsurance.length > 0 && (
                         <div className="pt-3 border-t border-dashed border-[#121212]/20 flex justify-between text-xs font-black uppercase tracking-tight">
                           <span>Insurance Total</span>
                           <span className="text-[#9E1B1D]">₹{insuranceCost.toLocaleString()}</span>
                         </div>
                       )}
                     </div>
                   )}

                   {/* Fallback if no admin insurance configured */}
                   {insuranceOptions.length === 0 && (
                     <div className="border-2 border-[#121212]/20 p-6 bg-[#FCFBF7] text-center">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/40">No insurance options configured for this package</p>
                     </div>
                   )}

                   {(pkg?.predefinedAddons?.length > 0) && (
                     <div className="border-2 border-[#121212] p-6 space-y-4">
                       <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                         <Zap size={14} /> Optional Add-ons
                       </h4>
                       <div className="space-y-3">
                         {pkg.predefinedAddons.map((addon: any) => (
                           <label key={addon.id} className="flex items-start gap-3 cursor-pointer hover:bg-[#FCFBF7] p-2 rounded transition-colors">
                             <input
                               type="checkbox"
                               checked={selectedAddOns.includes(addon.id)}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setSelectedAddOns([...selectedAddOns, addon.id]);
                                 } else {
                                   setSelectedAddOns(selectedAddOns.filter(id => id !== addon.id));
                                 }
                               }}
                               className="w-4 h-4 border-2 border-[#121212] rounded accent-[#F4BF4B] mt-1"
                             />
                             <div className="flex-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]">{addon.name}</p>
                               {addon.description && <p className="text-[8px] text-gray-600 mt-1">{addon.description}</p>}
                               <p className="text-[9px] font-bold text-[#9E1B1D] mt-2">+₹{addon.price}</p>
                             </div>
                           </label>
                         ))}
                       </div>
                     </div>
                   )}

                   <div className="flex gap-4">
                      <button onClick={prevStep} className="p-5 border-2 border-[#121212] hover:bg-white transition-colors">
                         <ArrowLeft size={20}/>
                      </button>
                      <button onClick={nextStep} className="flex-1 bg-[#121212] text-[#F4BF4B] py-5 font-black text-xs uppercase tracking-widest border-2 border-[#121212] shadow-[6px_6px_0_0_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                         {bookingMode === 'meeting' ? 'Confirm Meeting Request' : 'Proceed To Payment'}
                      </button>
                   </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                   {bookingMode === 'meeting' ? (
                     <>
                       <h2 className="font-brand font-black text-3xl uppercase tracking-tight mb-8">Confirm Meeting</h2>
                       <div className="bg-[#F4BF4B]/20 border-2 border-[#F4BF4B] p-6 rounded">
                         <p className="text-[10px] font-black uppercase tracking-widest text-[#121212] mb-2">📞 Free Consultation Call</p>
                         <p className="text-[9px] text-[#121212]/70 leading-relaxed">Our team will reach out to discuss trip details, customize your itinerary, answer questions, and help you plan. No payment is required at this stage.</p>
                       </div>
                       <div className="flex gap-4">
                         <button onClick={prevStep} className="p-5 border-2 border-[#121212] hover:bg-white transition-colors"><ArrowLeft size={20}/></button>
                         <button onClick={processMeetingBooking} disabled={paymentStatus === 'processing'} className="flex-1 bg-[#121212] text-[#F4BF4B] py-5 font-black text-xs uppercase tracking-widest border-2 border-[#121212] shadow-[6px_6px_0_0_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                           {paymentStatus === 'processing' ? <><Loader2 className="animate-spin" size={16}/> Submitting...</> : 'Book Meeting — Free'}
                         </button>
                       </div>
                     </>
                   ) : (
                     <>
                       <h2 className="font-brand font-black text-3xl uppercase tracking-tight mb-8">
                         {bookingMode === 'reserve' ? 'Reserve Your Slot' : 'Complete Payment'}
                       </h2>
                       <div className="bg-blue-50 border-2 border-blue-400 p-6 rounded">
                         <p className="text-[10px] font-black uppercase tracking-widest text-blue-900 mb-2">💳 Razorpay Secure Payment</p>
                         <p className="text-[9px] text-blue-800">
                           {bookingMode === 'reserve' 
                             ? `Pay ₹${payableAmount.toLocaleString()} as advance to reserve your slot. Remaining ₹${(totalInvestment - payableAmount).toLocaleString()} due before departure.`
                             : `Pay the full amount of ₹${payableAmount.toLocaleString()} to confirm your booking instantly.`}
                         </p>
                       </div>
                       <div className="flex gap-4">
                         <button onClick={prevStep} disabled={paymentStatus === 'processing'} className="p-5 border-2 border-[#121212] hover:bg-white transition-colors disabled:opacity-50"><ArrowLeft size={20}/></button>
                         <button onClick={processPayment} disabled={paymentStatus === 'processing'} className="flex-1 bg-[#9E1B1D] text-white py-5 font-black text-xs uppercase tracking-widest border-2 border-[#121212] shadow-[6px_6px_0_0_#121212] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                           {paymentStatus === 'processing' ? <><Loader2 className="animate-spin" size={16}/> Processing...</> : `Pay ₹${payableAmount.toLocaleString()}`}
                         </button>
                       </div>
                     </>
                   )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-5 sticky top-28">
             <div className="border-[4px] border-[#121212] bg-white p-8 shadow-[12px_12px_0_0_#121212]">
                {/* Booking mode badge */}
                {bookingMode && (
                  <div className={`mb-4 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest inline-block ${
                    bookingMode === 'meeting' ? 'bg-[#F4BF4B]/20 text-[#121212]' : bookingMode === 'reserve' ? 'bg-[#9E1B1D]/10 text-[#9E1B1D]' : 'bg-[#121212] text-[#F4BF4B]'
                  }`}>
                    {bookingMode === 'meeting' ? '📞 Meeting' : bookingMode === 'reserve' ? '🛡️ Reservation' : '✅ Full Booking'}
                  </div>
                )}
                <h4 className="font-black text-xs uppercase tracking-[0.3em] text-[#9E1B1D] mb-8 border-b-2 border-gray-100 pb-4 flex items-center gap-3">
                   <Info size={16}/> Summary Ledger
                </h4>
                
                <div className="space-y-6">
                   <div className="flex gap-6 items-center">
                      <div className="size-20 border-2 border-[#121212] bg-[#121212] shrink-0 overflow-hidden">
                         <img src={pkg.media?.thumbnail} className="w-full h-full object-cover opacity-80" alt="summary"/>
                      </div>
                      <div>
                         <p className="font-black text-xs uppercase tracking-tight">{pkg.title}</p>
                         <p className="font-bold text-[9px] uppercase tracking-widest text-[#121212]/40 mt-1">{pkg.duration} // {pkg.destinations?.[0]}</p>
                      </div>
                   </div>

                   <div className="pt-6 border-t-2 border-dashed border-[#121212]/10 space-y-4">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight opacity-60">
                         <span>Base Cost (x{travelerCount})</span>
                         <span>₹{(basePriceInt * travelerCount).toLocaleString()}</span>
                      </div>
                      {selectedInsurance.length > 0 && (
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tight opacity-60">
                           <span>Insurance ({selectedInsurance.length} plan{selectedInsurance.length > 1 ? 's' : ''})</span>
                           <span>₹{insuranceCost.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight opacity-60">
                         <span>Registry Fee</span>
                         <span>₹150</span>
                      </div>
                      {addOnsTotal > 0 && (
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tight opacity-60">
                           <span>Add-ons Total</span>
                           <span>₹{addOnsTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-end pt-6 border-t-2 border-[#121212]">
                         <span className="font-black text-sm uppercase tracking-widest">Total</span>
                         <span className="font-brand font-black text-4xl text-[#9E1B1D]">₹{totalInvestment.toLocaleString()}</span>
                      </div>
                      {bookingMode === 'meeting' && step >= 3 && (
                        <div className="mt-4 pt-4 border-t-2 border-[#121212] bg-[#F4BF4B]/10 p-4 rounded">
                          <p className="font-black text-xs uppercase tracking-widest text-[#121212]">No Payment Required</p>
                          <p className="text-[8px] text-[#121212]/60 mt-2">You'll discuss pricing details during the meeting</p>
                        </div>
                      )}
                      {bookingMode === 'reserve' && step >= 3 && (
                        <div className="mt-4 pt-4 border-t-2 border-[#121212] bg-blue-50 p-4 rounded">
                          <div className="flex justify-between items-end">
                            <span className="font-black text-xs uppercase tracking-widest">Advance Due</span>
                            <span className="font-brand font-black text-3xl text-blue-600">₹{advancePaymentAmount.toLocaleString()}</span>
                          </div>
                          <p className="text-[8px] text-blue-600 mt-2">Balance: ₹{(totalInvestment - advancePaymentAmount).toLocaleString()}</p>
                        </div>
                      )}
                      {bookingMode === 'book' && step >= 3 && (
                        <div className="mt-4 pt-4 border-t-2 border-[#121212] bg-emerald-50 p-4 rounded">
                          <div className="flex justify-between items-end">
                            <span className="font-black text-xs uppercase tracking-widest">Pay Now</span>
                            <span className="font-brand font-black text-3xl text-emerald-600">₹{totalInvestment.toLocaleString()}</span>
                          </div>
                          <p className="text-[8px] text-emerald-600 mt-2">Full payment — instant confirmation</p>
                        </div>
                      )}
                   </div>
                </div>

                <div className="mt-10 p-4 bg-[#FCFBF7] border border-dashed border-[#121212]/20 text-[9px] font-bold uppercase tracking-widest leading-relaxed text-gray-400">
                   By completing this form, you acknowledge that NFA trips are physically demanding and require a non-tourist mindset.
                </div>
             </div>
          </div>
        </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-12 border-[4px] border-[#121212] bg-white p-12 shadow-[12px_12px_0_0_#F4BF4B] max-w-2xl mx-auto">
             <div className={`size-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0_0_#9E1B1D] ${
               bookingMode === 'meeting' ? 'bg-[#F4BF4B] text-[#121212]' : 'bg-[#121212] text-[#F4BF4B]'
             }`}>
                {bookingMode === 'meeting' ? <Video size={48} strokeWidth={2}/> : <Check size={48} strokeWidth={3}/>}
             </div>
             <h2 className="font-brand font-black text-4xl md:text-5xl uppercase tracking-tight mb-4 text-[#121212]">
               {bookingMode === 'meeting' ? 'Meeting Booked!' : bookingMode === 'reserve' ? 'Slot Reserved!' : 'Slot Booked!'}
             </h2>
             <p className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/60 mb-4 max-w-md mx-auto">
               {bookingMode === 'meeting' 
                 ? 'Your meeting has been scheduled. Our team will reach out to you via email shortly to discuss trip details and itinerary customization.'
                 : bookingMode === 'reserve'
                 ? 'Your slot has been reserved! You will receive a confirmation email shortly with payment receipt and next steps. Balance payment is due before departure.'
                 : 'Your slot is fully booked and confirmed! You will receive a confirmation email with your complete trip details and documents.'}
             </p>
             <p className="font-sans font-bold text-[9px] uppercase tracking-widest text-[#121212]/40 mb-12 max-w-md mx-auto">Booking ID: {bookingId}</p>
             <button onClick={() => navigate('/dashboard')} className="w-full bg-[#121212] text-[#F4BF4B] py-6 font-black text-sm uppercase tracking-widest shadow-[8px_8px_0_0_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                ACCESS DASHBOARD
             </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Booking;
