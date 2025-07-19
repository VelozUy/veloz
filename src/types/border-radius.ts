/**
 * TypeScript types for border radius utilities
 *
 * This file defines the types used by the border radius utility functions
 * to ensure type safety and consistency across the application.
 */

export type ElementType =
  | 'tag'
  | 'badge'
  | 'card'
  | 'input'
  | 'form'
  | 'modal'
  | 'hero'
  | 'layout'
  | 'structural'
  | 'diagram'
  | 'wireframe';

export type Context = 'default' | 'admin' | 'public' | 'gallery' | 'navigation';

export type Variant = 'default' | 'subtle' | 'prominent';

export interface BorderRadiusConfig {
  elementType: ElementType;
  context?: Context;
  variant?: Variant;
}

export interface BorderRadiusValidation {
  isValid: boolean;
  recommendation: string;
  issues: string[];
}

export interface ComponentBorderRadiusMap {
  [component: string]: {
    [variant: string]: string;
  };
}

export type ValidBorderRadiusClass =
  | 'rounded-none'
  | 'rounded-sm'
  | 'rounded-md'
  | 'rounded-lg'
  | 'rounded-full'
  | 'rounded-tl-[3rem]'
  | 'rounded-br-[4rem]';

export interface BorderRadiusGuidelines {
  tags: 'rounded-full';
  badges: 'rounded-full';
  cards: 'rounded-lg';
  inputs: 'rounded-md';
  forms: 'rounded-md';
  modals: 'rounded-lg';
  hero: 'rounded-tl-[3rem]';
  layout: 'rounded-br-[4rem]';
  structural: 'rounded-none';
  diagram: 'rounded-none';
  wireframe: 'rounded-none';
}
