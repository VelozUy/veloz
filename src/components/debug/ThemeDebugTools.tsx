'use client';

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
  }

  disable(): void {
    this.isEnabled = false;
    this.clearHighlights();
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

    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      const borderColor = style.borderColor;

      const hasHardcodedColor = [backgroundColor, color, borderColor].some(
        value => {
          return hardcodedColorPatterns.some(pattern => pattern.test(value));
        }
      );

      if (
        hasHardcodedColor &&
        !this.isThemeVariable(backgroundColor) &&
        !this.isThemeVariable(color) &&
        !this.isThemeVariable(borderColor)
      ) {
        this.highlightElement(element);
        console.warn('Hardcoded colors detected:', {
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
    return (
      value.includes('var(--') ||
      value.includes('oklch(') ||
      value === 'transparent' ||
      value === 'inherit'
    );
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
    this.highlightedElements.forEach(element => {
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
    <div className="fixed top-5 right-5 z-50 bg-background border border-border rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className={`px-4 py-2 text-primary-foreground border-none rounded cursor-pointer text-sm font-semibold ${
            isEnabled ? 'bg-destructive' : 'bg-success'
          }`}
        >
          {isEnabled ? 'Disable' : 'Enable'} Theme Debug
        </button>
        <div className="text-xs text-muted-foreground">
          {isEnabled ? '🔍 Active' : '⚪ Inactive'}
        </div>
      </div>
      {isEnabled && (
        <div className="mt-3 text-xs text-muted-foreground">
          <div>• Red outlines = hardcoded colors</div>
          <div>• Check console for warnings</div>
          <div>• Add ?theme-debug=true to URL</div>
        </div>
      )}
    </div>
  );
};

export default ThemeDebugTools;
