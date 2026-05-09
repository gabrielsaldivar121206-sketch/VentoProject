import React from 'react';
import { motion } from 'framer-motion';

/* ══════════════════════════════════════════════
   PAGE TRANSITION WRAPPER
   - Simple, clean fade transition.
   - Specific complex transitions (like Iris) are 
     handled inside their respective components.
══════════════════════════════════════════════ */

const PageTransition = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className={className}
    style={{ width: '100%', height: '100%' }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
