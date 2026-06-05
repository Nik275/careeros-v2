// Unified Premium Motion System for CareerOS
// World-class motion language: calm, intelligent, effortless

// Primary easing curves - the DNA of CareerOS motion
export const ease = {
  // Primary: Smooth, luxurious deceleration
  // Use for: Most animations, reveals, transitions
  luxury: [0.25, 1, 0.35, 1] as [number, number, number, number],
  
  // Cinematic: Elegant, dramatic entrance
  // Use for: Hero reveals, important moments
  cinematic: [0.16, 1, 0.3, 1] as [number, number, number, number],
  
  // Snappy: Quick but smooth response
  // Use for: Hover states, micro-interactions
  snappy: [0.22, 1, 0.36, 1] as [number, number, number, number],
  
  // Gentle: Soft, barely-there movement
  // Use for: Background elements, ambient motion
  gentle: [0.4, 0, 0.2, 1] as [number, number, number, number],
  
  // Bounce-free: No overshoot, clean stop
  // Use for: Layout shifts, structural changes
  clean: [0.6, 0.05, 0.01, 0.9] as [number, number, number, number],
};

// Duration scale - consistent timing across the experience
export const duration = {
  instant: 0.15,    // Micro-interactions, hover feedback
  fast: 0.35,       // Quick transitions, button states
  normal: 0.6,      // Standard reveals, content transitions
  slow: 0.9,        // Important reveals, hero animations
  cinematic: 1.2,   // Dramatic moments, section entrances
  ambient: 12,      // Background floating, breathing effects
};

// Stagger patterns - orchestrated reveals
export const stagger = {
  tight: 0.06,      // Fast sequential reveals (chips, small items)
  normal: 0.1,      // Standard stagger (cards, lists)
  relaxed: 0.15,   // Premium feel (sections, important content)
  dramatic: 0.22,  // Cinematic reveals (hero, key moments)
};

// Spring configurations - physics-based motion
export const spring = {
  // Gentle: Soft, organic movement
  gentle: { stiffness: 18, damping: 20, mass: 1.2 },
  
  // Responsive: Quick but smooth feedback
  responsive: { stiffness: 120, damping: 18, mass: 0.8 },
  
  // Premium: Balanced, luxurious feel
  premium: { stiffness: 80, damping: 16, mass: 1 },
  
  // Float: Ethereal, floating quality
  float: { stiffness: 25, damping: 15, mass: 2 },
};

// Scroll-triggered reveal variants
export const revealVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.luxury },
    },
  },
  
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: duration.normal, ease: ease.luxury },
    },
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: duration.slow, ease: ease.cinematic },
    },
  },
  
  slideFromLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: duration.slow, ease: ease.cinematic },
    },
  },
  
  slideFromRight: {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: duration.slow, ease: ease.cinematic },
    },
  },
};

// Container variants for orchestrated reveals
export const containerVariants = {
  default: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger.normal,
        delayChildren: 0.08,
      },
    },
  },
  
  relaxed: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger.relaxed,
        delayChildren: 0.12,
      },
    },
  },
  
  dramatic: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger.dramatic,
        delayChildren: 0.15,
      },
    },
  },
};

// Hover transforms - subtle, premium interactions
export const hover = {
  // Card lift: Subtle elevation
  cardLift: { y: -4, scale: 1.01, transition: { duration: duration.fast, ease: ease.luxury } },
  
  // Button press: Satisfying depth
  buttonPress: { scale: 0.98, transition: { duration: duration.instant, ease: ease.snappy } },
  
  // Glow intensify: Ambient glow increase
  glowIntensify: (baseOpacity: number) => ({ opacity: baseOpacity * 1.8, transition: { duration: duration.fast } }),
};

// Performance optimization
export const performance = {
  // GPU-accelerated properties only
  willChange: 'transform, opacity',
  
  // Reduced motion support
  reducedMotion: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  },
};
