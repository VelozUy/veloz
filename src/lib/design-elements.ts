import fs from 'fs';
import path from 'path';

export type DesignElement = {
  name: string;
  slug: string;
  filePath: string;
  svgContent: string;
};

const DESIGN_ELEMENTS_DIR = path.join(
  process.cwd(),
  'docs',
  'Veloz Design Manual',
  'Elements'
);

function toSlug(fileName: string): string {
  return fileName
    .replace(/\.svg$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function readDesignElements(): DesignElement[] {
  if (!fs.existsSync(DESIGN_ELEMENTS_DIR)) {
    return [];
  }

  const fileNames = fs
    .readdirSync(DESIGN_ELEMENTS_DIR)
    .filter(f => f.toLowerCase().endsWith('.svg'))
    .sort((a, b) => a.localeCompare(b));

  const elements: DesignElement[] = fileNames.map(fileName => {
    const filePath = path.join(DESIGN_ELEMENTS_DIR, fileName);
    const svgContent = fs.readFileSync(filePath, 'utf8');
    return {
      name: fileName.replace(/\.svg$/i, ''),
      slug: toSlug(fileName),
      filePath,
      svgContent,
    };
  });

  return elements;
}

// Read once at module load time so pages can be fully static
const DESIGN_ELEMENTS_CACHE: DesignElement[] = readDesignElements();

export function getDesignElements(): DesignElement[] {
  return DESIGN_ELEMENTS_CACHE;
}

export function getDesignElementBySlug(
  slug: string
): DesignElement | undefined {
  return DESIGN_ELEMENTS_CACHE.find(e => e.slug === slug);
}
