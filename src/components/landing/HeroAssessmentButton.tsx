'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export const HERO_ASSESSMENT_ROUTE = '/assessment';

export interface HeroAssessmentButtonProps {
  label?: string;
  className?: string;
  ariaLabel?: string;
}

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function HeroAssessmentButton({
  label = 'START CAREER CLARITY',
  className,
  ariaLabel = 'Start CareerOS assessment',
}: HeroAssessmentButtonProps) {
  return (
    <Link href={HERO_ASSESSMENT_ROUTE} aria-label={ariaLabel} className="group">
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={joinClasses(
          'px-8 py-4 rounded-full bg-[#8052ff] text-white text-[14px] font-medium tracking-[0.05em] shadow-[0_0_30px_rgba(128,82,255,0.2)] hover:shadow-[0_0_40px_rgba(128,82,255,0.4)] hover:bg-[#6c42db] transition-all duration-300 flex items-center gap-3',
          className,
        )}
      >
        {label}
        <svg 
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </motion.button>
    </Link>
  );
}

export default HeroAssessmentButton;
