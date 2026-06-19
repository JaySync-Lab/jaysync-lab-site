import type { Variants, Transition } from 'motion/react';

export const spring: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 18,
  mass: 0.8,
};

export const easeOut: Transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: easeOut },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: easeOut },
};

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const wordReveal: Variants = {
  hidden: { opacity: 0, y: '0.4em', filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: '0em',
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const springScale: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: spring },
};
