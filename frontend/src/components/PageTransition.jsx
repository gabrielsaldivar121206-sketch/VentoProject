import React from 'react';
import { motion } from 'framer-motion';

/* ══════════════════════════════════════════════
   PAGE TRANSITION WRAPPER
   - Wraps each route with smooth enter/exit animation
   - Uses Framer Motion with spring physics
══════════════════════════════════════════════ */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
};

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

const PageTransition = ({ children, className = '' }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className={className}
    style={{ width: '100%', minHeight: '100vh' }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
