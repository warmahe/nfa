import React, { useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Info,
  Compass,
  Layers,
} from 'lucide-react';
import { Package, DepartureAvailabilityStatus } from '../../../types/database';
import { useEnquiry } from '../../../context/EnquiryContext';

interface PricingDatesProps {
  pkg: Package;
}

export const PricingDates: React.FC<PricingDatesProps> = ({ pkg }) => {
  const { openEnquiryModal } = useEnquiry();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const availability = pkg?.availability;
  const mode = availability?.mode || (pkg?.pricingDates && pkg.pricingDates.length > 0 ? 'FIXED_DEPARTURES' : 'PRIVATE_FLEXIBLE');

  // Filter future & non-closed departure dates
  const futureDepartures = useMemo(() => {
    if (!availability?.departures) return [];
    return availability.departures
      .filter((d) => d.date >= todayStr && d.status !== 'CLOSED')
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [availability?.departures, todayStr]);

  const allClosedOrPast = useMemo(() => {
    if (!availability?.departures || availability.departures.length === 0) return false;
    return availability.departures.every((d) => d.date < todayStr || d.status === 'CLOSED');
  }, [availability?.departures, todayStr]);

  const travelWindows = availability?.travelWindows || [];
  const leadTimeDays = availability?.bookingLeadTimeDays;
  const availabilityNote = availability?.availabilityNote;

  // Legacy fallback dates
  const legacyPricingDates = pkg?.pricingDates || [];

  const handleEnquireDate = (dateStr: string, isFlexible: boolean = false) => {
    openEnquiryModal({
      itineraryId: pkg.id,
      itineraryTitle: pkg.title,
      itinerarySlug: pkg.slug,
      destination: (pkg.destinations && pkg.destinations[0]) || pkg.destination,
      duration: pkg.duration,
      price: pkg.pricing?.basePrice,
      currency: pkg.pricing?.currency || 'INR',
      initialTravelDate: dateStr,
      source: isFlexible ? 'PRIVATE_FLEXIBLE_JOURNEY' : 'ITINERARY_DEPARTURE_DATE',
      entryPoint: isFlexible ? 'TRAVEL_DATES_CTA' : 'DEPARTURE_DATE_CTA',
    });
  };

  const getStatusBadge = (status: DepartureAvailabilityStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={11} /> Available
          </span>
        );
      case 'LIMITED':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={11} /> Limited Availability
          </span>
        );
      case 'ON_REQUEST':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
            <HelpCircle size={11} /> On Request
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section
      id="pricing"
      className="py-20 md:py-24 px-6 md:px-16 bg-[#FCFBF7] border-t-4 border-[#121212]"
      aria-label="Trip dates and availability"
    >
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-[#121212] pb-8">
          <div>
            <span className="flex items-center gap-2 font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-2">
              <Calendar size={14} /> TRAVEL WINDOW & AVAILABILITY
            </span>
            <h2 className="font-brand font-black text-[clamp(2.5rem,6vw,4.5rem)] uppercase tracking-tighter text-[#121212] leading-[0.88]">
              WHEN CAN YOU <br />
              <span className="text-[#9E1B1D]">TRAVEL?</span>
            </h2>
          </div>

          {/* Lead time badge */}
          {leadTimeDays && (
            <div className="p-4 bg-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#F4BF4B] flex items-center gap-3 max-w-sm">
              <Clock size={20} className="text-[#9E1B1D] shrink-0" />
              <p className="text-xs font-bold text-slate-800 leading-tight">
                We recommend enquiring at least <strong>{leadTimeDays} days</strong> before your preferred departure.
              </p>
            </div>
          )}
        </div>

        {/* ── CUSTOM AVAILABILITY NOTE / GUIDANCE ── */}
        {availabilityNote && (
          <div className="p-4 md:p-5 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-start gap-3">
            <Info size={18} className="text-amber-800 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-950 leading-relaxed">
              {availabilityNote}
            </p>
          </div>
        )}

        {/* ── CASE 1: FIXED DEPARTURES (or BOTH) ── */}
        {(mode === 'FIXED_DEPARTURES' || mode === 'BOTH') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212] flex items-center gap-2">
                <Calendar size={20} className="text-[#9E1B1D]" /> CHOOSE YOUR DEPARTURE
              </h3>
              {mode === 'BOTH' && (
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Fixed Departure Dates
                </span>
              )}
            </div>

            {futureDepartures.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {futureDepartures.map((d) => {
                  const dateObj = new Date(d.date);
                  const formattedDate = dateObj.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={d.id}
                      className="border-4 border-[#121212] bg-white p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-[6px_6px_0px_0px_#121212] hover:shadow-[10px_10px_0px_0px_#F4BF4B] transition-all"
                    >
                      <div className="space-y-4">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          {getStatusBadge(d.status)}
                          {pkg.duration && (
                            <span className="text-[10px] font-black uppercase text-slate-500">
                              {pkg.duration}
                            </span>
                          )}
                        </div>

                        {/* Date Display */}
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                            DEPARTURE DATE
                          </span>
                          <h4 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                            {formattedDate}
                          </h4>
                        </div>

                        {/* Spaces & Party Info */}
                        <div className="space-y-1 text-xs text-slate-600">
                          {d.remainingSpaces !== undefined && (
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Users size={13} className="text-[#9E1B1D]" />
                              <span>
                                {d.remainingSpaces > 0
                                  ? `${d.remainingSpaces} Space${d.remainingSpaces !== 1 ? 's' : ''} Available`
                                  : 'Capacity Reached'}
                              </span>
                            </p>
                          )}
                          {(d.minTravellers || d.maxTravellers) && (
                            <p className="text-[11px] text-slate-500">
                              Party size: {d.minTravellers || 1}–{d.maxTravellers || 'Flexible'} travellers
                            </p>
                          )}
                        </div>

                        {/* Public Note */}
                        {d.note && (
                          <p className="p-3 bg-slate-50 border border-slate-200 text-xs font-serif italic text-slate-700 rounded">
                            "{d.note}"
                          </p>
                        )}
                      </div>

                      {/* Action CTA */}
                      <button
                        type="button"
                        onClick={() => handleEnquireDate(d.date, false)}
                        aria-label={`Enquire for ${formattedDate} departure`}
                        className="w-full py-3.5 px-4 bg-[#121212] text-[#F4BF4B] border-2 border-[#121212] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        {d.status === 'ON_REQUEST' ? 'ENQUIRE ABOUT THIS DATE' : 'ENQUIRE FOR THIS DATE'}{' '}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : allClosedOrPast ? (
              <div className="p-8 border-4 border-dashed border-[#121212]/20 bg-white text-center space-y-4 max-w-xl mx-auto shadow-[6px_6px_0px_0px_#9E1B1D]">
                <Calendar size={36} className="mx-auto text-[#9E1B1D]" />
                <div className="space-y-1">
                  <h4 className="font-brand font-black text-xl uppercase text-[#121212]">
                    THIS DEPARTURE WINDOW IS CURRENTLY CLOSED
                  </h4>
                  <p className="font-serif italic text-xs text-slate-600">
                    Our journey designers can often arrange alternative bespoke departures or open custom travel windows for you.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEnquireDate('', true)}
                  className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                >
                  REQUEST ALTERNATIVE DATES <ArrowRight size={14} />
                </button>
              </div>
            ) : legacyPricingDates.length > 0 ? (
              /* Legacy dates fallback */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {legacyPricingDates.map((d, i) => (
                  <div
                    key={i}
                    className="border-4 border-[#121212] bg-white p-6 flex flex-col justify-between space-y-4 shadow-[6px_6px_0px_0px_#121212]"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">
                        DEPARTURE
                      </span>
                      <h4 className="font-brand font-black text-xl uppercase text-[#121212]">
                        {d.date_range}
                      </h4>
                      {d.notes && (
                        <p className="mt-2 text-xs font-serif italic text-slate-600">"{d.notes}"</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEnquireDate(d.date_range, false)}
                      className="w-full py-3 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      ENQUIRE FOR THIS DATE <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center space-y-3">
                <Calendar size={32} className="mx-auto text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Upcoming departure dates are currently being scheduled.
                </p>
                <button
                  type="button"
                  onClick={() => handleEnquireDate('', true)}
                  className="px-6 py-2.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors"
                >
                  REQUEST YOUR DATES &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CASE 2: BOTH MODE (Flexible Dates Callout) ── */}
        {mode === 'BOTH' && (
          <div className="p-8 bg-[#121212] text-white border-4 border-[#121212] rounded-2xl shadow-[8px_8px_0px_0px_#F4BF4B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4BF4B]">
                BESPOKE FLEXIBILITY
              </span>
              <h4 className="font-brand font-black text-2xl uppercase tracking-tight text-white">
                PREFER DIFFERENT DATES?
              </h4>
              <p className="font-serif italic text-xs text-slate-300 max-w-xl">
                Private dates can also be tailored around your ideal timeline. Share your preferred window and our team will craft it for you.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleEnquireDate('', true)}
              className="px-6 py-3 bg-[#F4BF4B] text-[#121212] font-black text-xs uppercase tracking-widest hover:bg-white transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              REQUEST PRIVATE DATES &rarr;
            </button>
          </div>
        )}

        {/* ── CASE 3: PRIVATE FLEXIBLE ONLY ── */}
        {mode === 'PRIVATE_FLEXIBLE' && (
          <div className="p-8 md:p-12 bg-white border-4 border-[#121212] shadow-[10px_10px_0px_0px_#F4BF4B] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">
                  BESPOKE PRIVATE EXPEDITION
                </span>
                <h3 className="font-brand font-black text-3xl md:text-4xl uppercase tracking-tight text-[#121212]">
                  TRAVEL WHEN IT SUITS YOU
                </h3>
                <p className="font-serif italic text-sm md:text-base text-slate-700 leading-relaxed">
                  "Private journeys are arranged entirely around your preferred dates and season. Share your ideal travel window with our team and we'll craft the seamless expedition around you."
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleEnquireDate('', true)}
                className="inline-flex items-center gap-3 bg-[#121212] text-[#F4BF4B] px-8 py-4 border-2 border-[#121212] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors shrink-0 shadow-[4px_4px_0px_0px_#F4BF4B] cursor-pointer"
              >
                PLAN YOUR DATES <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── TRAVEL WINDOWS (If configured) ── */}
        {travelWindows.length > 0 && (
          <div className="space-y-6 pt-4 border-t-2 border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212] flex items-center gap-2">
                <Layers size={18} className="text-[#9E1B1D]" /> BEST WINDOWS TO TRAVEL
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {travelWindows.map((win) => {
                const fromStr = win.from
                  ? new Date(win.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Flexible';
                const toStr = win.to
                  ? new Date(win.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Flexible';

                return (
                  <div
                    key={win.id}
                    className="p-6 bg-white border-2 border-[#121212] flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-brand font-black text-lg uppercase text-[#121212]">
                          {win.label}
                        </span>
                        {getStatusBadge(win.status)}
                      </div>

                      {(win.from || win.to) && (
                        <p className="text-xs font-bold text-slate-600">
                          {fromStr} &rarr; {toStr}
                        </p>
                      )}

                      {win.note && (
                        <p className="text-xs font-serif italic text-slate-500 leading-relaxed">
                          "{win.note}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEnquireDate(win.label, true)}
                      className="text-left font-black text-[10px] uppercase tracking-wider text-[#9E1B1D] hover:underline flex items-center gap-1 pt-2"
                    >
                      Enquire for this window &rarr;
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
