'use client';
import { motion } from 'framer-motion';

export function DecisionModel() {
  const groups = [
    {
      title: "WHO YOU ARE",
      label: "INPUT SIGNALS",
      items: ["strengths", "personality", "motivation", "work style"]
    },
    {
      title: "REAL CONSTRAINTS",
      label: "TRADEOFF MODEL",
      items: ["money", "family pressure", "location", "academic background", "time"]
    },
    {
      title: "POSSIBLE PATHS",
      label: "PATH FIT",
      items: ["career options", "skill paths", "exam paths", "startup paths"]
    },
    {
      title: "BEST LONG-TERM DIRECTION",
      label: "REGRET MINIMIZATION",
      items: ["fulfillment", "money", "future relevance", "sustainability", "regret minimization"],
      highlight: true
    }
  ];

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center relative py-16 px-4 md:px-0">
      
      {/* Background Starfield specifically for this section */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
         <div className="absolute top-[20%] left-[10%] w-[2px] h-[2px] bg-white rounded-full opacity-20" />
         <div className="absolute top-[80%] left-[30%] w-[1px] h-[1px] bg-white rounded-full opacity-40" />
         <div className="absolute top-[40%] left-[60%] w-[2px] h-[2px] bg-[#8052ff] rounded-full opacity-20" />
         <div className="absolute top-[70%] left-[80%] w-[3px] h-[3px] bg-[#ffb829] rounded-full opacity-10" />
         
         {/* Faint galaxy dust behind the route */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[100px] bg-[radial-gradient(ellipse_at_center,rgba(128,82,255,0.05)_0%,transparent_70%)] blur-2xl" />
      </div>

      {/* Horizontal connecting line on desktop */}
      <div className="hidden md:block absolute top-[40%] left-[5%] w-[90%] h-[1px] bg-white/[0.04] -translate-y-1/2 z-0 overflow-hidden">
        {/* The Telemetry Pulse */}
        <motion.div 
          className="h-[1px] w-[20%] bg-gradient-to-r from-transparent via-[#ffffff] to-transparent shadow-[0_0_20px_4px_#ffffff]"
          animate={{ x: ['-100%', '700%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Vertical connecting line on mobile */}
      <div className="block md:hidden absolute left-[28px] top-[10%] w-[1px] h-[80%] bg-white/[0.04] z-0 overflow-hidden">
        <motion.div 
          className="w-[1px] h-[15%] bg-gradient-to-b from-transparent via-[#ffffff] to-transparent shadow-[0_0_10px_#ffffff]"
          animate={{ y: ['-100%', '700%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {groups.map((group, gIdx) => (
        <motion.div 
          key={gIdx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: gIdx * 0.15, ease: "easeOut" }}
          className={`relative z-10 flex flex-col gap-5 mb-10 md:mb-0 bg-black/80 md:bg-black/60 backdrop-blur-[2px] py-4 px-3 md:px-5 w-full md:w-[23%] border-l ${group.highlight ? 'border-[#8052ff]/60 shadow-[-10px_0_30px_rgba(128,82,255,0.05)]' : 'border-white/[0.04] group hover:border-[#8052ff]/40'} transition-colors duration-500`}
        >
          {/* Top/Bottom brackets */}
          <div className={`absolute top-0 -left-[1px] w-[1px] h-4 transition-colors duration-500 ${group.highlight ? 'bg-[#8052ff]' : 'bg-white/[0.2] group-hover:bg-[#8052ff]'}`} />
          <div className={`absolute bottom-0 -left-[1px] w-[1px] h-4 transition-colors duration-500 ${group.highlight ? 'bg-[#8052ff]' : 'bg-white/[0.2] group-hover:bg-[#8052ff]'}`} />
          
          <div className="flex flex-col gap-2">
            <div className="text-[9px] font-mono tracking-[0.15em] text-[#9a9a9a] uppercase">
              {group.label}
            </div>
            <div className="flex items-center gap-3">
              <div className={`relative flex items-center justify-center w-2 h-2`}>
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: gIdx * 0.5 }}
                  className={`absolute inset-0 rounded-full ${group.highlight ? 'bg-[#ffb829]' : 'bg-[#8052ff]'}`}
                />
                
                <div className={`w-1.5 h-1.5 rounded-full ${group.highlight ? 'bg-black border border-[#8052ff] shadow-[0_0_12px_#8052ff]' : 'bg-[#8052ff] shadow-[0_0_8px_#8052ff]'}`} />
                
                {group.highlight && (
                   <>
                     <motion.div 
                       animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-[-4px] rounded-full border border-dashed border-[#8052ff]/60"
                     />
                     <motion.div 
                       animate={{ rotate: -360 }}
                       transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-[-6px] rounded-full border border-solid border-white/10"
                     />
                   </>
                )}
              </div>
              <h4 className={`text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors ${group.highlight ? 'text-[#ffb829]' : 'text-white/50 group-hover:text-white'}`}>{group.title}</h4>
            </div>
          </div>

          <div className="flex flex-col gap-3 pl-5 md:pl-0">
            {group.items.map((item, iIdx) => (
              <div key={iIdx} className="flex items-center gap-3 group/item">
                <div className={`w-[3px] h-[3px] rounded-full transition-colors ${group.highlight ? 'bg-white/40 group-hover/item:bg-white' : 'bg-white/10 group-hover/item:bg-white/40'}`} />
                <span className={`text-[13px] ${group.highlight ? 'text-white/90 font-normal' : 'text-[#8a8a8a] font-light'} tracking-wide group-hover/item:text-white transition-colors`}>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
