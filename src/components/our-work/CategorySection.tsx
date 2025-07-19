'use client';

import React from 'react';
import { motion } from 'framer-motion';
import FeatureMediaGrid from './FeatureMediaGrid';

interface CategorySectionProps {
  id: string;
  title: string;
  description: string;
  media: Array<{
    id: string;
    projectId: string;
    projectTitle: string;
    type: 'photo' | 'video';
    url: string;
    width: number;
    height: number;
    alt: string;
    featured: boolean;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
  }>;
  className?: string;
}

/**
 * CategorySection Component
 *
 * Displays a category section with title, description, and feature media grid.
 * Each section is scrollable and has smooth animations.
 */
export const CategorySection: React.FC<CategorySectionProps> = ({
  id,
  title,
  description,
  media,
  className = '',
}: CategorySectionProps) => {
  return (
    <section
      id={`category-${id}`}
      className={`min-h-screen py-16 bg-background ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-body font-normal text-foreground mb-6">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-body">
            {description}
          </p>
        </motion.div>

        {/* Feature Media Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FeatureMediaGrid media={media} categoryId={id} className="mb-8" />
        </motion.div>

        {/* Category Footer */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-card border border-border rounded-none p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-body font-normal mb-2 text-card-foreground">
              ¿Te gustaría un trabajo similar?
            </h3>
            <p className="text-muted-foreground mb-4 font-body">
              Cada proyecto es único y nos adaptamos a tus necesidades
              específicas
            </p>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-none font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
              Consultar Disponibilidad
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySection;
