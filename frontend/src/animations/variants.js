// YatraSetu Animation System v2.0
// Timing: Micro: 150-250ms, Component: 250-400ms, Page: 300-500ms

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    transition: { duration: 0.2 } 
  }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const staggerContainerSlow = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

export const itemFadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

export const itemFadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { duration: 0.35, ease: 'easeOut' } 
  }
};

export const itemSlideRight = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
  }
};

export const itemScale = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } 
  }
};

export const cardHoverScale = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -3,
    transition: { 
      duration: 0.25, 
      ease: "easeOut" 
    } 
  }
};

export const progressConnector = {
  initial: { scaleX: 0 },
  animate: { 
    scaleX: 1, 
    transition: { 
      duration: 0.5, 
      ease: "easeInOut" 
    } 
  }
};

export const checkmarkPop = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20 
    } 
  }
};

export const sectionReveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
  viewport: { once: true, amount: 0.2 }
};

export const numberCount = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};
