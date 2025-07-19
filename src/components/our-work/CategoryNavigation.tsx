'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  label: string;
}

interface CategoryNavigationProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'boda',
    name: 'Boda',
    label: 'Bodas y Eventos',
  },
  {
    id: 'corporativo',
    name: 'Corporativo',
    label: 'Eventos Corporativos',
  },
  {
    id: 'producto',
    name: 'Producto',
    label: 'Fotografía de Producto',
  },
  {
    id: 'moda',
    name: 'Moda',
    label: 'Fotografía de Moda',
  },
];

export default function CategoryNavigation({
  categories = CATEGORIES,
  activeCategory,
  onCategoryChange,
  className = '',
}: CategoryNavigationProps) {
  const [isScrolling, setIsScrolling] = useState(false);

  // Handle smooth scroll to category section
  const scrollToCategory = (categoryId: string) => {
    setIsScrolling(true);
    onCategoryChange(categoryId);

    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), 1000);
  };

  return (
    <div
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border ${className}`}
    >
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center space-x-8">
          {categories.map(category => (
            <motion.button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              disabled={isScrolling}
              className={`relative px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'text-white bg-primary shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                {category.name}
                {activeCategory === category.id && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary-foreground"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
              {categories.map(category => (
                <motion.button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  disabled={isScrolling}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'text-white bg-primary shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-1">
            <motion.div
              className="bg-primary h-1 rounded-full"
              initial={{ width: '0%' }}
              animate={{
                width: `${((categories.findIndex(c => c.id === activeCategory) + 1) / categories.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
