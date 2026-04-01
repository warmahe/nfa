import React from 'react';
import { motion } from 'motion/react';
import { Crosshair, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section
      className="
        relative w-full overflow-x-clip bg-nfa-cream border-b-4 border-nfa-charcoal
        min-h-[calc(100svh-72px)] md:min-h-[calc(100svh-80px)]
        px-[clamp(16px,3vw,48px)]
        pt-[clamp(20px,4vw,40px)]
        pb-[clamp(24px,4vw,48px)]
      "
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #121212 1px, transparent 1px),
            linear-gradient(to bottom, #121212 1px, transparent 1px)
          `,
          backgroundSize: 'clamp(18px,2.4vw,34px) clamp(18px,2.4vw,34px)',
        }}
      />

      <div
        className="
          relative z-10 mx-auto w-full max-w-[1400px]
          min-h-[calc(100svh-72px-40px)] md:min-h-[calc(100svh-80px-56px)]
          grid items-center gap-[clamp(20px,3vw,48px)]
          lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.85fr)]
        "
      >
        {/* LEFT */}
        <div className="min-w-0 self-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="
              mb-[clamp(14px,2vw,24px)] inline-flex w-fit items-center gap-2
              bg-nfa-burgundy text-nfa-cream
              px-3 py-1.5 border-2 border-nfa-charcoal
              shadow-[4px_4px_0px_0px_#121212]
            "
          >
            <Crosshair size={14} className="animate-pulse" />
            <span className="font-sans text-[clamp(10px,0.85vw,12px)] font-black uppercase tracking-[0.22em]">
              Objective 01
            </span>
          </motion.div>

          <div className="min-w-0">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="
                font-brand font-black uppercase tracking-tight
                text-transparent leading-[0.88]
                text-[clamp(3rem,7.2vw,7.2rem)]
              "
              style={{ WebkitTextStroke: '2px #121212' }}
            >
              WE ARE
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="
                font-brand font-black uppercase tracking-tight text-nfa-charcoal
                leading-[0.86]
                text-[clamp(3rem,6.8vw,6.8rem)]
                ml-0 sm:ml-[4%]
              "
            >
              NOT A
            </motion.h1>

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="
                relative mt-3 sm:mt-4
                ml-0 sm:ml-[6%]
                w-fit max-w-full -rotate-[2deg]
              "
            >
              <div
                className="
                  relative bg-nfa-gold border-[3px] md:border-4 border-nfa-charcoal
                  px-[clamp(14px,2.4vw,34px)]
                  py-[clamp(10px,1.6vw,22px)]
                  shadow-[6px_6px_0px_0px_#121212]
                  max-w-full overflow-hidden
                "
              >
                <h1
                  className="
                    font-brand font-black uppercase text-nfa-charcoal
                    leading-[0.82] tracking-tight
                    text-[clamp(2.3rem,5.7vw,5.8rem)]
                    whitespace-normal sm:whitespace-nowrap
                  "
                >
                  <span className="block sm:block">TRAVEL</span>
                  <span className="block">AGENCY</span>
                </h1>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.35, delay: 0.35, ease: 'easeOut' }}
                className="
                  pointer-events-none absolute left-0 right-0 top-1/2 z-20
                  h-[clamp(8px,1vw,14px)] -translate-y-1/2 origin-left rotate-[4deg]
                  border-y-2 border-nfa-charcoal bg-nfa-burgundy
                "
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="
              mt-[clamp(18px,3vw,34px)]
              ml-0 sm:ml-[6%]
              flex max-w-[34rem] flex-col gap-4
            "
          >
            <p
              className="
                w-fit max-w-full bg-nfa-cream/90 p-3 leading-snug text-nfa-charcoal
                shadow-sm backdrop-blur-sm border border-nfa-charcoal/10
                font-sans font-bold text-[clamp(0.9rem,1.05vw,1rem)]
              "
            >
              We build demanding, high-reward expeditions. <br />
              The adventure is the framework. <br />
              <span className="text-nfa-burgundy">The connection is the magic.</span>
            </p>

            <Link
              to="/destinations"
              className="
                group inline-flex w-fit items-center justify-center gap-3
                bg-nfa-charcoal text-nfa-cream border-2 border-nfa-charcoal
                px-[clamp(18px,2.3vw,28px)] py-[clamp(12px,1.4vw,18px)]
                text-[clamp(0.72rem,0.9vw,0.86rem)] font-sans font-black uppercase tracking-[0.18em]
                shadow-[5px_5px_0px_0px_#F4BF4B]
                transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#F4BF4B]
              "
            >
              View Expeditions
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div
          className="
            flex min-w-0 items-center justify-center lg:justify-end
            mt-2 lg:mt-0
          "
        >
          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 3 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="
              relative w-full
              max-w-[min(82vw,360px)]
              sm:max-w-[min(70vw,420px)]
              md:max-w-[min(46vw,500px)]
              lg:max-w-[min(34vw,520px)]
              aspect-[4/5]
            "
          >
            <div className="absolute inset-0 translate-x-[10px] translate-y-[10px] border-[3px] border-nfa-burgundy pointer-events-none" />

            <div className="absolute inset-0 border-[3px] border-nfa-charcoal bg-nfa-charcoal p-2 md:p-3 shadow-[8px_8px_0px_0px_#121212]">
              <img
                src="https://static.wixstatic.com/media/bac227_5e350ad8886048cd8be917eab76f0555~mv2.jpg/v1/fill/w_1351,h_542,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/bac227_5e350ad8886048cd8be917eab76f0555~mv2.jpg"
                alt="NFA Expedition Vehicle"
                className="h-full w-full object-cover object-center transition-all duration-700 hover:grayscale-0"
              />

              <div
                className="
                  absolute -left-2 bottom-[-10px] z-20
                  flex max-w-[78%] items-center gap-2
                  rotate-[-8deg]
                  border-2 border-nfa-charcoal bg-nfa-gold
                  px-[clamp(8px,1vw,14px)] py-[clamp(8px,1vw,14px)]
                  shadow-[4px_4px_0px_0px_#121212]
                  sm:-left-4 sm:-bottom-4
                "
              >
                <Zap
                  size={18}
                  className="shrink-0 text-nfa-burgundy w-[clamp(14px,1.5vw,20px)]"
                  fill="currentColor"
                />
                <span className="font-brand font-black uppercase leading-[0.9] tracking-tight text-nfa-charcoal text-[clamp(0.9rem,1.5vw,1.35rem)]">
                  Raw Earth <br />
                  Only.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};