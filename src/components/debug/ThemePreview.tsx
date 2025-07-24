"use client";

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
  '--base-50', '--base-100', '--base-200', '--base-300', '--base-400', '--base-500', '--base-600', '--base-700', '--base-800', '--base-900', '--base-950', '--base-1000',
  '--primary-50', '--primary-100', '--primary-200', '--primary-300', '--primary-400', '--primary-500', '--primary-600', '--primary-700', '--primary-800', '--primary-900', '--primary-950', '--primary-1000',
  '--accent-soft-gold', '--accent-sky', '--accent-rose', '--accent-lime',
  '--background', '--foreground', '--card', '--card-foreground', '--popover', '--popover-foreground', '--primary', '--primary-foreground', '--secondary', '--secondary-foreground', '--muted', '--muted-foreground', '--accent', '--accent-foreground', '--destructive', '--border', '--input', '--ring', '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--sidebar', '--sidebar-foreground', '--sidebar-primary', '--sidebar-primary-foreground', '--sidebar-accent', '--sidebar-accent-foreground', '--sidebar-border', '--sidebar-ring'
];

const fontVars = [
  '--font-sans', '--font-serif', '--font-mono', '--font-logo', '--display-weight', '--text-weight'
];

const radiusVars = ['--radius'];

export const ThemePreview: React.FC = () => {
  const [vars, setVars] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setVars(getCSSVariables());
  }, []);

  return (
    <div style={{ padding: 32, fontFamily: 'var(--font-sans)' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Theme Preview</h1>
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>Colors</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
          {colorVars.map((name) => (
            <div key={name} style={{ width: 120, border: '1px solid #ccc', borderRadius: 8, padding: 8, background: '#fff' }}>
              <div 
                style={{ 
                  height: 40, 
                  borderRadius: 4, 
                  border: '1px solid #eee',
                  background: `var(${name})`
                }} 
              />
              <div style={{ fontSize: 12, marginTop: 8 }}>{name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{vars[name]}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>Typography</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 16 }}>
          {fontVars.map((name) => (
            <div key={name} style={{ minWidth: 200 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{name}</div>
              <div style={{ fontFamily: vars[name] || 'inherit', fontWeight: vars['--display-weight'] || 500, fontSize: 20 }}>
                {name === '--font-logo' ? 'VELOZ' : 'The quick brown fox jumps over the lazy dog.'}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>{vars[name]}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>Radius & Spacing</h2>
        <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
          {radiusVars.map((name) => (
            <div key={name}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{name}</div>
              <div style={{ width: 64, height: 64, background: '#eee', borderRadius: vars[name] || 0, border: '1px solid #ccc' }} />
              <div style={{ fontSize: 12, color: '#666' }}>{vars[name]}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ThemePreview; 