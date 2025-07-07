export type EventCategory =
  | 'Casamiento'
  | 'Corporativos'
  | 'Culturales y artísticos'
  | 'Photoshoot'
  | 'Prensa'
  | 'Otros';

export interface CategoryStyle {
  name: string;
  displayName: {
    es: string;
    en: string;
    pt: string;
  };
  typography: {
    fontFamily: string;
    fontWeight: string;
    fontSize: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    letterSpacing: string;
    lineHeight: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  icon: string;
  description: {
    es: string;
    en: string;
    pt: string;
  };
}

export const EVENT_CATEGORIES: Record<EventCategory, CategoryStyle> = {
  Casamiento: {
    name: 'Casamiento',
    displayName: {
      es: 'Casamiento',
      en: 'Wedding',
      pt: 'Casamento',
    },
    typography: {
      fontFamily: 'font-serif', // Elegant serif for weddings
      fontWeight: 'font-medium',
      fontSize: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      letterSpacing: 'tracking-wide',
      lineHeight: 'leading-relaxed',
    },
    colors: {
      primary: 'text-rose-600',
      secondary: 'text-rose-500',
      accent: 'text-rose-400',
      background: 'bg-rose-50',
      text: 'text-gray-800',
    },
    icon: '💒',
    description: {
      es: 'Celebración de amor y unión',
      en: 'Celebration of love and union',
      pt: 'Celebração de amor e união',
    },
  },
  Corporativos: {
    name: 'Corporativos',
    displayName: {
      es: 'Corporativos',
      en: 'Corporate',
      pt: 'Corporativo',
    },
    typography: {
      fontFamily: 'font-sans', // Clean sans-serif for corporate
      fontWeight: 'font-semibold',
      fontSize: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      letterSpacing: 'tracking-tight',
      lineHeight: 'leading-tight',
    },
    colors: {
      primary: 'text-blue-600',
      secondary: 'text-blue-500',
      accent: 'text-blue-400',
      background: 'bg-blue-50',
      text: 'text-gray-900',
    },
    icon: '🏢',
    description: {
      es: 'Eventos empresariales y profesionales',
      en: 'Business and professional events',
      pt: 'Eventos empresariais e profissionais',
    },
  },
  'Culturales y artísticos': {
    name: 'Culturales y artísticos',
    displayName: {
      es: 'Culturales y artísticos',
      en: 'Cultural & Artistic',
      pt: 'Culturais e artísticos',
    },
    typography: {
      fontFamily: 'font-serif', // Artistic serif for cultural events
      fontWeight: 'font-normal',
      fontSize: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      letterSpacing: 'tracking-wide',
      lineHeight: 'leading-loose',
    },
    colors: {
      primary: 'text-purple-600',
      secondary: 'text-purple-500',
      accent: 'text-purple-400',
      background: 'bg-purple-50',
      text: 'text-gray-800',
    },
    icon: '🎨',
    description: {
      es: 'Eventos culturales y artísticos',
      en: 'Cultural and artistic events',
      pt: 'Eventos culturais e artísticos',
    },
  },
  Photoshoot: {
    name: 'Photoshoot',
    displayName: {
      es: 'Photoshoot',
      en: 'Photoshoot',
      pt: 'Photoshoot',
    },
    typography: {
      fontFamily: 'font-sans', // Modern sans-serif for photoshoots
      fontWeight: 'font-medium',
      fontSize: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      letterSpacing: 'tracking-normal',
      lineHeight: 'leading-normal',
    },
    colors: {
      primary: 'text-emerald-600',
      secondary: 'text-emerald-500',
      accent: 'text-emerald-400',
      background: 'bg-emerald-50',
      text: 'text-gray-700',
    },
    icon: '📸',
    description: {
      es: 'Sesiones fotográficas profesionales',
      en: 'Professional photo sessions',
      pt: 'Sessões fotográficas profissionais',
    },
  },
  Prensa: {
    name: 'Prensa',
    displayName: {
      es: 'Prensa',
      en: 'Press',
      pt: 'Imprensa',
    },
    typography: {
      fontFamily: 'font-sans', // Clean sans-serif for press
      fontWeight: 'font-bold',
      fontSize: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      letterSpacing: 'tracking-tight',
      lineHeight: 'leading-snug',
    },
    colors: {
      primary: 'text-red-600',
      secondary: 'text-red-500',
      accent: 'text-red-400',
      background: 'bg-red-50',
      text: 'text-gray-900',
    },
    icon: '📰',
    description: {
      es: 'Eventos de prensa y medios',
      en: 'Press and media events',
      pt: 'Eventos de imprensa e mídia',
    },
  },
  Otros: {
    name: 'Otros',
    displayName: {
      es: 'Otros',
      en: 'Others',
      pt: 'Outros',
    },
    typography: {
      fontFamily: 'font-sans', // Neutral sans-serif for others
      fontWeight: 'font-normal',
      fontSize: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      letterSpacing: 'tracking-normal',
      lineHeight: 'leading-normal',
    },
    colors: {
      primary: 'text-gray-600',
      secondary: 'text-gray-500',
      accent: 'text-gray-400',
      background: 'bg-gray-50',
      text: 'text-gray-700',
    },
    icon: '✨',
    description: {
      es: 'Otros tipos de eventos',
      en: 'Other types of events',
      pt: 'Outros tipos de eventos',
    },
  },
};

export const getCategoryStyle = (category: EventCategory): CategoryStyle => {
  return EVENT_CATEGORIES[category] || EVENT_CATEGORIES['Otros'];
};

export const getCategoryDisplayName = (
  category: EventCategory,
  language: 'es' | 'en' | 'pt' = 'es'
): string => {
  const style = getCategoryStyle(category);
  return style.displayName[language];
};

export const getCategoryDescription = (
  category: EventCategory,
  language: 'es' | 'en' | 'pt' = 'es'
): string => {
  const style = getCategoryStyle(category);
  return style.description[language];
};
