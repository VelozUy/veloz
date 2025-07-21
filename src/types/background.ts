/**
 * Background System Types
 * 
 * TypeScript definitions for the Light Gray Background Color System
 */

export type SectionType = 'hero' | 'content' | 'form' | 'testimonial' | 'cta' | 'meta';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface BackgroundClasses {
  background: string;
  text: string;
  border: string;
  shadow?: string;
}

export interface BackgroundConfig {
  sectionType: SectionType;
  priority: PriorityLevel;
  responsive?: boolean;
  interactive?: boolean;
}

export interface ResponsiveBackgroundClasses {
  mobile: BackgroundClasses;
  tablet: BackgroundClasses;
  desktop: BackgroundClasses;
}

export interface InteractiveStates {
  focus: string;
  hover: string;
  active: string;
}

export interface BackgroundSystemConfig {
  sectionType: SectionType;
  priority: PriorityLevel;
  isInteractive?: boolean;
  includeResponsive?: boolean;
  includeAccessibility?: boolean;
}

export interface BackgroundValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BackgroundSystemMetrics {
  contrastRatio: number;
  accessibilityScore: number;
  performanceImpact: 'low' | 'medium' | 'high';
  complexityLevel: 'simple' | 'moderate' | 'complex';
}
