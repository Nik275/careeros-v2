'use client';
import { motion } from 'framer-motion';

export function SignalNode({ title, description, index }: { title: string, description: string, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative group w-full h-full"
    >
      {/* Background Orbit / Field lines */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute top-1/2 left-[20px] -translate-y-1/2 w-[150px] h-[150px] rounded-full border border-white/[0.05] group-hover:border-[#8052ff]/20 scale-50 group-hover:scale-100 transition-transform duration-1000 ease-out" />
        <div className="absolute top-1/2 left-[20px] -translate-y-1/2 w-[250px] h-[250px] rounded-full border border-white/[0.03] group-hover:border-[#8052ff]/10 scale-50 group-hover:scale-110 transition-transform duration-1000 ease-out delay-75" />
        
        {/* Tiny reactive particles in orbit */}
        <div className="absolute top-[20%] left-[60%] w-[2px] h-[2px] bg-[#8052ff] rounded-full opacity-0 group-hover:opacity-80 transition-all duration-700 -translate-x-4 group-hover:translate-x-0 shadow-[0_0_8px_#8052ff]" />
        <div className="absolute bottom-[30%] right-[20%] w-[1px] h-[1px] bg-white rounded-full opacity-0 group-hover:opacity-80 transition-all duration-1000 translate-y-4 group-hover:translate-y-0 shadow-[0_0_5px_white]" />
      </div>

      <div className="h-full p-5 md:p-7 border border-white/[0.04] group-hover:border-[#8052ff]/30 rounded-2xl bg-black/80 md:bg-black/60 backdrop-blur-[2px] relative overflow-hidden transition-colors duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8052ff]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Animated node dot */}
            <div className="relative flex items-center justify-center w-3 h-3">
              <motion.div 
                animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0.05, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-[#8052ff]/40 transition-colors duration-500"
              />
              <div className="w-[3px] h-[3px] rounded-full bg-white/40 group-hover:bg-[#8052ff] group-hover:shadow-[0_0_8px_#8052ff] transition-all duration-500" />
            </div>
            <h3 className="text-[#ffffff] text-[11px] font-semibold tracking-[0.1em] uppercase group-hover:text-[#e0d6ff] transition-colors duration-500">{title}</h3>
          </div>
          <p className="text-[#9a9a9a] text-[15px] font-light leading-[1.6]">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
