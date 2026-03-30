import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PACKAGES } from "../constants";
import { Check, ArrowRight, ShieldCheck, CreditCard, ChevronRight, AlertCircle, CheckCircle, Plus, Trash2, Download } from "lucide-react";
import { motion } from "motion/react";
import { sendBookingConfirmationEmail } from "../services/emailService";
import { downloadBookingConfirmation } from "../services/pdfService";

interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function Booking() {
  const { id } = useParams<{ id: string }>();
  const pkg = PACKAGES.find(p => p.id === id) || PACKAGES[0];
  const [step, setStep] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending");
  const [bookingId, setBookingId] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);

  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: "1", firstName: "", lastName: "", email: "", phone: "" }
  ]);

  const [formData, setFormData] = useState({
    insurance: true,
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  // Update travelers array when numberOfTravelers changes
  const handleTravelersCountChange = (count: number) => {
    setNumberOfTravelers(count);
    const currentTravelers = [...travelers].slice(0, count);
    
    // Add new empty travelers if needed
    for (let i = currentTravelers.length; i < count; i++) {
      currentTravelers.push({
        id: `${i + 1}`,
        firstName: "",
        lastName: "",
        email: i === 0 ? "" : "",
        phone: i === 0 ? "" : ""
      });
    }
    
    setTravelers(currentTravelers);
  };

  const handleTravelerChange = (travelerId: string, field: string, value: string) => {
    setTravelers(
      travelers.map(t =>
        t.id === travelerId ? { ...t, [field]: value } : t
      )
    );
    // Clear error for this field when user starts typing
    if (errors[`${travelerId}-${field}`]) {
      setErrors({ ...errors, [`${travelerId}-${field}`]: "" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validation for travelers
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate each traveler
    travelers.forEach((traveler) => {
      if (!traveler.firstName.trim()) newErrors[`${traveler.id}-firstName`] = "First name is required";
      if (!traveler.lastName.trim()) newErrors[`${traveler.id}-lastName`] = "Last name is required";
      
      // Email and phone only required for first traveler
      if (traveler.id === "1") {
        if (!traveler.email.trim()) newErrors[`${traveler.id}-email`] = "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveler.email)) newErrors[`${traveler.id}-email`] = "Invalid email format";
        if (!traveler.phone.trim()) newErrors[`${traveler.id}-phone`] = "Phone number is required";
        if (!/^[0-9+\-\s()]+$/.test(traveler.phone)) newErrors[`${traveler.id}-phone`] = "Invalid phone format";
      }
    });
    
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.cardName.trim()) newErrors.cardName = "Name on card is required";
    if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
    if (!/^[0-9\s]{13,19}$/.test(formData.cardNumber.replace(/\s/g, ""))) newErrors.cardNumber = "Invalid card number";
    if (!formData.expiry.trim()) newErrors.expiry = "Expiry date is required";
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.expiry)) newErrors.expiry = "Use MM/YY format";
    if (!formData.cvv.trim()) newErrors.cvv = "CVV is required";
    if (!/^[0-9]{3,4}$/.test(formData.cvv)) newErrors.cvv = "Invalid CVV";
    return newErrors;
  };

  const nextStep = () => {
    if (step === 1) {
      const stepErrors = validateStep1();
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
    }
    setErrors({});
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => {
    setErrors({});
    setStep(s => Math.max(s - 1, 1));
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment step
    const stepErrors = validateStep3();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setPaymentStatus("processing");

    // Simulate payment processing (in real scenario, would call Razorpay API)
    setTimeout(() => {
      // Simulate success (90% chance) or failure (10% chance)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        // Generate booking ID
        const bookingIdNum = `NFA-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        setBookingId(bookingIdNum);
        setPaymentStatus("success");
        setStep(4);
        
        // Send booking confirmation email with all travelers
        const leadTraveler = travelers[0];
        const travelersInfo = travelers.map(t => `${t.firstName} ${t.lastName}`).join(", ");
        const totalPrice = (basePrice * numberOfTravelers + (formData.insurance ? 299 : 0)).toLocaleString('en-IN');
        
        sendBookingConfirmationEmail(
          leadTraveler.email,
          bookingIdNum,
          pkg.title,
          pkg.destination,
          `₹${totalPrice}`,
          new Date().toLocaleDateString('en-IN'),
          numberOfTravelers
        );
      } else {
        setPaymentStatus("failed");
        setErrors({ payment: "Payment failed. Please try again or use a different card." });
      }
    }, 2000);
  };

  const leadTraveler = travelers?.[0] || { 
    id: "guest",
    firstName: "Guest", 
    lastName: "Traveler",
    email: "guest@example.com",
    phone: "",
    passport: "",
    dateOfBirth: "",
    nationality: ""
  };
  const basePrice = parseInt(pkg.price.replace(/[^0-9]/g, ''));
  const insurancePrice = formData.insurance ? 299 : 0;
  const serviceFee = 150;
  const total = basePrice * numberOfTravelers + insurancePrice + serviceFee;

  return (
    <div className="pt-24 pb-32 bg-white min-h-screen text-gray-900 max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600 mb-12">
            <span className={step >= 1 ? "text-teal-700 font-semibold" : ""}>1. TRAVELER DETAILS</span> <ChevronRight size={12} />
            <span className={step >= 2 ? "text-teal-700 font-semibold" : ""}>2. TRAVEL INSURANCE</span> <ChevronRight size={12} />
            <span className={step >= 3 ? "text-teal-700 font-semibold" : ""}>3. PAYMENT</span>
        </div>

        {step === 4 && paymentStatus === "success" ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-teal-300 p-12 text-center bg-teal-50 rounded-lg shadow-soft"
          >
             <ShieldCheck size={64} className="text-teal-700 mx-auto mb-6" />
             <h1 className="text-4xl font-bold text-teal-700 mb-4">BOOKING CONFIRMED!</h1>
             <p className="text-lg text-gray-700 opacity-90 mb-2">
                Your booking has been successfully processed.
             </p>
             <div className="bg-white border-2 border-teal-300 rounded-lg p-6 my-8 inline-block">
                <p className="text-sm text-gray-600 mb-2">BOOKING REFERENCE</p>
                <p className="text-2xl font-bold text-teal-700 font-mono">{bookingId}</p>
             </div>
             <p className="text-sm text-gray-600 mb-8">
                A confirmation email has been sent to <span className="font-semibold">{leadTraveler.email}</span>
             </p>
             <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Next Steps:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ You will receive a detailed itinerary within 24 hours</li>
                  <li>✓ Travel insurance documentation is attached to your email</li>
                  <li>✓ Our team will contact you for final confirmations</li>
                  <li>✓ Download travel documents from your dashboard</li>
                </ul>
             </div>
             <div className="flex gap-4 justify-center">
               <button 
                 onClick={() => {
                   const invoiceData = {
                     bookingId,
                     packageTitle: pkg.title,
                     destination: pkg.destination,
                     travelDate: new Date().toLocaleDateString('en-IN'),
                     travelers: travelers.map(t => `${t.firstName} ${t.lastName}`).join(', '),
                     travelersCount: numberOfTravelers,
                     basePrice: pkg.price,
                     insurance: formData.insurance,
                     insurancePrice: formData.insurance ? '₹299' : undefined,
                     serviceFee: '₹150',
                     totalPrice: `₹${total.toLocaleString('en-IN')}`,
                     leadTravelerEmail: leadTraveler.email,
                     leadTravelerPhone: leadTraveler.phone,
                     bookingDate: new Date().toLocaleDateString('en-IN')
                   };
                   downloadBookingConfirmation(invoiceData);
                 }}
                 className="px-8 py-4 bg-orange-500 text-white font-semibold text-sm tracking-tight hover:bg-orange-600 transition-colors inline-flex items-center gap-2 rounded-lg shadow-soft"
               >
                 <Download size={16} />
                 DOWNLOAD INVOICE
               </button>
               <Link className="px-8 py-4 bg-teal-700 text-white font-semibold text-sm tracking-tight hover:bg-teal-800 transition-colors inline-flex items-center gap-2 rounded-lg shadow-soft" to="/dashboard">
                  ACCESS DASHBOARD <ArrowRight size={16} />
               </Link>
             </div>
          </motion.div>
        ) : (
          <form onSubmit={step === 3 ? processPayment : (e) => { e.preventDefault(); nextStep(); }}>
             {/* Step 1: Travelers Info */}
             {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                   <div>
                      <h2 className="text-3xl font-bold text-teal-700 mb-2">TRAVELERS INFORMATION</h2>
                      <p className="font-medium text-sm text-gray-600">Enter traveler details as they appear on passports.</p>
                   </div>

                   {/* Number of Travelers Selector */}
                   <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <label className="text-sm font-bold text-gray-900 block mb-4">NUMBER OF TRAVELERS*</label>
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleTravelersCountChange(num)}
                            className={`p-3 rounded-lg font-bold transition-all ${
                              numberOfTravelers === num
                                ? 'bg-teal-700 text-white shadow-md scale-105'
                                : 'bg-white border-2 border-gray-300 text-gray-900 hover:border-teal-700'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                   </div>

                   {/* Travelers Forms */}
                   <div className="space-y-8">
                     {travelers.map((traveler, idx) => (
                       <motion.div
                         key={traveler.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.1 }}
                         className="bg-white border-2 border-gray-200 rounded-lg p-6"
                       >
                         <h3 className="text-lg font-bold text-gray-900 mb-4">
                           Traveler {idx + 1} {idx === 0 && "(Lead)"}
                         </h3>

                         <div className="grid grid-cols-2 gap-6">
                           {/* First Name */}
                           <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-medium tracking-tight text-gray-900">FIRST NAME *</label>
                             <input 
                               type="text"
                               value={traveler.firstName}
                               onChange={(e) => handleTravelerChange(traveler.id, "firstName", e.target.value)}
                               className={`bg-white border-b-2 p-2 text-lg focus:outline-none transition-colors ${errors[`${traveler.id}-firstName`] ? 'border-red-500' : 'border-gray-300 focus:border-teal-700'}`}
                             />
                             {errors[`${traveler.id}-firstName`] && <span className="text-red-500 text-xs">{errors[`${traveler.id}-firstName`]}</span>}
                           </div>

                           {/* Last Name */}
                           <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-medium tracking-tight text-gray-900">LAST NAME *</label>
                             <input 
                               type="text"
                               value={traveler.lastName}
                               onChange={(e) => handleTravelerChange(traveler.id, "lastName", e.target.value)}
                               className={`bg-white border-b-2 p-2 text-lg focus:outline-none transition-colors ${errors[`${traveler.id}-lastName`] ? 'border-red-500' : 'border-gray-300 focus:border-teal-700'}`}
                             />
                             {errors[`${traveler.id}-lastName`] && <span className="text-red-500 text-xs">{errors[`${traveler.id}-lastName`]}</span>}
                           </div>
                         </div>

                         {/* Email & Phone - Only for Lead Traveler */}
                         {idx === 0 && (
                           <div className="grid grid-cols-2 gap-6 mt-6">
                             <div className="flex flex-col gap-2">
                               <label className="text-[10px] font-medium tracking-tight text-gray-900">EMAIL ADDRESS *</label>
                               <input 
                                 type="email"
                                 value={traveler.email}
                                 onChange={(e) => handleTravelerChange(traveler.id, "email", e.target.value)}
                                 className={`bg-white border-b-2 p-2 text-lg focus:outline-none transition-colors ${errors[`${traveler.id}-email`] ? 'border-red-500' : 'border-gray-300 focus:border-teal-700'}`}
                               />
                               {errors[`${traveler.id}-email`] && <span className="text-red-500 text-xs">{errors[`${traveler.id}-email`]}</span>}
                             </div>
                             <div className="flex flex-col gap-2">
                               <label className="text-[10px] font-medium tracking-tight text-gray-900">PHONE NUMBER *</label>
                               <input 
                                 type="tel"
                                 value={traveler.phone}
                                 onChange={(e) => handleTravelerChange(traveler.id, "phone", e.target.value)}
                                 className={`bg-white border-b-2 p-2 text-lg focus:outline-none transition-colors ${errors[`${traveler.id}-phone`] ? 'border-red-500' : 'border-gray-300 focus:border-teal-700'}`}
                               />
                               {errors[`${traveler.id}-phone`] && <span className="text-red-500 text-xs">{errors[`${traveler.id}-phone`]}</span>}
                             </div>
                           </div>
                         )}
                       </motion.div>
                     ))}
                   </div>
                </motion.div>
             )}

             {/* Step 2: Extras */}
             {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                   <div>
                      <h2 className="text-3xl font-bold text-teal-700 mb-2">TRAVEL INSURANCE</h2>
                      <p className="font-medium text-sm text-gray-600">Add comprehensive travel protection.</p>
                   </div>
                   <div 
                      className={`border-2 p-6 cursor-pointer transition-all rounded-lg ${formData.insurance ? 'border-teal-300 bg-teal-50 shadow-soft' : 'border-gray-300 hover:border-gray-400'}`}
                      onClick={() => setFormData({ ...formData, insurance: !formData.insurance })}
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 flex items-center justify-center border rounded transition-all ${formData.insurance ? 'border-teal-700 bg-teal-700 text-white' : 'border-gray-400'}`}>
                               {formData.insurance && <Check size={14} />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">COMPREHENSIVE TRAVEL INSURANCE</h3>
                         </div>
                            <span className="font-semibold text-teal-700">+₹299</span>
                      </div>
                      <p className="text-gray-700 text-sm ml-8">Medical evacuation via helicopter, extreme sports coverage, and zero-questions-asked cancellation. Covers COVID, natural disasters, and emergency repatriation.</p>
                   </div>
                </motion.div>
             )}

             {/* Step 3: Payment */}
             {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                   <div>
                      <h2 className="text-3xl font-bold text-teal-700 mb-2">PAYMENT</h2>
                      <p className="font-medium text-sm text-gray-600">Complete your booking with secure payment.</p>
                   </div>

                   {errors.payment && (
                     <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg flex gap-3">
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                           <p className="font-semibold text-red-700">Payment Failed</p>
                           <p className="text-sm text-red-600">{errors.payment}</p>
                        </div>
                     </div>
                   )}

                   <div className="border border-gray-300 p-6 space-y-6 bg-teal-50 rounded-lg shadow-soft">
                      <div className="flex items-center gap-4 mb-4 text-teal-700"><CreditCard /> <span className="font-bold tracking-tight font-medium text-sm">SECURE PAYMENT (Test Mode)</span></div>
                      
                      <div className="bg-white border border-blue-200 rounded p-3 text-xs text-blue-700">
                         <strong>Test Card Numbers:</strong> Use 4111 1111 1111 1111 with any future date and any CVV
                      </div>

                      <div className="flex flex-col gap-2">
                         <label className="text-[10px] font-medium tracking-tight text-gray-900">NAME ON CARD *</label>
                         <input 
                           name="cardName" 
                           value={formData.cardName} 
                           onChange={handleInputChange} 
                           className={`bg-white border-b-2 p-2 focus:outline-none transition-colors ${errors.cardName ? 'border-red-500' : 'border-gray-300 focus:border-teal-700'}`}
                         />
                         {errors.cardName && <span className="text-red-500 text-xs">{errors.cardName}</span>}
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-[10px] font-medium tracking-tight text-gray-900">CARD NUMBER *</label>
                         <input 
                           name="cardNumber" 
                           value={formData.cardNumber} 
                           onChange={handleInputChange} 
                           placeholder="0000 0000 0000 0000" 
                           className={`bg-white border-b-2 p-2 focus:outline-none transition-colors font-mono ${errors.cardNumber ? 'border-red-500' : 'border-gray-300 focus:border-teal-700'}`}
                         />
                         {errors.cardNumber && <span className="text-red-500 text-xs">{errors.cardNumber}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-medium tracking-tight text-gray-900">EXPIRY (MM/YY) *</label>
                            <input 
                              name="expiry" 
                              value={formData.expiry} 
                              onChange={handleInputChange} 
                              placeholder="12/25" 
                              className={`bg-white border-b-2 p-2 focus:outline-none transition-colors ${errors.expiry ? 'border-red-500' : 'border-gray-300 focus:border-teal-700'}`}
                            />
                            {errors.expiry && <span className="text-red-500 text-xs">{errors.expiry}</span>}
                         </div>
                         <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-medium tracking-tight text-gray-900">CVV *</label>
                            <input 
                              name="cvv" 
                              value={formData.cvv} 
                              onChange={handleInputChange} 
                              type="password" 
                              maxLength={4} 
                              className={`bg-white border-b-2 p-2 focus:outline-none transition-colors ${errors.cvv ? 'border-red-500' : 'border-gray-300 focus:border-teal-700'}`}
                            />
                            {errors.cvv && <span className="text-red-500 text-xs">{errors.cvv}</span>}
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-300">
                {step > 1 ? (
                   <button 
                     type="button" 
                     onClick={prevStep} 
                     disabled={paymentStatus === "processing"}
                     className="font-medium text-xs tracking-tight text-gray-600 hover:text-teal-700 transition-colors disabled:opacity-50"
                   >
                     BACK
                   </button>
                ) : <div />}
                
                <button 
                  type="submit" 
                  disabled={paymentStatus === "processing"}
                  className="px-8 py-4 bg-teal-700 text-white font-semibold text-sm tracking-tight hover:bg-teal-800 transition-colors flex items-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {paymentStatus === "processing" ? (
                     <>Processing...</>
                   ) : step === 3 ? (
                     <>COMPLETE PAYMENT ₹{total} <ArrowRight size={16} /></>
                   ) : (
                     <>PROCEED <ArrowRight size={16} /></>
                   )}
                </button>
             </div>
          </form>
        )}
      </div>

      {/* Sidebar Summary */}
      <div className="relative">
         <div className="sticky top-32 border border-gray-300 p-6 bg-white shadow-soft-lg rounded-lg">
            <h3 className="font-bold text-teal-700 mb-6 border-b border-gray-200 pb-4">ORDER SUMMARY</h3>
            
            <div className="mb-6 flex gap-4">
               <img src={pkg.image} alt={pkg.title} className="w-24 h-24 object-cover border border-gray-300 rounded" />
               <div>
                  <h4 className="font-bold font-medium text-sm leading-tight mb-2 text-gray-900">{pkg.title}</h4>
                  <div className="text-xs font-medium text-gray-600">1 TRAVELER</div>
                  <div className="text-xs font-medium text-gray-600 mt-1">OCT 15 - {parseInt(pkg.duration)} DAYS</div>
               </div>
            </div>

            <div className="space-y-4 mb-6 pt-4 border-t border-gray-200 font-medium text-sm">
               <div className="flex justify-between text-gray-700">
                  <span className="text-gray-600">BASE FARE</span>
                  <span>₹{basePrice}</span>
               </div>
               {formData.insurance && (
                  <div className="flex justify-between text-gray-700">
                     <span className="text-gray-600">INSURANCE</span>
                     <span>₹299</span>
                  </div>
               )}
               <div className="flex justify-between text-gray-700">
                  <span className="text-gray-600">SERVICE FEE</span>
                  <span>₹150</span>
               </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-xl font-bold">
               <span className="text-gray-900">TOTAL</span>
               <span className="text-teal-700">₹{total}</span>
            </div>
         </div>
      </div>
    </div>
  );
}