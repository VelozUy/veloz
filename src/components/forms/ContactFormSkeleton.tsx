'use client';

import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const fadeInUp = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function ContactFormSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16">
        <div className="max-w-border-64 mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-left space-y-8 text-foreground"
          >
            <motion.div variants={fadeInUp}>
              <Skeleton className="h-16 md:h-20 lg:h-24 w-3/4 mb-4" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Skeleton className="h-8 md:h-10 w-full max-w-4xl" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section Skeleton */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-left mb-12"
          >
            <Skeleton className="h-10 w-64 mb-6" />
            <Skeleton className="h-1 w-32" />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8 bg-card rounded-lg shadow-xl p-8 md:p-12"
          >
            {/* Name + Company Row */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            </motion.div>

            {/* Contact Method + Email/Phone Row */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            </motion.div>

            {/* Event Type + Location Row */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            </motion.div>

            {/* Attendees + Event Date Row */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            </motion.div>

            {/* Services Field */}
            <motion.div variants={fadeInUp} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </motion.div>

            {/* Message Field */}
            <motion.div variants={fadeInUp} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-32 w-full" />
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <Skeleton className="h-14 w-48" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators Skeleton */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16">
        <div className="max-w-border-64 mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <div className="flex justify-center">
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <div className="flex justify-center">
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
              <Skeleton className="h-6 w-28 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <div className="flex justify-center">
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
              <Skeleton className="h-6 w-36 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
