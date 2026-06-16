'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CareerGlobeBackground } from '@/components/landing/CareerGlobeBackground';
import { SignalNode } from '@/components/landing/SignalNode';
import { DecisionModel } from '@/components/landing/DecisionModel';
import { ProductPreviewPanel } from '@/components/landing/ProductPreviewPanel';
import { HeroAssessmentButton } from '@/components/landing/HeroAssessmentButton';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#8052ff]/30 selection:text-white font-sans relative">
      {/* 1. Deep Space Cosmic Background */}
      <CareerGlobeBackground variant="landing" />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-black/80 backdrop-blur-md border-b border-white/[0.04]">
        <div className="text-[17px] font-semibold tracking-tight">CareerOS</div>
        <div className="hidden md:flex items-center gap-10 text-[12px] font-medium tracking-[0.15em] text-white/50">
          <Link href="#how-it-works" className="hover:text-white transition-colors uppercase">How it works</Link>
          <Link href="#intelligence" className="hover:text-white transition-colors uppercase">Intelligence</Link>
        </div>
        <Link href="/assessment">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 md:py-2 rounded-full bg-[#8052ff] text-white text-[13px] font-semibold tracking-[0.05em] hover:bg-[#6c42db] transition-colors"
          >
            START
          </motion.button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] pt-32 md:pt-24 flex flex-col md:flex-row overflow-hidden border-b border-white/[0.04]">
        {/* Left Content */}
        <div className="w-full md:w-5/12 flex flex-col justify-center px-6 md:px-16 lg:px-24 z-20 py-20 md:py-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent md:bg-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="text-[#8052ff] text-[11px] font-semibold tracking-[0.2em] uppercase mb-8">
              Career Intelligence for High-Stakes Decisions
            </div>
            <h1 className="text-[clamp(40px,10vw,72px)] font-light tracking-tight leading-[1.05] mb-8 text-white break-words">
              You are not confused.<br className="hidden md:block" />
              <span className="text-white/40">You are under-modeled.</span>
            </h1>
            <p className="text-[#9a9a9a] text-[17px] md:text-[20px] font-light leading-[1.6] max-w-[480px] mb-12">
              CareerOS maps your psychology, constraints, ambition, and future options — then helps you choose the path with the strongest long-term life fit.
            </p>
            
            <div className="flex flex-col items-start gap-4">
              <HeroAssessmentButton />
              <span className="text-[#9a9a9a] text-[12px] tracking-wide ml-4">
                3 minutes • no signup required
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Visual (Removed Constellation, now global) */}
        <div className="w-full md:w-7/12 h-[60vh] md:h-auto relative z-10 pointer-events-none">
          
          {/* Floating System Stats */}
          <div className="absolute bottom-10 right-10 flex flex-col gap-2 pointer-events-none z-20 hidden md:flex">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#15846e] animate-pulse" />
              <div className="text-[#9a9a9a] text-[10px] font-mono tracking-widest uppercase">MODEL SIGNALS: 42</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffb829] animate-pulse" />
              <div className="text-[#9a9a9a] text-[10px] font-mono tracking-widest uppercase">REGRET RISK: ANALYZING</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8052ff] animate-pulse" />
              <div className="text-[#9a9a9a] text-[10px] font-mono tracking-widest uppercase">PATH FIT: CALIBRATING</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Signals */}
      <section id="how-it-works" className="py-16 md:py-32 px-6 md:px-16 lg:px-24 border-b border-white/[0.04]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          className="max-w-[700px] mb-12 md:mb-16 relative z-10 bg-black/40 md:bg-transparent rounded-2xl md:rounded-none p-4 md:p-0 -ml-4 md:ml-0"
        >
          <h2 className="text-[clamp(32px,8vw,60px)] leading-[1.1] font-light tracking-tight mb-6">
            Most students are not choosing careers.<br className="hidden md:block"/>
            <span className="text-white/40">They are reacting.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SignalNode 
            index={0}
            title="Parent expectations" 
            description="The path is often chosen before the student understands themselves." 
          />
          <SignalNode 
            index={1}
            title="Marks-based identity" 
            description="One exam score starts acting like a personality test." 
          />
          <SignalNode 
            index={2}
            title="Money pressure" 
            description="Financial urgency changes what 'best career' actually means." 
          />
          <SignalNode 
            index={3}
            title="Too many options" 
            description="More choices do not create clarity. They create decision paralysis." 
          />
          <SignalNode 
            index={4}
            title="College tier disadvantage" 
            description="Brand, network, and access quietly shape outcomes." 
          />
          <SignalNode 
            index={5}
            title="Fear of choosing wrong" 
            description="The real fear is losing years to a path that never fit." 
          />
        </div>
      </section>

      {/* Section 2: Decision Model */}
      <section id="intelligence" className="py-16 md:py-32 px-6 md:px-16 lg:px-24 border-b border-white/[0.04] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(128,82,255,0.06)_0%,transparent_60%)] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          className="max-w-[800px] mb-8 relative z-10 bg-black/40 md:bg-transparent rounded-2xl md:rounded-none p-4 md:p-0 -ml-4 md:ml-0"
        >
          <h2 className="text-[clamp(32px,8vw,60px)] leading-[1.1] font-light tracking-tight">
            CareerOS turns uncertainty<br className="hidden md:block"/>
            into a <span className="text-white">decision model</span>.
          </h2>
        </motion.div>
        
        <DecisionModel />
      </section>

      {/* Section 3: Product Previews */}
      <section className="py-16 md:py-32 px-6 md:px-16 lg:px-24 border-b border-white/[0.04]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          className="max-w-[700px] mb-12 md:mb-20 relative z-10 bg-black/40 md:bg-transparent rounded-2xl md:rounded-none p-4 md:p-0 -ml-4 md:ml-0"
        >
          <h2 className="text-[clamp(32px,8vw,60px)] leading-[1.1] font-light tracking-tight mb-6">
            <span className="text-white/40">Not career advice.</span><br className="hidden md:block"/>
            A career operating system.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1100px] mx-auto">
          <ProductPreviewPanel 
            index={0}
            title="Psychological Career Profile"
            items={["Natural strengths", "Motivation pattern", "Work style", "Pressure response"]}
          />
          <ProductPreviewPanel 
            index={1}
            isHighlight={true}
            title="Best-Fit Direction"
            items={["Recommended path", "Why it fits", "Tradeoffs", "Confidence score"]}
          />
          <ProductPreviewPanel 
            index={2}
            title="Regret Risk Map"
            items={["Low / medium / high risk indicators", "Late realization risk", "Money mismatch risk", "Identity mismatch risk"]}
          />
          <ProductPreviewPanel 
            index={3}
            title="12-Month Execution Roadmap"
            items={["Next 30 days", "3 months horizon", "6 months horizon", "12 months target"]}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="min-h-[100svh] pt-[120px] pb-[96px] md:py-48 px-6 flex flex-col items-center justify-end md:justify-center text-center relative overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,82,255,0.06)_0%,transparent_60%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          className="relative z-10 flex flex-col items-center max-w-[600px] pointer-events-auto mt-auto md:mt-0"
        >
          <div className="text-[#8052ff] text-[10px] font-mono tracking-[0.2em] uppercase mb-6">
            READY FOR MODEL INITIALIZATION
          </div>
          <h2 className="text-[clamp(36px,9vw,60px)] leading-[1.1] font-light tracking-tight mb-8 text-white">
            Stop guessing your future.
          </h2>
          <p className="text-[17px] text-[#9a9a9a] font-light leading-[1.6] mb-12">
            Start with a 3-minute clarity assessment. CareerOS will begin building your career intelligence model immediately.
          </p>
          <Link href="/assessment" className="group">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#6c42db' }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 rounded-full bg-[#8052ff] text-white text-[15px] font-medium tracking-[0.05em] shadow-[0_0_40px_rgba(128,82,255,0.2)] transition-colors flex items-center gap-3"
            >
              START CAREER CLARITY
              <svg 
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer className="py-10 px-6 border-t border-white/[0.04] flex justify-center items-center text-center text-[#9a9a9a] text-[12px] tracking-wide bg-black">
        © {new Date().getFullYear()} CareerOS. All rights reserved.
      </footer>
    </div>
  );
}
