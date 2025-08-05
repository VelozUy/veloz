import { useState, useEffect } from 'react';

// Available fonts for switching
export const availableFonts = [
  {
    name: 'Roboto-LightItalic',
    label: 'Light Italic',
    weight: 300,
    style: 'italic',
  },
  { name: 'Roboto-Regular', label: 'Regular', weight: 400, style: 'normal' },
  { name: 'Roboto-Italic', label: 'Italic', weight: 400, style: 'italic' },
  { name: 'Roboto-Medium', label: 'Medium', weight: 500, style: 'normal' },
  {
    name: 'Roboto-MediumItalic',
    label: 'Medium Italic (Default)',
    weight: 500,
    style: 'italic',
  },
  { name: 'Roboto-Light', label: 'Light', weight: 300, style: 'normal' },
  { name: 'Roboto-SemiBold', label: 'Semi Bold', weight: 600, style: 'normal' },
  {
    name: 'Roboto-SemiBoldItalic',
    label: 'Semi Bold Italic',
    weight: 600,
    style: 'italic',
  },
  { name: 'Roboto-Bold', label: 'Bold', weight: 700, style: 'normal' },
  {
    name: 'Roboto-BoldItalic',
    label: 'Bold Italic',
    weight: 700,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-Regular',
    label: 'Condensed Regular',
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-Italic',
    label: 'Condensed Italic',
    weight: 400,
    style: 'italic',
  },
  {
    name: 'Roboto_Condensed-Light',
    label: 'Condensed Light',
    weight: 300,
    style: 'normal',
  },
  {
    name: 'Roboto_Condensed-LightItalic',
    label: 'Condensed Light Italic',
    weight: 300,
    style: 'italic',
  },
  {
    name: 'Roboto_SemiCondensed-Regular',
    label: 'SemiCondensed Regular',
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Roboto_SemiCondensed-Italic',
    label: 'SemiCondensed Italic',
    weight: 400,
    style: 'italic',
  },
];

export function useFontSwitcher() {
  const [currentFont, setCurrentFont] = useState('Roboto-MediumItalic');

  const changeFont = (fontName: string) => {
    const font = availableFonts.find(f => f.name === fontName);
    if (font) {
      // Update CSS custom properties
      document.documentElement.style.setProperty(
        '--font-primary',
        `'${font.name}', sans-serif`
      );
      document.documentElement.style.setProperty(
        '--font-sans',
        `'${font.name}', sans-serif`
      );
      document.documentElement.style.setProperty(
        '--font-serif',
        `'${font.name}', serif`
      );
      document.documentElement.style.setProperty(
        '--font-mono',
        `'${font.name}', monospace`
      );

      setCurrentFont(fontName);

      // Save to localStorage for persistence
      localStorage.setItem('veloz-selected-font', fontName);
    }
  };

  const resetToDefault = () => {
    changeFont('Roboto-MediumItalic');
  };

  const getCurrentFontInfo = () => {
    return availableFonts.find(f => f.name === currentFont);
  };

  // Load saved font on mount
  useEffect(() => {
    const savedFont = localStorage.getItem('veloz-selected-font');
    if (savedFont && availableFonts.find(f => f.name === savedFont)) {
      setCurrentFont(savedFont);
      changeFont(savedFont);
    }
  }, []);

  return {
    currentFont,
    changeFont,
    resetToDefault,
    getCurrentFontInfo,
    availableFonts,
  };
}

// Quick utility functions for direct font switching
export const switchFont = (fontName: string) => {
  const font = availableFonts.find(f => f.name === fontName);
  if (font) {
    document.documentElement.style.setProperty(
      '--font-primary',
      `'${font.name}', sans-serif`
    );
    document.documentElement.style.setProperty(
      '--font-sans',
      `'${font.name}', sans-serif`
    );
    document.documentElement.style.setProperty(
      '--font-serif',
      `'${font.name}', serif`
    );
    document.documentElement.style.setProperty(
      '--font-mono',
      `'${font.name}', monospace`
    );
    localStorage.setItem('veloz-selected-font', fontName);
  }
};

export const resetFont = () => {
  switchFont('Roboto-MediumItalic');
};
