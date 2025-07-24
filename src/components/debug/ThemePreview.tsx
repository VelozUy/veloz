'use client';

import React from 'react';

// Helper to get all CSS variables from :root
function getCSSVariables(): Record<string, string> {
  const style = getComputedStyle(document.documentElement);
  const vars: Record<string, string> = {};
  for (let i = 0; i < style.length; i++) {
    const name = style[i];
    if (name.startsWith('--')) {
      vars[name] = style.getPropertyValue(name).trim();
    }
  }
  return vars;
}

const colorVars = [
  '--base-50',
  '--base-100',
  '--base-200',
  '--base-300',
  '--base-400',
  '--base-500',
  '--base-600',
  '--base-700',
  '--base-800',
  '--base-900',
  '--base-950',
  '--base-1000',
  '--primary-50',
  '--primary-100',
  '--primary-200',
  '--primary-300',
  '--primary-400',
  '--primary-500',
  '--primary-600',
  '--primary-700',
  '--primary-800',
  '--primary-900',
  '--primary-950',
  '--primary-1000',
  '--accent-soft-gold',
  '--accent-sky',
  '--accent-rose',
  '--accent-lime',
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--border',
  '--input',
  '--ring',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
];

const fontVars = [
  '--font-sans',
  '--font-serif',
  '--font-mono',
  '--font-logo',
  '--display-weight',
  '--text-weight',
];

const radiusVars = ['--radius'];

export const ThemePreview: React.FC = () => {
  const [vars, setVars] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setVars(getCSSVariables());
  }, []);

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold">Theme Preview</h1>
      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Colors</h2>
        <div className="flex flex-wrap gap-4 mt-4">
          {colorVars.map(name => (
            <div
              key={name}
              className="w-30 border border-border rounded-lg p-2 bg-background"
            >
              <div
                className="h-10 rounded border border-border"
                style={{ background: `var(${name})` }}
              />
              <div className="text-xs mt-2">{name}</div>
              <div className="text-xs text-muted-foreground">{vars[name]}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="flex flex-wrap gap-8 mt-4">
          {fontVars.map(name => (
            <div key={name} className="min-w-50">
              <div className="text-base font-semibold">{name}</div>
              <div
                className="text-xl font-medium"
                style={{
                  fontFamily: vars[name] || 'inherit',
                  fontWeight: vars['--display-weight'] || 500,
                }}
              >
                {name === '--font-logo'
                  ? 'VELOZ'
                  : 'The quick brown fox jumps over the lazy dog.'}
              </div>
              <div className="text-xs text-muted-foreground">{vars[name]}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Radius & Spacing</h2>
        <div className="flex gap-8 mt-4">
          {radiusVars.map(name => (
            <div key={name}>
              <div className="text-base font-semibold">{name}</div>
              <div
                className="w-16 h-16 bg-muted border border-border"
                style={{ borderRadius: vars[name] || 0 }}
              />
              <div className="text-xs text-muted-foreground">{vars[name]}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ThemePreview;
