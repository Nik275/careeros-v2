'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const deterministicRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Custom SVG Arc Component
const CircularMeter = ({ percentage, color }: { percentage: number, color: string }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-[30px] h-[30px] flex items-center justify-center">
      <svg width="30" height="30" viewBox="0 0 30 30" className="rotate-[-90deg]">
        <circle cx="15" cy="15" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" fill="none" />
        <motion.circle 
          cx="15" cy="15" r={radius} 
          stroke={color} 
          strokeWidth="2.5" 
          fill="none" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-medium" style={{ color }}>
        {percentage}
      </div>
    </div>
  );
};

export function ProductPreviewPanel({ title, items, index, isHighlight = false }: { title: string, items: string[], index: number, isHighlight?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const isRadar = title.toLowerCase().includes('regret risk map');
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className={`p-5 md:p-8 rounded-[24px] border ${isHighlight ? 'border-[#8052ff]/30 bg-gradient-to-b from-[#8052ff]/[0.05] to-[#000000]/80 md:to-transparent shadow-[0_10px_40px_rgba(128,82,255,0.03)]' : 'border-white/[0.04] bg-black/80 md:bg-black/60 backdrop-blur-[2px]'} relative flex flex-col gap-5 md:gap-6 overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <h3 className={`text-[12px] font-semibold tracking-[0.15em] uppercase ${isHighlight ? 'text-[#e0d6ff]' : 'text-white/70'}`}>{title}</h3>
        <div className="flex gap-1.5 opacity-30">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>
      
      <div className="flex flex-col gap-5">
        {items.map((item, i) => {
          const rand = deterministicRandom(index * 10 + i);
          const val = mounted ? Math.floor(rand * 60 + 35) : 50; // 35 to 95
          
          const isRisk = item.toLowerCase().includes('risk');
          const isTime = item.toLowerCase().includes('month') || item.toLowerCase().includes('days');
          const isHighRisk = isRisk && rand > 0.6;
          
          let color = '#8052ff';
          if (isRisk) color = isHighRisk ? '#e25555' : '#ffb829';
          else if (!isHighlight && rand > 0.5) color = '#15846e';

          return (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                {/* Status Indicator */}
                {!isTime && (
                  isRisk ? (
                     <div className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-[#e25555]' : 'bg-[#ffb829]'} shadow-[0_0_6px_currentColor]`} />
                  ) : (
                     <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
                  )
                )}
                {isTime && (
                  <div className="w-1.5 h-1.5 rounded-sm bg-[#8052ff]/60 rotate-45" />
                )}
                
                <span className="text-[13px] text-[#9a9a9a] group-hover:text-white transition-colors tracking-wide">{item}</span>
              </div>
              
              {/* Instrument Display */}
              <div className="flex items-center">
                {isRadar && isRisk && (
                   <div className="relative w-4 h-4 rounded-full border border-white/10 flex items-center justify-center bg-black/50">
                     <div className={`w-1 h-1 rounded-full ${isHighRisk ? 'bg-[#e25555]' : 'bg-[#ffb829]'}`} />
                     <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 rounded-full border-t border-[#8052ff]/60"
                     />
                   </div>
                )}
                
                {!isRadar && isRisk && (
                  <div className={`text-[9px] px-2 py-0.5 rounded border border-white/10 ${isHighRisk ? 'text-[#e25555]' : 'text-[#ffb829]'} font-mono uppercase tracking-wider`}>
                    {isHighRisk ? 'ELEVATED' : 'NOMINAL'}
                  </div>
                )}
                
                {isTime && (
                  <div className="flex items-center w-[80px]">
                    <div className="w-full h-[1px] bg-white/10 relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[40%] h-[1px] bg-[#8052ff]" />
                      <motion.div 
                        animate={{ x: [0, 80] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_white]" 
                      />
                    </div>
                  </div>
                )}

                {!isRadar && !isRisk && !isTime && (
                  <CircularMeter percentage={val} color={color} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
