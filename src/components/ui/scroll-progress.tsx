'use client';

import { motion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.2,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 h-1 w-full origin-left bg-primary z-50"
      aria-hidden
    />
  );
}
