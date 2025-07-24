"use client";

import React from 'react';

// Theme debugging utilities
export class ThemeDebugger {
  private static instance: ThemeDebugger;
  private isEnabled = false;
  private highlightedElements: Element[] = [];

  static getInstance(): ThemeDebugger {
    if (!ThemeDebugger.instance) {
      ThemeDebugger.instance = new ThemeDebugger();
    }
    return ThemeDebugger.instance;
  }

  enable(): void {
    this.isEnabled = true;
    this.scanForHardcodedColors();
    console.log('🔍 Theme Debug Mode: ENABLED');
  }

  disable(): void {
    this.isEnabled = false;
    this.clearHighlights();
    console.log('🔍 Theme Debug Mode: DISABLED');
  }

  toggle(): void {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  private scanForHardcodedColors(): void {
    const elements = document.querySelectorAll('*');
    const hardcodedColorPatterns = [
      /#[0-9a-fA-F]{3,6}/, // Hex colors
      /rgb\([^)]+\)/, // RGB colors
      /rgba\([^)]+\)/, // RGBA colors
      /hsl\([^)]+\)/, // HSL colors
      /hsla\([^)]+\)/, // HSLA colors
    ];

    elements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      const borderColor = style.borderColor;

      const hasHardcodedColor = [backgroundColor, color, borderColor].some((value) => {
        return hardcodedColorPatterns.some((pattern) => pattern.test(value));
      });

      if (hasHardcodedColor && !this.isThemeVariable(backgroundColor) && !this.isThemeVariable(color) && !this.isThemeVariable(borderColor)) {
        this.highlightElement(element);
        console.warn('🎨 Hardcoded color detected:', {
          element: element.tagName,
          className: element.className,
          backgroundColor,
          color,
          borderColor,
        });
      }
    });
  }

  private isThemeVariable(value: string): boolean {
    return value.includes('var(--') || value.includes('oklch(') || value === 'transparent' || value === 'inherit';
  }

  private highlightElement(element: Element): void {
    if (!this.highlightedElements.includes(element)) {
      this.highlightedElements.push(element);
      element.setAttribute('data-theme-debug', 'hardcoded-color');
      (element as HTMLElement).style.outline = '2px solid red';
      (element as HTMLElement).style.outlineOffset = '2px';
    }
  }

  private clearHighlights(): void {
    this.highlightedElements.forEach((element) => {
      element.removeAttribute('data-theme-debug');
      (element as HTMLElement).style.outline = '';
      (element as HTMLElement).style.outlineOffset = '';
    });
    this.highlightedElements = [];
  }

  getStatus(): boolean {
    return this.isEnabled;
  }
}

// React component for theme debugging UI
export const ThemeDebugTools: React.FC = () => {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const themeDebugger = ThemeDebugger.getInstance();

  const handleToggle = () => {
    themeDebugger.toggle();
    setIsEnabled(themeDebugger.getStatus());
  };

  React.useEffect(() => {
    // Check if debug mode is enabled via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('theme-debug') === 'true') {
      themeDebugger.enable();
      setIsEnabled(true);
    }
  }, []);

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#fff', border: '1px solid #ccc', borderRadius: 8, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleToggle}
          style={{
            padding: '8px 16px',
            background: isEnabled ? '#dc2626' : '#059669',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {isEnabled ? 'Disable' : 'Enable'} Theme Debug
        </button>
        <div style={{ fontSize: 12, color: '#666' }}>
          {isEnabled ? '🔍 Active' : '⚪ Inactive'}
        </div>
      </div>
      {isEnabled && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
          <div>• Red outlines = hardcoded colors</div>
          <div>• Check console for warnings</div>
          <div>• Add ?theme-debug=true to URL</div>
        </div>
      )}
    </div>
  );
};

export default ThemeDebugTools; 