#!/usr/bin/env node

/**
 * Build-time data fetching script for Static Localized Routes
 * This script fetches ALL admin-editable content from Firestore and generates
 * static JSON files for each locale (es, en, pt) for better SEO and performance
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  getDoc,
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Import gallery layout generator
const { generateAllGalleryLayouts } = require('./gallery-layout-generator');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug Firebase configuration
console.log('🔧 Firebase config validation:');
console.log('  Project ID:', firebaseConfig.projectId ? 'Present' : 'Missing');
console.log('  API Key:', firebaseConfig.apiKey ? 'Present' : 'Missing');
console.log(
  '  Auth Domain:',
  firebaseConfig.authDomain ? 'Present' : 'Missing'
);

// Validate required config
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
if (missingFields.length > 0) {
  console.error('❌ Missing Firebase configuration:', missingFields);
  process.exit(1);
}

// Supported locales
const LOCALES = ['es', 'en', 'pt'];

// Static translations for UI elements
const STATIC_TRANSLATIONS = {
  es: {
    navigation: {
      home: 'Inicio',
      about: 'Sobre Nosotros',
      gallery: 'Nuestro Trabajo',
      contact: 'Trabajemos juntos',
    },
    homepage: {
      hero: {
        headline: 'Capturamos lo irrepetible',
        cta: {
          about: 'Sobre Nosotros',
          work: 'Nuestro Trabajo',
          contact: 'Trabajemos juntos',
        },
      },
    },
    contact: {
      title: '¿Nos ponemos en contacto?',
      subtitle:
        'Obtener una cotización es completamente gratis y sin compromiso. Típicamente respondemos dentro de las 2 horas posteriores a tu consulta.',
      form: {
        title: 'Formulario',
        name: {
          label: 'Tu nombre',
          placeholder: '*Nombre',
        },
        email: {
          label: 'Correo',
          placeholder: '*Email',
        },
        company: {
          label: 'Empresa',
          placeholder: 'Empresa',
          optional: '(opcional)',
        },
        phone: {
          label: 'Número',
          placeholder: 'Teléfono',
          optional: '(opcional)',
        },
        eventType: {
          label: '¿Qué tipo de evento tienes?',
          placeholder: '*Seleccionar',
          options: {
            corporate: 'Evento corporativo',
            product: 'Presentación de producto',
            birthday: 'Cumpleaños',
            wedding: 'Casamiento',
            concert: 'Concierto',
            exhibition: 'Exposiciones',
            other: 'Otros',
          },
        },
        location: {
          label: 'Lugar',
          placeholder: 'Lugar',
        },
        attendees: {
          label: 'Cantidad de asistentes esperados',
          placeholder: '*Cantidad',
        },
        services: {
          label: '¿Qué servicios te interesan?',
          placeholder: '*Servicios',
          options: {
            photography: 'Fotografía',
            video: 'Video',
            drone: 'Drone',
            studio: 'Sesión de fotos estudio',
            other: 'Otros',
          },
        },
        contactMethod: {
          label: '¿Cómo preferís que te contactemos?',
          placeholder: '*Seleccionar',
          options: {
            whatsapp: 'Whatsapp',
            email: 'Mail',
            call: 'Llamada',
          },
        },
        eventDate: {
          label: 'Fecha del evento',
          optional: '(opcional)',
          help: 'Si no tienes fecha definida, no te preocupes',
        },
        message: {
          label: 'Cuéntanos todos los detalles que te parezcan',
          optional: '(opcional)',
          placeholder: 'Detalles',
        },
        attachments: {
          label: 'Archivos adjuntos',
          optional: '(opcional)',
          description: 'Puedes adjuntar fotos o documentos',
        },
        submit: {
          button: 'Enviar mensaje',
          loading: 'Enviando...',
        },
        privacy: {
          line1: 'Al enviar este formulario, aceptas nuestra',
          line2: 'política de privacidad',
        },
      },
      success: {
        title: '¡Mensaje enviado!',
        message:
          '¡Gracias por contactarnos! te responderemos dentro de 24 horas con todos los detalles para hacer que tu evento sea increíble.',
        action: 'Enviar otro mensaje',
      },
      trust: {
        response: {
          title: 'Respuesta rápida',
          description:
            'Típicamente respondemos dentro de las 2 horas posteriores a tu consulta',
        },
        commitment: {
          title: 'Sin compromiso',
          description:
            'Obtener una cotización es completamente gratis y sin compromiso',
        },
      },
    },
    widget: {
      button: {
        desktop: '¿En qué evento estás pensando?',
        mobile: '¿En qué evento estás pensando?',
      },
      dialog: {
        title: 'Cuéntanos sobre tu evento',
      },
      eventTypes: {
        corporate: 'Evento Empresarial',
        product: 'Presentación de Producto',
        birthday: 'Cumpleaños',
        wedding: 'Boda',
        concert: 'Concierto',
        exhibition: 'Exposición',
        other: 'Otro tipo de evento',
      },
      steps: {
        eventType: {
          title: '¿En qué evento estás pensando?',
          subtitle: 'Cuéntanos qué quieres celebrar',
        },
        date: {
          title: '¿Ya tienes fecha?',
          subtitle: 'No te preocupes si aún no estás seguro',
          noDate: 'No tengo fecha',
        },
        location: {
          title: '¿Dónde será tu evento?',
          subtitle: 'Ayúdanos a entender mejor tu ubicación',
          placeholder: 'Ciudad, barrio o lugar específico',
          noLocation: 'Aún no tengo ubicación definida',
        },
        services: {
          title: '¿Qué servicios necesitas?',
          subtitle: 'Selecciona los servicios que te interesan',
          ceremony: {
            title: 'Ceremonia',
            subtitle: 'Fotografía y video de la ceremonia',
          },
          photography: {
            title: 'Fotografía',
            subtitle: 'Solo fotografía profesional',
          },
          videography: {
            title: 'Videografía',
            subtitle: 'Solo video profesional',
          },
          dj: {
            title: 'DJ y Música',
            subtitle: 'Ambientación musical para tu evento',
          },
          decor: {
            title: 'Decoración',
            subtitle: 'Ambientación y decoración del evento',
          },
          catering: {
            title: 'Catering',
            subtitle: 'Servicio de comida y bebidas',
          },
          transport: {
            title: 'Transporte',
            subtitle: 'Servicio de transporte para invitados',
          },
          other: {
            title: 'Otros servicios',
            subtitle: 'Cuéntanos qué más necesitas',
          },
        },
        contact: {
          title: '¿Quieres contarnos más?',
          subtitle: 'Elige cómo prefieres que nos contactemos',
          moreInfo: {
            title: 'Sí, quiero contarte más detalles',
            subtitle: 'Te llevamos al formulario completo',
          },
          callMe: {
            title: 'Quiero que me llamen',
            subtitle: 'Preferimos hablar por teléfono',
          },
        },
        phone: {
          title: '¡Perfecto! Te llamamos',
          subtitle: 'Déjanos tu número y te contactamos pronto',
          placeholder: 'Tu número de teléfono',
          button: 'Solicitar llamada',
          loading: 'Enviando...',
        },
        complete: {
          title: '¡Listo!',
          message:
            'Nos pondremos en contacto contigo muy pronto para conversar sobre tu evento.',
          button: 'Cerrar',
        },
      },
    },
    about: {
      title: 'Sobre Nosotros',
      subtitle:
        'Somos un equipo apasionado dedicado a capturar los momentos más importantes de tu vida con excelencia, calidez y agilidad.',
      philosophy: {
        title: 'Nuestra Filosofía',
        description:
          'Creemos que cada evento es único y merece ser documentado con la máxima dedicación. Nuestro enfoque no es solo capturar imágenes, sino contar historias que perduren en el tiempo. Combinamos técnica profesional con sensibilidad artística para crear recuerdos que emocionan y trascienden generaciones.',
      },
      methodology: {
        title: 'Nuestra Metodología',
        planning: {
          title: 'Planificación',
          description:
            'Estudiamos cada detalle del evento para anticipar los momentos clave.',
        },
        coverage: {
          title: 'Cobertura Integral',
          description:
            'Nuestro equipo se distribuye estratégicamente para no perder ningún momento.',
        },
        capture: {
          title: 'Captura Profesional',
          description:
            'Utilizamos técnicas avanzadas y equipos de última generación.',
        },
        postproduction: {
          title: 'Post-Producción',
          description:
            'Editamos cuidadosamente cada imagen y video para lograr resultados excepcionales.',
        },
      },
      values: {
        title: 'Nuestros Valores',
        passion: {
          title: 'Pasión',
          description:
            'Amamos lo que hacemos y se refleja en cada imagen que capturamos.',
        },
        teamwork: {
          title: 'Trabajo en Equipo',
          description:
            'Nuestro modelo colaborativo nos permite cubrir cada momento importante.',
        },
        quality: {
          title: 'Calidad Técnica',
          description:
            'Utilizamos equipos profesionales y técnicas avanzadas para resultados excepcionales.',
        },
        agility: {
          title: 'Agilidad',
          description:
            'Nos adaptamos rápidamente a cualquier situación para no perder ningún momento.',
        },
        excellence: {
          title: 'Excelencia',
          description:
            'Buscamos la perfección en cada proyecto, superando las expectativas.',
        },
        trust: {
          title: 'Confianza',
          description:
            'Construimos relaciones duraderas basadas en la transparencia y profesionalismo.',
        },
      },
      faq: {
        title: 'Preguntas Frecuentes',
      },
    },
    footer: {
      copyright: '© 2025 Veloz. Todos los derechos reservados.',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Servicio',
      cookies: 'Configuración de Cookies',
    },
    legal: {
      privacy: {
        title: 'Política de Privacidad',
        description: 'Política de privacidad y protección de datos de Veloz.',
        sections: {
          collect: {
            title: 'Información que Recopilamos',
            intro:
              'Recopilamos información que nos proporcionas directamente, como cuando:',
            items: {
              form: 'Completas nuestro formulario de contacto',
              email: 'Nos envías un correo electrónico',
              phone: 'Nos contactas por teléfono o WhatsApp',
              services: 'Utilizas nuestros servicios',
            },
          },
          use: {
            title: 'Cómo Utilizamos tu Información',
            intro: 'Utilizamos la información que recopilamos para:',
            items: {
              respond: 'Responder a tus consultas y solicitudes',
              provide: 'Proporcionar nuestros servicios de fotografía y video',
              communicate: 'Comunicarnos contigo sobre nuestros servicios',
              improve: 'Mejorar nuestros servicios y experiencia del cliente',
            },
          },
          protection: {
            title: 'Protección de Datos',
            content:
              'Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal contra el acceso no autorizado, la alteración, divulgación o destrucción.',
          },
          rights: {
            title: 'Tus Derechos',
            intro: 'Tienes derecho a:',
            items: {
              access: 'Acceder a la información personal que tenemos sobre ti',
              correct: 'Corregir información inexacta o incompleta',
              delete: 'Solicitar la eliminación de tu información personal',
              object: 'Oponerte al procesamiento de tu información personal',
            },
          },
          changes: {
            title: 'Cambios a esta Política',
            content:
              'Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cualquier cambio significativo publicando la nueva política en nuestro sitio web.',
          },
        },
      },
      terms: {
        title: 'Términos de Servicio',
        description: 'Términos y condiciones de servicio de Veloz.',
        sections: {
          acceptance: {
            title: 'Aceptación de los Términos',
            content:
              'Al utilizar nuestros servicios de fotografía y video, aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.',
          },
          services: {
            title: 'Descripción de Servicios',
            intro:
              'Veloz proporciona servicios profesionales de fotografía y videografía para eventos, incluyendo pero no limitado a:',
            items: {
              corporate: 'Fotografía de eventos corporativos',
              videography: 'Videografía profesional',
              weddings: 'Fotografía de bodas y eventos sociales',
              editing: 'Edición y post-producción',
              delivery: 'Entrega de material digital y físico',
            },
          },
          payments: {
            title: 'Reservas y Pagos',
            content:
              'Las reservas se confirman con un depósito del 50% del valor total del servicio. El pago restante debe realizarse antes de la entrega del material final. Los precios están sujetos a cambios sin previo aviso.',
          },
          cancellations: {
            title: 'Cancelaciones y Reembolsos',
            content:
              'Las cancelaciones con más de 7 días de anticipación recibirán un reembolso completo del depósito. Las cancelaciones con menos de 7 días de anticipación no son reembolsables. En caso de cancelación por parte de Veloz, se realizará un reembolso completo.',
          },
          copyright: {
            title: 'Derechos de Autor',
            content:
              'Veloz retiene los derechos de autor de todas las imágenes y videos producidos. Los clientes reciben una licencia de uso personal y comercial de las imágenes entregadas. No se permite la modificación o reventa de las imágenes sin autorización escrita.',
          },
          delivery: {
            title: 'Tiempos de Entrega',
            intro: 'Los tiempos de entrega típicos son:',
            items: {
              photos: 'Fotografías: 5-10 días hábiles',
              videos: 'Videos: 10-15 días hábiles',
              special: 'Ediciones especiales: según complejidad',
            },
            note: 'Los tiempos pueden variar según la complejidad del proyecto y la carga de trabajo.',
          },
          responsibilities: {
            title: 'Responsabilidades del Cliente',
            intro: 'El cliente se compromete a:',
            items: {
              info: 'Proporcionar información precisa sobre el evento',
              access: 'Facilitar el acceso al lugar del evento',
              schedule: 'Respetar los horarios acordados',
              safety: 'Proporcionar un entorno seguro para el equipo',
            },
          },
          liability: {
            title: 'Limitación de Responsabilidad',
            content:
              'Veloz no será responsable por daños indirectos, incidentales o consecuentes que puedan resultar del uso de nuestros servicios. Nuestra responsabilidad total está limitada al monto pagado por los servicios.',
          },
        },
      },
      cookies: {
        title: 'Configuración de Cookies',
        description: 'Configuración y gestión de cookies en Veloz.',
        sections: {
          what: {
            title: '¿Qué son las Cookies?',
            content:
              'Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a mejorar tu experiencia de navegación y a entender cómo utilizas nuestro sitio.',
          },
          types: {
            title: 'Tipos de Cookies que Utilizamos',
            intro:
              'Nuestro sitio web utiliza principalmente servicios de terceros que pueden establecer cookies automáticamente. No utilizamos cookies propias para funcionalidades esenciales.',
            none: {
              title: 'Sin Cookies Propias',
              content:
                'No establecemos cookies propias en tu dispositivo. Todas nuestras funcionalidades utilizan localStorage y sessionStorage del navegador, que no son cookies.',
            },
          },
          thirdparty: {
            title: 'Cookies de Terceros',
            intro:
              'Utilizamos servicios de terceros que pueden establecer cookies automáticamente:',
            items: {
              analytics:
                'Firebase Analytics - Para analizar el tráfico del sitio web y entender cómo los visitantes utilizan nuestro sitio',
              fonts:
                'Google Fonts - Para cargar fuentes tipográficas que mejoran la apariencia del sitio',
            },
            note: 'Estos servicios establecen cookies automáticamente y no podemos controlar directamente qué cookies establecen.',
          },
          storage: {
            title: 'Almacenamiento Local',
            intro:
              'En lugar de cookies, utilizamos el almacenamiento local del navegador:',
            items: {
              localStorage:
                'localStorage - Para guardar preferencias del usuario (idioma, consentimiento GDPR)',
              sessionStorage:
                'sessionStorage - Para datos temporales de la sesión actual',
            },
            note: 'Estos datos se almacenan en tu navegador y no se envían automáticamente a nuestros servidores.',
          },
          management: {
            title: 'Gestión de Cookies',
            intro:
              'Puedes controlar las cookies de terceros de varias maneras:',
            browser: {
              title: 'Configuración del Navegador',
              content:
                'La mayoría de los navegadores te permiten ver qué cookies tienes y eliminarlas individualmente o bloquearlas de sitios específicos o de todos los sitios.',
            },
            preferences: {
              title: 'Configuración de Preferencias',
              content:
                'Puedes configurar tu navegador para rechazar todas las cookies o para indicar cuándo se está enviando una cookie.',
            },
            storage: {
              title: 'Limpiar Almacenamiento Local',
              content:
                'Para eliminar nuestros datos almacenados localmente, puedes limpiar el almacenamiento del navegador en la configuración de privacidad.',
            },
          },
          impact: {
            title: 'Impacto de Deshabilitar Cookies',
            content:
              'Si deshabilitas las cookies de terceros, algunas funcionalidades como las fuentes tipográficas pueden no cargar correctamente. El sitio seguirá funcionando, pero la experiencia visual puede verse afectada.',
          },
          updates: {
            title: 'Actualizaciones de esta Política',
            content:
              'Podemos actualizar esta política de cookies ocasionalmente. Te recomendamos revisar esta página periódicamente para mantenerte informado sobre cómo utilizamos las cookies.',
          },
        },
      },
      contact: {
        title: 'Contacto',
        intro: 'Si tienes preguntas sobre esta política, contáctanos en:',
      },
      lastUpdated: 'Última actualización: Enero 2025',
    },
    validation: {
      required: 'Este campo es requerido',
      email: 'Por favor ingresa un email válido para que podamos responderte',
      minLength: 'Debe tener al menos {{count}} caracteres',
    },
  },
  en: {
    navigation: {
      home: 'Home',
      about: 'About Us',
      gallery: 'Our Work',
      contact: "Let's work together",
    },
    homepage: {
      hero: {
        headline: 'Capturing the Unrepeatable',
        cta: {
          about: 'About Us',
          work: 'Our Work',
          contact: "Let's work together",
        },
      },
    },
    contact: {
      title: 'Shall we get in touch?',
      subtitle:
        'Getting a quote is completely free and without commitment. We typically respond within 2 hours of your inquiry.',
      form: {
        title: 'Form',
        name: {
          label: 'Name',
          placeholder: '*Name',
        },
        email: {
          label: 'Email',
          placeholder: '*Email',
        },
        company: {
          label: 'Company',
          placeholder: 'Company',
          optional: '(optional)',
        },
        phone: {
          label: 'Mobile number',
          placeholder: 'Mobile',
          optional: '(optional)',
        },
        eventType: {
          label: 'What type of event do you have?',
          placeholder: '*Select',
          options: {
            corporate: 'Corporate event',
            product: 'Product presentation',
            birthday: 'Birthday',
            wedding: 'Wedding',
            concert: 'Concert',
            exhibition: 'Exhibitions',
            other: 'Others',
          },
        },
        location: {
          label: 'Event location (city)',
          placeholder: '*City',
        },
        attendees: {
          label: 'Expected number of attendees',
          placeholder: '*Quantity',
        },
        services: {
          label: 'What services are you interested in?',
          placeholder: '*Services',
          options: {
            photography: 'Photography',
            video: 'Video',
            drone: 'Drone',
            studio: 'Studio photo session',
            other: 'Others',
          },
        },
        contactMethod: {
          label: 'How would you prefer us to contact you?',
          placeholder: '*Select',
          options: {
            whatsapp: 'WhatsApp',
            email: 'Email',
            call: 'Call',
          },
        },
        eventDate: {
          label: 'Event Date',
          optional: '(optional)',
          help: 'Approximate date is fine',
        },
        message: {
          label: 'Tell us all the details you think are relevant',
          optional: '(optional)',
          placeholder: 'Details',
        },
        attachments: {
          label: 'Attachments',
          optional: '(optional)',
          description: 'You can attach photos or documents',
        },
        submit: {
          button: 'Send Message',
          loading: 'Sending...',
        },
        privacy: {
          line1: 'We respect your privacy.',
          line2: 'We will only contact you about your event.',
        },
      },
      success: {
        title: 'Message sent!',
        message:
          "Thank you for contacting us! We'll get back to you within 24 hours with all the details to make your event amazing.",
        action: 'Send another message',
      },
      trust: {
        response: {
          title: 'Quick Response',
          description: 'We typically respond within 2 hours after your inquiry',
        },
        commitment: {
          title: 'No Commitment',
          description:
            'Getting a quote is completely free and without commitment',
        },
      },
    },
    widget: {
      button: {
        desktop: 'What event are you thinking about?',
        mobile: 'Your event?',
      },
      dialog: {
        title: 'Tell us about your event',
      },
      eventTypes: {
        corporate: 'Corporate Event',
        product: 'Product Launch',
        birthday: 'Birthday',
        wedding: 'Wedding',
        concert: 'Concert',
        exhibition: 'Exhibition',
        other: 'Other type of event',
      },
      steps: {
        eventType: {
          title: 'What event are you thinking about?',
          subtitle: 'Tell us what you want to celebrate',
        },
        date: {
          title: 'Do you have a date already?',
          subtitle: "Don't worry if you're not sure yet",
          noDate: 'No date',
        },
        location: {
          title: 'Where will your event be?',
          subtitle: 'Help us understand your location better',
          placeholder: 'City, neighborhood or specific venue',
          noLocation: "I don't have a location set yet",
        },
        services: {
          title: 'What services do you need?',
          subtitle: 'Select the services you are interested in',
          ceremony: {
            title: 'Ceremony',
            subtitle: 'Photography and video of the ceremony',
          },
          photography: {
            title: 'Photography',
            subtitle: 'Professional photography only',
          },
          videography: {
            title: 'Videography',
            subtitle: 'Professional video only',
          },
          dj: {
            title: 'DJ & Music',
            subtitle: 'Musical ambiance for your event',
          },
          decor: {
            title: 'Decoration',
            subtitle: 'Event decoration and ambiance',
          },
          catering: {
            title: 'Catering',
            subtitle: 'Food and beverage service',
          },
          transport: {
            title: 'Transportation',
            subtitle: 'Transportation service for guests',
          },
          other: {
            title: 'Other services',
            subtitle: 'Tell us what else you need',
          },
        },
        contact: {
          title: 'Want to tell us more?',
          subtitle: 'Choose how you prefer us to contact you',
          moreInfo: {
            title: 'Yes, I want to tell you more details',
            subtitle: 'We take you to the complete form',
          },
          callMe: {
            title: 'I want you to call me',
            subtitle: 'We prefer to talk by phone',
          },
        },
        phone: {
          title: 'Perfect! We call you',
          subtitle: 'Leave us your number and we contact you soon',
          placeholder: 'Your phone number',
          button: 'Request call',
          loading: 'Sending...',
        },
        complete: {
          title: 'Ready!',
          message: 'We will contact you very soon to talk about your event.',
          button: 'Close',
        },
      },
    },
    about: {
      title: 'About Us',
      subtitle:
        'We are a passionate team dedicated to capturing the most important moments of your life with excellence, warmth and agility.',
      philosophy: {
        title: 'Our Philosophy',
        description:
          'We believe that every event is unique and deserves to be documented with maximum dedication. Our approach is not just to capture images, but to tell stories that endure over time. We combine professional technique with artistic sensitivity to create memories that move and transcend generations.',
      },
      methodology: {
        title: 'Our Methodology',
        planning: {
          title: 'Planning',
          description:
            'We study every detail of the event to anticipate key moments.',
        },
        coverage: {
          title: 'Comprehensive Coverage',
          description:
            'Our team is strategically distributed to not miss any moment.',
        },
        capture: {
          title: 'Professional Capture',
          description:
            'We use advanced techniques and state-of-the-art equipment.',
        },
        postproduction: {
          title: 'Post-Production',
          description:
            'We carefully edit every image and video to achieve exceptional results.',
        },
      },
      values: {
        title: 'Our Values',
        passion: {
          title: 'Passion',
          description:
            'We love what we do and it shows in every image we capture.',
        },
        teamwork: {
          title: 'Teamwork',
          description:
            'Our collaborative model allows us to cover every important moment.',
        },
        quality: {
          title: 'Technical Quality',
          description:
            'We use professional equipment and advanced techniques for exceptional results.',
        },
        agility: {
          title: 'Agility',
          description:
            'We adapt quickly to any situation to never miss a moment.',
        },
        excellence: {
          title: 'Excellence',
          description:
            'We strive for perfection in every project, exceeding expectations.',
        },
        trust: {
          title: 'Trust',
          description:
            'We build lasting relationships based on transparency and professionalism.',
        },
      },
      faq: {
        title: 'Frequently Asked Questions',
      },
    },
    footer: {
      copyright: '© 2025 Veloz. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      cookies: 'Cookies Settings',
    },
    legal: {
      privacy: {
        title: 'Privacy Policy',
        description:
          'Privacy policy and data protection information for Veloz.',
        sections: {
          collect: {
            title: 'Information We Collect',
            intro:
              'We collect information that you provide directly to us, such as when:',
            items: {
              form: 'You complete our contact form',
              email: 'You send us an email',
              phone: 'You contact us by phone or WhatsApp',
              services: 'You use our services',
            },
          },
          use: {
            title: 'How We Use Your Information',
            intro: 'We use the information we collect to:',
            items: {
              respond: 'Respond to your inquiries and requests',
              provide: 'Provide our photography and video services',
              communicate: 'Communicate with you about our services',
              improve: 'Improve our services and customer experience',
            },
          },
          protection: {
            title: 'Data Protection',
            content:
              'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
          },
          rights: {
            title: 'Your Rights',
            intro: 'You have the right to:',
            items: {
              access: 'Access the personal information we have about you',
              correct: 'Correct inaccurate or incomplete information',
              delete: 'Request deletion of your personal information',
              object: 'Object to the processing of your personal information',
            },
          },
          changes: {
            title: 'Changes to This Policy',
            content:
              'We may update this privacy policy occasionally. We will notify you of any significant changes by posting the new policy on our website.',
          },
        },
      },
      terms: {
        title: 'Terms of Service',
        description: 'Terms and conditions of service for Veloz.',
        sections: {
          acceptance: {
            title: 'Acceptance of Terms',
            content:
              'By using our photography and video services, you agree to be bound by these terms and conditions. If you do not agree to any part of these terms, you should not use our services.',
          },
          services: {
            title: 'Service Description',
            intro:
              'Veloz provides professional photography and videography services for events, including but not limited to:',
            items: {
              corporate: 'Corporate event photography',
              videography: 'Professional videography',
              weddings: 'Wedding and social event photography',
              editing: 'Editing and post-production',
              delivery: 'Delivery of digital and physical materials',
            },
          },
          payments: {
            title: 'Bookings and Payments',
            content:
              'Bookings are confirmed with a 50% deposit of the total service value. The remaining payment must be made before delivery of the final material. Prices are subject to change without notice.',
          },
          cancellations: {
            title: 'Cancellations and Refunds',
            content:
              'Cancellations with more than 7 days notice will receive a full refund of the deposit. Cancellations with less than 7 days notice are non-refundable. In case of cancellation by Veloz, a full refund will be provided.',
          },
          copyright: {
            title: 'Copyright',
            content:
              'Veloz retains copyright of all images and videos produced. Clients receive a personal and commercial use license for delivered images. Modification or resale of images is not permitted without written authorization.',
          },
          delivery: {
            title: 'Delivery Times',
            intro: 'Typical delivery times are:',
            items: {
              photos: 'Photographs: 5-10 business days',
              videos: 'Videos: 10-15 business days',
              special: 'Special edits: according to complexity',
            },
            note: 'Times may vary depending on project complexity and workload.',
          },
          responsibilities: {
            title: 'Client Responsibilities',
            intro: 'The client commits to:',
            items: {
              info: 'Provide accurate information about the event',
              access: 'Facilitate access to the event location',
              schedule: 'Respect agreed schedules',
              safety: 'Provide a safe environment for the team',
            },
          },
          liability: {
            title: 'Limitation of Liability',
            content:
              'Veloz will not be responsible for indirect, incidental, or consequential damages that may result from the use of our services. Our total liability is limited to the amount paid for the services.',
          },
        },
      },
      cookies: {
        title: 'Cookies Settings',
        description: 'Cookie settings and management for Veloz.',
        sections: {
          what: {
            title: 'What are Cookies?',
            content:
              'Cookies are small text files that are stored on your device when you visit our website. They help us improve your browsing experience and understand how you use our site.',
          },
          types: {
            title: 'Types of Cookies We Use',
            intro:
              'Our website primarily uses third-party services that may set cookies automatically. We do not use our own cookies for essential functionalities.',
            none: {
              title: 'No Own Cookies',
              content:
                'We do not set our own cookies on your device. All our functionalities use browser localStorage and sessionStorage, which are not cookies.',
            },
          },
          thirdparty: {
            title: 'Third-Party Cookies',
            intro:
              'We use third-party services that may set cookies automatically:',
            items: {
              analytics:
                'Firebase Analytics - To analyze website traffic and understand how visitors use our site',
              fonts:
                'Google Fonts - To load typography fonts that improve the site appearance',
            },
            note: 'These services set cookies automatically and we cannot directly control which cookies they set.',
          },
          storage: {
            title: 'Local Storage',
            intro: 'Instead of cookies, we use browser local storage:',
            items: {
              localStorage:
                'localStorage - To save user preferences (language, GDPR consent)',
              sessionStorage: 'sessionStorage - For temporary session data',
            },
            note: 'This data is stored in your browser and is not automatically sent to our servers.',
          },
          management: {
            title: 'Cookie Management',
            intro: 'You can control third-party cookies in several ways:',
            browser: {
              title: 'Browser Settings',
              content:
                'Most browsers allow you to see what cookies you have and delete them individually or block them from specific sites or all sites.',
            },
            preferences: {
              title: 'Preference Settings',
              content:
                'You can set your browser to reject all cookies or to indicate when a cookie is being sent.',
            },
            storage: {
              title: 'Clear Local Storage',
              content:
                'To remove our locally stored data, you can clear browser storage in privacy settings.',
            },
          },
          impact: {
            title: 'Impact of Disabling Cookies',
            content:
              'If you disable third-party cookies, some functionalities like typography fonts may not load properly. The site will continue to work, but the visual experience may be affected.',
          },
          updates: {
            title: 'Updates to This Policy',
            content:
              'We may update this cookie policy occasionally. We recommend reviewing this page periodically to stay informed about how we use cookies.',
          },
        },
      },
      contact: {
        title: 'Contact',
        intro: 'If you have questions about this policy, contact us at:',
      },
      lastUpdated: 'Last updated: January 2025',
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email so we can get back to you',
      minLength: 'Must be at least {{count}} characters',
    },
  },
  pt: {
    navigation: {
      home: 'Início',
      about: 'Sobre Nós',
      gallery: 'Nosso Trabalho',
      contact: 'Vamos trabalhar juntos',
    },
    homepage: {
      hero: {
        headline: 'Capturamos o que não se repete',
        cta: {
          about: 'Sobre Nós',
          work: 'Nosso Trabalho',
          contact: 'Vamos trabalhar juntos',
        },
      },
    },
    contact: {
      title: 'Vamos entrar em contato?',
      subtitle:
        'Obter uma cotação é completamente gratuito e sem compromisso. Normalmente respondemos dentro de 2 horas após sua consulta.',
      form: {
        title: 'Formulário',
        name: {
          label: 'Nome',
          placeholder: '*Nome',
        },
        email: {
          label: 'Email',
          placeholder: '*Email',
        },
        company: {
          label: 'Empresa',
          placeholder: 'Empresa',
          optional: '(opcional)',
        },
        phone: {
          label: 'Número',
          placeholder: 'Celular',
          optional: '(opcional)',
        },
        eventType: {
          label: 'Que tipo de evento você tem?',
          placeholder: '*Selecionar',
          options: {
            corporate: 'Evento corporativo',
            product: 'Apresentação de produto',
            birthday: 'Aniversário',
            wedding: 'Casamento',
            concert: 'Show',
            exhibition: 'Exposições',
            other: 'Outros',
          },
        },
        location: {
          label: 'Local do evento (cidade)',
          placeholder: '*Cidade',
        },
        attendees: {
          label: 'Número esperado de participantes',
          placeholder: '*Quantidade',
        },
        services: {
          label: 'Que serviços você está interessado?',
          placeholder: '*Serviços',
          options: {
            photography: 'Fotografia',
            video: 'Vídeo',
            drone: 'Drone',
            studio: 'Sessão de fotos estúdio',
            other: 'Outros',
          },
        },
        contactMethod: {
          label: 'Como você prefere que entremos em contato?',
          placeholder: '*Selecionar',
          options: {
            whatsapp: 'WhatsApp',
            email: 'Email',
            call: 'Ligação',
          },
        },
        eventDate: {
          label: 'Data do evento',
          optional: '(opcional)',
          help: 'Se você não tem data definida, não se preocupe',
        },
        message: {
          label: 'Conte-nos todos os detalhes que achar relevantes',
          optional: '(opcional)',
          placeholder: 'Detalhes',
        },
        attachments: {
          label: 'Anexos',
          optional: '(opcional)',
          description: 'Você pode anexar fotos ou documentos',
        },
        submit: {
          button: 'Enviar mensagem',
          loading: 'Enviando...',
        },
        privacy: {
          line1: 'Respeitamos sua privacidade.',
          line2: 'Só entraremos em contato sobre seu evento.',
        },
      },
      success: {
        title: 'Mensagem enviada!',
        message:
          'Obrigado por entrar em contato! responderemos dentro de 24 horas com todos os detalhes para tornar seu evento incrível.',
        action: 'Enviar outra mensagem',
      },
      trust: {
        response: {
          title: 'Resposta Rápida',
          description:
            'Normalmente respondemos dentro de 2 horas após sua consulta',
        },
        commitment: {
          title: 'Sem Compromisso',
          description:
            'Obter um orçamento é completamente gratuito e sem compromisso',
        },
      },
    },
    widget: {
      button: {
        desktop: 'Em que evento você está pensando?',
        mobile: 'Seu evento?',
      },
      dialog: {
        title: 'Conte-nos sobre seu evento',
      },
      eventTypes: {
        corporate: 'Evento Corporativo',
        product: 'Lançamento de Produto',
        birthday: 'Aniversário',
        wedding: 'Casamento',
        concert: 'Show',
        exhibition: 'Exposição',
        other: 'Outro tipo de evento',
      },
      steps: {
        eventType: {
          title: 'Em que evento você está pensando?',
          subtitle: 'Conte-nos o que quer comemorar',
        },
        date: {
          title: 'Já tem uma data?',
          subtitle: 'Não se preocupe se ainda não tem certeza',
          noDate: 'Sem data',
        },
        location: {
          title: 'Onde será seu evento?',
          subtitle: 'Ajude-nos a entender melhor sua localização',
          placeholder: 'Cidade, bairro ou local específico',
          noLocation: 'Ainda não tenho uma localização definida',
        },
        services: {
          title: 'Que serviços você precisa?',
          subtitle: 'Selecione os serviços que te interessam',
          ceremony: {
            title: 'Cerimônia',
            subtitle: 'Fotografia e vídeo da cerimônia',
          },
          photography: {
            title: 'Fotografia',
            subtitle: 'Apenas fotografia profissional',
          },
          videography: {
            title: 'Videografia',
            subtitle: 'Apenas vídeo profissional',
          },
          dj: {
            title: 'DJ e Música',
            subtitle: 'Ambiente musical para seu evento',
          },
          decor: {
            title: 'Decoração',
            subtitle: 'Decoração e ambiente do evento',
          },
          catering: {
            title: 'Catering',
            subtitle: 'Serviço de comida e bebidas',
          },
          transport: {
            title: 'Transporte',
            subtitle: 'Serviço de transporte para convidados',
          },
          other: {
            title: 'Outros serviços',
            subtitle: 'Conte-nos o que mais você precisa',
          },
        },
        contact: {
          title: 'Quer nos contar mais?',
          subtitle: 'Escolha como prefere que entremos em contato',
          moreInfo: {
            title: 'Sim, quero contar mais detalhes',
            subtitle: 'Levamos você ao formulário completo',
          },
          callMe: {
            title: 'Quero que me liguem',
            subtitle: 'Preferimos falar por telefone',
          },
        },
        phone: {
          title: 'Perfeito! Te ligamos',
          subtitle: 'Deixe seu número e entraremos em contato em breve',
          placeholder: 'Seu número de telefone',
          button: 'Solicitar ligação',
          loading: 'Enviando...',
        },
        complete: {
          title: 'Pronto!',
          message:
            'Entraremos em contato muito em breve para conversar sobre seu evento.',
          button: 'Fechar',
        },
      },
    },
    about: {
      title: 'Sobre Nós',
      subtitle:
        'Somos uma equipe apaixonada dedicada a capturar os momentos mais importantes da sua vida com excelência, carinho e agilidade.',
      philosophy: {
        title: 'Nossa Filosofia',
        description:
          'Acreditamos que cada evento é único e merece ser documentado com máxima dedicação. Nossa abordagem não é apenas capturar imagens, mas contar histórias que perduram no tempo. Combinamos técnica profissional com sensibilidade artística para criar memórias que emocionam e transcendem gerações.',
      },
      methodology: {
        title: 'Nossa Metodologia',
        planning: {
          title: 'Planejamento',
          description:
            'Estudamos cada detalhe do evento para antecipar os momentos-chave.',
        },
        coverage: {
          title: 'Cobertura Integral',
          description:
            'Nossa equipe se distribui estrategicamente para não perder nenhum momento.',
        },
        capture: {
          title: 'Captura Profissional',
          description:
            'Utilizamos técnicas avançadas e equipamentos de última geração.',
        },
        postproduction: {
          title: 'Pós-Produção',
          description:
            'Editamos cuidadosamente cada imagem e vídeo para alcançar resultados excepcionais.',
        },
      },
      values: {
        title: 'Nossos Valores',
        passion: {
          title: 'Paixão',
          description:
            'Amamos o que fazemos e isso se reflete em cada imagem que capturamos.',
        },
        teamwork: {
          title: 'Trabalho em Equipe',
          description:
            'Nosso modelo colaborativo nos permite cobrir cada momento importante.',
        },
        quality: {
          title: 'Qualidade Técnica',
          description:
            'Utilizamos equipamentos profissionais e técnicas avançadas para resultados excepcionais.',
        },
        agility: {
          title: 'Agilidade',
          description:
            'Nos adaptamos rapidamente a qualquer situação para não perder nenhum momento.',
        },
        excellence: {
          title: 'Excelência',
          description:
            'Buscamos a perfeição em cada projeto, superando expectativas.',
        },
        trust: {
          title: 'Confiança',
          description:
            'Construímos relacionamentos duradouros baseados na transparência e profissionalismo.',
        },
      },
      faq: {
        title: 'Perguntas Frequentes',
      },
    },
    footer: {
      copyright: '© 2025 Veloz. Todos os direitos reservados.',
      privacy: 'Política de Privacidade',
      terms: 'Termos de Serviço',
      cookies: 'Configurações de Cookies',
    },
    legal: {
      privacy: {
        title: 'Política de Privacidade',
        description: 'Política de privacidade e proteção de dados da Veloz.',
        sections: {
          collect: {
            title: 'Informações que Coletamos',
            intro:
              'Coletamos informações que você nos fornece diretamente, como quando:',
            items: {
              form: 'Você preenche nosso formulário de contato',
              email: 'Você nos envia um email',
              phone: 'Você nos contata por telefone ou WhatsApp',
              services: 'Você utiliza nossos serviços',
            },
          },
          use: {
            title: 'Como Utilizamos suas Informações',
            intro: 'Utilizamos as informações que coletamos para:',
            items: {
              respond: 'Responder suas consultas e solicitações',
              provide: 'Fornecer nossos serviços de fotografia e vídeo',
              communicate: 'Comunicar com você sobre nossos serviços',
              improve: 'Melhorar nossos serviços e experiência do cliente',
            },
          },
          protection: {
            title: 'Proteção de Dados',
            content:
              'Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.',
          },
          rights: {
            title: 'Seus Direitos',
            intro: 'Você tem o direito de:',
            items: {
              access: 'Acessar as informações pessoais que temos sobre você',
              correct: 'Corrigir informações imprecisas ou incompletas',
              delete: 'Solicitar a exclusão de suas informações pessoais',
              object: 'Opor-se ao processamento de suas informações pessoais',
            },
          },
          changes: {
            title: 'Alterações nesta Política',
            content:
              'Podemos atualizar esta política de privacidade ocasionalmente. Notificaremos você sobre quaisquer alterações significativas publicando a nova política em nosso site.',
          },
        },
      },
      terms: {
        title: 'Termos de Serviço',
        description: 'Termos e condições de serviço da Veloz.',
        sections: {
          acceptance: {
            title: 'Aceitação dos Termos',
            content:
              'Ao utilizar nossos serviços de fotografia e vídeo, você concorda em estar sujeito a estes termos e condições. Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.',
          },
          services: {
            title: 'Descrição dos Serviços',
            intro:
              'A Veloz fornece serviços profissionais de fotografia e videografia para eventos, incluindo mas não se limitando a:',
            items: {
              corporate: 'Fotografia de eventos corporativos',
              videography: 'Videografia profissional',
              weddings: 'Fotografia de casamentos e eventos sociais',
              editing: 'Edição e pós-produção',
              delivery: 'Entrega de material digital e físico',
            },
          },
          payments: {
            title: 'Reservas e Pagamentos',
            content:
              'As reservas são confirmadas com um depósito de 50% do valor total do serviço. O pagamento restante deve ser realizado antes da entrega do material final. Os preços estão sujeitos a alterações sem aviso prévio.',
          },
          cancellations: {
            title: 'Cancelamentos e Reembolsos',
            content:
              'Cancelamentos com mais de 7 dias de antecedência receberão reembolso integral do depósito. Cancelamentos com menos de 7 dias de antecedência não são reembolsáveis. Em caso de cancelamento por parte da Veloz, será fornecido reembolso integral.',
          },
          copyright: {
            title: 'Direitos Autorais',
            content:
              'A Veloz retém os direitos autorais de todas as imagens e vídeos produzidos. Os clientes recebem uma licença de uso pessoal e comercial das imagens entregues. Não é permitida a modificação ou revenda das imagens sem autorização escrita.',
          },
          delivery: {
            title: 'Prazos de Entrega',
            intro: 'Os prazos de entrega típicos são:',
            items: {
              photos: 'Fotografias: 5-10 dias úteis',
              videos: 'Vídeos: 10-15 dias úteis',
              special: 'Edições especiais: conforme complexidade',
            },
            note: 'Os prazos podem variar dependendo da complexidade do projeto e da carga de trabalho.',
          },
          responsibilities: {
            title: 'Responsabilidades do Cliente',
            intro: 'O cliente se compromete a:',
            items: {
              info: 'Fornecer informações precisas sobre o evento',
              access: 'Facilitar o acesso ao local do evento',
              schedule: 'Respeitar os horários acordados',
              safety: 'Fornecer um ambiente seguro para a equipe',
            },
          },
          liability: {
            title: 'Limitação de Responsabilidade',
            content:
              'A Veloz não será responsável por danos indiretos, incidentais ou consequenciais que possam resultar do uso de nossos serviços. Nossa responsabilidade total está limitada ao valor pago pelos serviços.',
          },
        },
      },
      cookies: {
        title: 'Configuração de Cookies',
        description: 'Configuração e gerenciamento de cookies da Veloz.',
        sections: {
          what: {
            title: 'O que são Cookies?',
            content:
              'Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você visita nosso site. Eles nos ajudam a melhorar sua experiência de navegação e a entender como você utiliza nosso site.',
          },
          types: {
            title: 'Tipos de Cookies que Utilizamos',
            intro:
              'Nosso site utiliza principalmente serviços de terceiros que podem estabelecer cookies automaticamente. Não utilizamos cookies próprios para funcionalidades essenciais.',
            none: {
              title: 'Sem Cookies Próprios',
              content:
                'Não estabelecemos cookies próprios no seu dispositivo. Todas nossas funcionalidades utilizam localStorage e sessionStorage do navegador, que não são cookies.',
            },
          },
          thirdparty: {
            title: 'Cookies de Terceiros',
            intro:
              'Utilizamos serviços de terceiros que podem estabelecer cookies automaticamente:',
            items: {
              analytics:
                'Firebase Analytics - Para analisar o tráfego do site e entender como os visitantes utilizam nosso site',
              fonts:
                'Google Fonts - Para carregar fontes tipográficas que melhoram a aparência do site',
            },
            note: 'Estes serviços estabelecem cookies automaticamente e não podemos controlar diretamente quais cookies estabelecem.',
          },
          storage: {
            title: 'Armazenamento Local',
            intro:
              'Em vez de cookies, utilizamos o armazenamento local do navegador:',
            items: {
              localStorage:
                'localStorage - Para salvar preferências do usuário (idioma, consentimento GDPR)',
              sessionStorage:
                'sessionStorage - Para dados temporários da sessão atual',
            },
            note: 'Estes dados são armazenados no seu navegador e não são enviados automaticamente aos nossos servidores.',
          },
          management: {
            title: 'Gerenciamento de Cookies',
            intro:
              'Você pode controlar as cookies de terceiros de várias maneiras:',
            browser: {
              title: 'Configurações do Navegador',
              content:
                'A maioria dos navegadores permite que você veja quais cookies você tem e os exclua individualmente ou os bloqueie de sites específicos ou de todos os sites.',
            },
            preferences: {
              title: 'Configurações de Preferências',
              content:
                'Você pode configurar seu navegador para rejeitar todas as cookies ou para indicar quando um cookie está sendo enviado.',
            },
            storage: {
              title: 'Limpar Armazenamento Local',
              content:
                'Para remover nossos dados armazenados localmente, você pode limpar o armazenamento do navegador nas configurações de privacidade.',
            },
          },
          impact: {
            title: 'Impacto de Desabilitar Cookies',
            content:
              'Se você desabilitar as cookies de terceiros, algumas funcionalidades como as fontes tipográficas podem não carregar corretamente. O site continuará funcionando, mas a experiência visual pode ser afetada.',
          },
          updates: {
            title: 'Atualizações desta Política',
            content:
              'Podemos atualizar esta política de cookies ocasionalmente. Recomendamos revisar esta página periodicamente para se manter informado sobre como utilizamos cookies.',
          },
        },
      },
      contact: {
        title: 'Contato',
        intro:
          'Se você tem perguntas sobre esta política, entre em contato conosco em:',
      },
      lastUpdated: 'Última atualização: Janeiro 2025',
    },
    validation: {
      required: 'Este campo é obrigatório',
      email: 'Por favor insira um email válido para podermos responder',
      minLength: 'Deve ter pelo menos {{count}} caracteres',
    },
  },
};

/**
 * Fetch homepage content from Firestore
 */
async function fetchHomepageContent(db) {
  try {
    console.log('🏠 Fetching homepage content...');
    const docRef = doc(db, 'homepage', 'content');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Homepage content found');
      // Ensure all required properties exist
      return {
        headline: data.headline || {
          es: 'Capturamos lo irrepetible',
          en: 'Capturing the Unrepeatable',
          pt: 'Capturamos o que não se repete',
        },
        logo: data.logo || { url: '', enabled: false },
        backgroundVideo: data.backgroundVideo || { url: '', enabled: false },
      };
    } else {
      console.log('ℹ️ No homepage content found, using defaults');
      return {
        headline: {
          es: 'Capturamos lo irrepetible',
          en: 'Capturing the Unrepeatable',
          pt: 'Capturamos o que não se repete',
        },
        logo: { url: '', enabled: false },
        backgroundVideo: { url: '', enabled: false },
      };
    }
  } catch (error) {
    console.warn('⚠️ Error fetching homepage content:', error.message);
    return {
      headline: {
        es: 'Capturamos lo irrepetible',
        en: 'Capturing the Unrepeatable',
        pt: 'Capturamos o que não se repete',
      },
      logo: { url: '', enabled: false },
      backgroundVideo: { url: '', enabled: false },
    };
  }
}

/**
 * Fetch FAQs from Firestore
 */
async function fetchFAQs(db) {
  try {
    console.log('❓ Fetching FAQs...');
    const faqsQuery = query(collection(db, 'faqs'), orderBy('order', 'asc'));
    const snapshot = await getDocs(faqsQuery);
    const faqs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published === true) {
        faqs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt
            ? data.createdAt.toDate().toISOString()
            : null,
          updatedAt: data.updatedAt
            ? data.updatedAt.toDate().toISOString()
            : null,
        });
      }
    });

    console.log(`✅ Found ${faqs.length} published FAQs`);
    return faqs;
  } catch (error) {
    console.warn('⚠️ Error fetching FAQs:', error.message);
    return [];
  }
}

/**
 * Fetch about content from Firestore
 */
async function fetchAboutContent(db) {
  try {
    console.log('📖 Fetching about content...');
    const aboutQuery = query(collection(db, 'aboutContent'));
    const snapshot = await getDocs(aboutQuery);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      console.log('✅ About content found');
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt
          ? data.updatedAt.toDate().toISOString()
          : null,
      };
    } else {
      console.log('ℹ️ No about content found, using defaults');
      return null;
    }
  } catch {
    console.warn('⚠️ Error fetching about content');
    return null;
  }
}

/**
 * Fetch projects/gallery content from Firestore
 */
// Slug generation utility function
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

function generateUniqueSlug(title, existingSlugs = [], projectId) {
  // Generate base slug from title
  let baseSlug = createSlug(title);

  // If title is empty or generates invalid slug, use fallback
  if (!baseSlug) {
    baseSlug = projectId || 'project';
  }

  // Limit to 60 characters
  baseSlug = baseSlug.substring(0, 60);

  // Remove trailing hyphens
  baseSlug = baseSlug.replace(/-+$/, '');

  // If slug is empty after processing, use fallback
  if (!baseSlug) {
    baseSlug = projectId || 'project';
  }

  // Check if slug is unique
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    const suffix = `-${counter}`;
    // Ensure total length doesn't exceed 60 characters
    const availableLength = 60 - suffix.length;
    const truncatedBase = baseSlug.substring(0, availableLength);
    uniqueSlug = `${truncatedBase}${suffix}`;
    counter++;
  }

  return uniqueSlug;
}

async function fetchProjects(db) {
  try {
    console.log('🖼️ Fetching projects...');
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(projectsQuery);
    const projects = [];
    const existingSlugs = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.status === 'published') {
        const project = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt
            ? data.createdAt.toDate().toISOString()
            : null,
          updatedAt: data.updatedAt
            ? data.updatedAt.toDate().toISOString()
            : null,
        };

        // Ensure slug exists (should be generated by admin interface)
        if (!project.slug) {
          const spanishTitle = data.title?.es || data.title || 'Project';
          project.slug = generateUniqueSlug(
            spanishTitle,
            existingSlugs,
            doc.id
          );
          console.log(
            `🔗 Generated temporary slug for project ${doc.id}: ${project.slug}`
          );
        }

        existingSlugs.push(project.slug);

        // Fetch media for this project
        project.media = await fetchProjectMedia(db, doc.id);

        // Enhanced project data for gallery system
        project.timeline = data.timeline || [];
        project.crewMemberIds = data.crewMemberIds || [];
        project.socialFeed = data.socialFeed || [];

        projects.push(project);
      }
    }

    console.log(`✅ Found ${projects.length} published projects`);
    return projects;
  } catch (error) {
    console.warn('⚠️ Error fetching projects:', error.message);
    return [];
  }
}

/**
 * Fetch media for a specific project
 */
async function fetchProjectMedia(db, projectId) {
  try {
    console.log(`📸 Fetching media for project ${projectId}...`);

    // Query the projectMedia collection with where clause
    let mediaQuery;
    let snapshot;

    try {
      mediaQuery = query(
        collection(db, 'projectMedia'),
        where('projectId', '==', projectId),
        orderBy('order', 'asc')
      );
      snapshot = await getDocs(mediaQuery);
    } catch {
      // If index doesn't exist, query without orderBy
      console.log(
        `⚠️ Index not found for projectMedia orderBy, querying without order...`
      );
      mediaQuery = query(
        collection(db, 'projectMedia'),
        where('projectId', '==', projectId)
      );
      snapshot = await getDocs(mediaQuery);
    }

    const media = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      media.push({
        id: doc.id,
        projectId: projectId,
        type: data.type,
        url: data.url,
        description: data.description || {},
        tags: data.tags || [],
        aspectRatio: data.aspectRatio,
        width: data.width,
        height: data.height,
        order: data.order || 0,
        featured: data.featured || false,
        // Enhanced for gallery optimization
        blurDataURL: data.blurDataURL || undefined,
        placeholder: data.placeholder || undefined,
      });
    });

    // Sort by order in memory
    media.sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log(
      `✅ Found ${media.length} media items for project ${projectId}`
    );
    return media;
  } catch (error) {
    console.warn(
      `⚠️ Error fetching media for project ${projectId}:`,
      error.message
    );
    return [];
  }
}

/**
 * Fetch all crew members for static generation
 */
async function fetchCrewMembers(db) {
  try {
    console.log('👥 Fetching crew members...');
    const crewRef = collection(db, 'crewMembers');
    const crewQuery = query(crewRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(crewQuery);

    const crewMembers = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      crewMembers.push({
        id: doc.id,
        name: data.name || {},
        role: data.role || {},
        portrait: data.portrait || '',
        bio: data.bio || {},
        socialLinks: data.socialLinks || {},
        skills: data.skills || [],
        order: data.order || 0,
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt
          ? data.updatedAt.toDate().toISOString()
          : null,
      });
    });

    console.log(`✅ Found ${crewMembers.length} crew members`);
    return crewMembers;
  } catch (error) {
    console.warn('⚠️ Error fetching crew members:', error.message);
    return [];
  }
}

/**
 * Validate and fix media blocks to ensure they don't exceed grid bounds
 */
function validateMediaBlocks(mediaBlocks) {
  if (!mediaBlocks || !Array.isArray(mediaBlocks)) {
    return [];
  }

  const GRID_WIDTH = 16;
  const GRID_HEIGHT = 9;

  return mediaBlocks.map(block => {
    // Remove old fontSize property if it exists
    const { fontSize, ...cleanBlock } = block;

    // Constrain width and height to grid bounds
    const constrainedWidth = Math.min(cleanBlock.width || 1, GRID_WIDTH);
    const constrainedHeight = Math.min(cleanBlock.height || 1, GRID_HEIGHT);

    // Constrain position to ensure block stays within grid
    const maxX = GRID_WIDTH - constrainedWidth;
    const maxY = GRID_HEIGHT - constrainedHeight;

    return {
      ...cleanBlock,
      x: Math.max(0, Math.min(cleanBlock.x || 0, maxX)),
      y: Math.max(0, Math.min(cleanBlock.y || 0, maxY)),
      width: constrainedWidth,
      height: constrainedHeight,
    };
  });
}

/**
 * Generate content for a specific locale
 */
function generateLocaleContent(
  locale,
  homepageContent,
  faqs,
  projects,
  aboutContent,
  crewMembers,
  galleryLayouts = null
) {
  // Generate categories from project event types
  const categories = generateCategories(projects, locale);

  return {
    locale,
    translations: STATIC_TRANSLATIONS[locale],
    content: {
      homepage: {
        headline:
          homepageContent.headline?.[locale] ||
          homepageContent.headline?.es ||
          STATIC_TRANSLATIONS[locale].homepage.hero.headline,
        logo: homepageContent.logo,
        backgroundVideo: homepageContent.backgroundVideo,
      },
      about: aboutContent
        ? {
            title:
              aboutContent.heroTitle?.[locale] ||
              aboutContent.heroTitle?.es ||
              STATIC_TRANSLATIONS[locale].about.title,
            subtitle:
              aboutContent.heroSubtitle?.[locale] ||
              aboutContent.heroSubtitle?.es ||
              STATIC_TRANSLATIONS[locale].about.subtitle,
            philosophy: {
              title:
                aboutContent.philosophyTitle?.[locale] ||
                aboutContent.philosophyTitle?.es ||
                STATIC_TRANSLATIONS[locale].about.philosophy.title,
              description:
                aboutContent.philosophyContent?.[locale] ||
                aboutContent.philosophyContent?.es ||
                STATIC_TRANSLATIONS[locale].about.philosophy.description,
            },
            methodology: {
              title:
                aboutContent.methodologyTitle?.[locale] ||
                aboutContent.methodologyTitle?.es ||
                STATIC_TRANSLATIONS[locale].about.methodology.title,
              // Use methodology steps from admin panel if available
              steps:
                Array.isArray(aboutContent.methodologySteps) &&
                aboutContent.methodologySteps.length > 0
                  ? aboutContent.methodologySteps
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((step, index) => ({
                        step: String(index + 1).padStart(2, '0'),
                        title: step.title?.[locale] || step.title?.es || '',
                        description:
                          step.description?.[locale] ||
                          step.description?.es ||
                          '',
                      }))
                  : [
                      // Fallback to static translations if no admin content
                      {
                        step: '01',
                        title:
                          STATIC_TRANSLATIONS[locale].about.methodology.planning
                            .title,
                        description:
                          STATIC_TRANSLATIONS[locale].about.methodology.planning
                            .description,
                      },
                      {
                        step: '02',
                        title:
                          STATIC_TRANSLATIONS[locale].about.methodology.coverage
                            .title,
                        description:
                          STATIC_TRANSLATIONS[locale].about.methodology.coverage
                            .description,
                      },
                      {
                        step: '03',
                        title:
                          STATIC_TRANSLATIONS[locale].about.methodology.capture
                            .title,
                        description:
                          STATIC_TRANSLATIONS[locale].about.methodology.capture
                            .description,
                      },
                      {
                        step: '04',
                        title:
                          STATIC_TRANSLATIONS[locale].about.methodology
                            .postproduction.title,
                        description:
                          STATIC_TRANSLATIONS[locale].about.methodology
                            .postproduction.description,
                      },
                    ],
            },
            values: {
              title:
                aboutContent.valuesTitle?.[locale] ||
                aboutContent.valuesTitle?.es ||
                STATIC_TRANSLATIONS[locale].about.values.title,
              passion: {
                title:
                  aboutContent.values?.[0]?.title?.[locale] ||
                  aboutContent.values?.[0]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.passion.title,
                description:
                  aboutContent.values?.[0]?.description?.[locale] ||
                  aboutContent.values?.[0]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.passion.description,
              },
              teamwork: {
                title:
                  aboutContent.values?.[1]?.title?.[locale] ||
                  aboutContent.values?.[1]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.teamwork.title,
                description:
                  aboutContent.values?.[1]?.description?.[locale] ||
                  aboutContent.values?.[1]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.teamwork.description,
              },
              quality: {
                title:
                  aboutContent.values?.[2]?.title?.[locale] ||
                  aboutContent.values?.[2]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.quality.title,
                description:
                  aboutContent.values?.[2]?.description?.[locale] ||
                  aboutContent.values?.[2]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.quality.description,
              },
              agility: {
                title:
                  aboutContent.values?.[3]?.title?.[locale] ||
                  aboutContent.values?.[3]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.agility.title,
                description:
                  aboutContent.values?.[3]?.description?.[locale] ||
                  aboutContent.values?.[3]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.agility.description,
              },
              excellence: {
                title:
                  aboutContent.values?.[4]?.title?.[locale] ||
                  aboutContent.values?.[4]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.excellence.title,
                description:
                  aboutContent.values?.[4]?.description?.[locale] ||
                  aboutContent.values?.[4]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.excellence
                    .description,
              },
              trust: {
                title:
                  aboutContent.values?.[5]?.title?.[locale] ||
                  aboutContent.values?.[5]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.trust.title,
                description:
                  aboutContent.values?.[5]?.description?.[locale] ||
                  aboutContent.values?.[5]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.trust.description,
              },
            },
            faq: {
              title:
                aboutContent.faq?.title?.[locale] ||
                aboutContent.faq?.title?.es ||
                STATIC_TRANSLATIONS[locale].about.faq.title,
            },
          }
        : STATIC_TRANSLATIONS[locale].about,
      faqs: faqs
        .map(faq => ({
          id: faq.id,
          question: faq.question?.[locale] || faq.question?.es || '',
          answer: faq.answer?.[locale] || faq.answer?.es || '',
          category: faq.category,
          order: faq.order,
        }))
        .filter(faq => faq.question && faq.answer),
      categories: categories, // Add categories to the content
      projects: projects.map(project => {
        // Transform project data for static content
        const transformedProject = {
          id: project.id,
          slug: project.slug, // Include slug field
          title:
            project.title?.[locale] ||
            project.title?.es ||
            project.title?.en ||
            'Sin título',
          description:
            project.description?.[locale] ||
            project.description?.es ||
            project.description?.en ||
            '',
          tags: project.tags || [],
          eventType: project.eventType || '',
          location: project.location || '',
          eventDate: project.eventDate || '',
          featured: project.featured || false,
          status: project.status || 'published',
          mediaBlocks: validateMediaBlocks(project.mediaBlocks || []),
          detailPageBlocks: validateMediaBlocks(project.detailPageBlocks || []),
          detailPageGridHeight: project.detailPageGridHeight || 9,
          media: project.media || [],
          // Enhanced gallery data
          timeline: project.timeline || [],
          crewMemberIds: project.crewMemberIds || [],
          socialFeed: project.socialFeed || [],
        };
        return transformedProject;
      }),
      crewMembers: crewMembers.map(crew => ({
        id: crew.id,
        name: crew.name?.[locale] || crew.name?.es || '',
        role: crew.role?.[locale] || crew.role?.es || '',
        portrait: crew.portrait || '',
        bio: crew.bio?.[locale] || crew.bio?.es || '',
        socialLinks: crew.socialLinks || {},
        skills: crew.skills || [],
        order: crew.order || 0,
      })),
    },
    // Include pre-calculated gallery layouts
    galleryLayouts: galleryLayouts || null,
    lastUpdated: new Date().toISOString(),
    buildTime: true,
  };
}

/**
 * Generate categories from project event types
 */
function generateCategories(projects, locale = 'es') {
  // Get all unique event types from projects that have featured media
  const eventTypesWithFeaturedMedia = new Set();

  projects.forEach(project => {
    if (project.eventType && project.media && project.media.length > 0) {
      // Check if this project has any featured media
      const hasFeaturedMedia = project.media.some(media => media.featured);
      if (hasFeaturedMedia) {
        eventTypesWithFeaturedMedia.add(project.eventType);
      }
    }
  });

  // Create categories from event types that have featured media
  const categories = Array.from(eventTypesWithFeaturedMedia).map(eventType => {
    // Special handling for "Culturales y artísticos" -> "Culturales"
    let categoryId, displayName;

    if (eventType === 'Culturales y artísticos') {
      categoryId = 'culturales';
      displayName = 'Culturales';
    } else {
      categoryId = eventType
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      displayName = eventType;
    }

    return {
      id: categoryId,
      name: displayName,
      label: displayName,
      title: displayName,
      description: `Proyectos de ${displayName.toLowerCase()}`,
      eventTypes: [eventType], // Each category only includes its own event type
    };
  });

  // Always include overview category if there are any projects with featured media
  if (categories.length > 0) {
    const overviewText = locale === 'en' ? 'Events' : 'Eventos';
    const overviewDescription =
      locale === 'en'
        ? 'A selection of our best work.'
        : locale === 'pt'
          ? 'Uma seleção dos nossos melhores trabalhos.'
          : 'Una selección de nuestros mejores trabajos.';

    categories.unshift({
      id: 'overview',
      name: overviewText,
      label: overviewText,
      title: overviewText,
      description: overviewDescription,
      eventTypes: ['*'], // Matches all event types
    });
  }

  return categories;
}

/**
 * Main build function
 */
async function buildStaticContent() {
  try {
    console.log(
      '🚀 Starting static content generation for localized routes...'
    );

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Fetch all content from Firestore
    const [homepageContent, faqs, projects, aboutContent, crewMembers] =
      await Promise.all([
        fetchHomepageContent(db),
        fetchFAQs(db),
        fetchProjects(db),
        fetchAboutContent(db),
        fetchCrewMembers(db),
      ]);

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Generate gallery layouts for all projects and categories
    console.log('🎨 Generating gallery layouts...');
    const sampleCategories = generateCategories(projects, 'es'); // Use Spanish for layout generation
    const galleryLayouts = generateAllGalleryLayouts(
      projects,
      sampleCategories
    );

    // Generate content for each locale
    const allContent = {};
    for (const locale of LOCALES) {
      console.log(`🌍 Generating content for locale: ${locale}`);
      const localeContent = generateLocaleContent(
        locale,
        homepageContent,
        faqs,
        projects,
        aboutContent,
        crewMembers,
        galleryLayouts // Pass gallery layouts to locale content generation
      );
      allContent[locale] = localeContent;

      // Write locale-specific file
      const localeFilePath = path.join(dataDir, `content-${locale}.json`);
      fs.writeFileSync(localeFilePath, JSON.stringify(localeContent, null, 2));
      console.log(
        `📄 ${locale.toUpperCase()} content written to ${localeFilePath}`
      );
    }

    // Write combined content file
    const allContentPath = path.join(dataDir, 'content-all.json');
    fs.writeFileSync(allContentPath, JSON.stringify(allContent, null, 2));
    console.log(`📄 Combined content written to ${allContentPath}`);

    // Generate TypeScript definitions
    const tsContent = `// Auto-generated at build time for static localized routes - do not edit manually
// Generated on: ${new Date().toISOString()}

export type Locale = 'es' | 'en' | 'pt';

export interface LocalizedContent {
  locale: Locale;
  translations: Record<string, unknown>;
  content: {
    homepage: {
      headline: string;
      logo: Record<string, unknown>;
      backgroundVideo: Record<string, unknown>;
    };
    about: {
      title: string;
      subtitle: string;
      philosophy: {
        title: string;
        description: string;
      };
      methodology: {
        title: string;
        steps: Array<{
          step: string;
          title: string;
          description: string;
        }>;
      };
      values: {
        title: string;
        passion: {
          title: string;
          description: string;
        };
        teamwork: {
          title: string;
          description: string;
        };
        quality: {
          title: string;
          description: string;
        };
        agility: {
          title: string;
          description: string;
        };
        excellence: {
          title: string;
          description: string;
        };
        trust: {
          title: string;
          description: string;
        };
      };
      faq: {
        title: string;
      };
    };
    faqs: Array<{
      id: string;
      question: string;
      answer: string;
      category?: string;
      order: number;
    }>;
    categories: Array<{
      id: string;
      name: string;
      label: string;
      title: string;
      description: string;
      eventTypes: string[];
    }>;
    projects: Array<{
      id: string;
      slug?: string;
      title: string;
      description: string;
      tags: string[];
      eventType?: string;
      location?: string;
      eventDate: string;
      featured: boolean;
      status?: string;
      mediaBlocks?: Array<{
        id: string;
        mediaId?: string;
        x: number;
        y: number;
        width: number;
        height: number;
        type: 'image' | 'video' | 'title';
        zIndex: number;
        mediaOffsetX?: number;
        mediaOffsetY?: number;
        // Title-specific properties
        title?: string;
        font?: string;
        color?: string;
      }>;
      detailPageBlocks?: Array<{
        id: string;
        mediaId?: string;
        x: number;
        y: number;
        width: number;
        height: number;
        type: 'image' | 'video' | 'title';
        zIndex: number;
        mediaOffsetX?: number;
        mediaOffsetY?: number;
        // Title-specific properties
        title?: string;
        font?: string;
        color?: string;
      }>;
      detailPageGridHeight?: number;
              media: Array<{
          id: string;
          projectId: string;
          type: 'photo' | 'video';
          url: string;
          description?: Record<string, string>;
          tags?: string[];
          aspectRatio?: '1:1' | '16:9' | '9:16';
          width?: number;
          height?: number;
          order: number;
          featured?: boolean;
          blurDataURL?: string;
          placeholder?: string;
        }>;
        timeline?: Array<{
          id: string;
          title: string;
          description: string;
          date: string;
          status: 'completed' | 'in_progress' | 'planned';
        }>;
        crewMemberIds?: string[];
        socialFeed?: Array<{
          id: string;
          type: 'image' | 'video';
          url: string;
          caption: string;
          order: number;
        }>;
      }>;
    crewMembers: Array<{
      id: string;
      name: string;
      role: string;
      portrait: string;
      bio: string;
      socialLinks?: {
        instagram?: string;
        linkedin?: string;
        website?: string;
        email?: string;
      };
      skills: string[];
      order: number;
    }>;
  };
  galleryLayouts?: {
    categories: Record<string, {
      mobile: GalleryLayout;
      tablet: GalleryLayout;
      desktop: GalleryLayout;
      large: GalleryLayout;
      metadata: {
        imageCount: number;
        projectCount: number;
      };
    }>;
    projects: Record<string, {
      mobile: GalleryLayout;
      tablet: GalleryLayout;
      desktop: GalleryLayout;
      large: GalleryLayout;
      metadata: {
        imageCount: number;
        featuredCount: number;
      };
    }>;
    metadata: {
      generatedAt: string;
      totalLayouts: number;
    };
  } | null;
  lastUpdated: string;
  buildTime: boolean;
}

interface GalleryLayout {
  rows: Array<{
    id: string;
    tiles: Array<{
      image: {
        id: string;
        url: string;
        src: string;
        alt: string;
        width: number;
        height: number;
        type: string;
        aspectRatio?: string;
        projectId: string;
        projectTitle: string;
        featured: boolean;
      };
      width: number;
      height: number;
      x: number;
      y: number;
      aspectRatio: number;
      cssStyles: {
        width: string;
        height: string;
        aspectRatio: string;
      };
    }>;
    actualHeight: number;
    targetHeight: number;
    totalWidth: number;
    aspectRatioSum: number;
  }>;
  tiles: Array<{
    id: string;
    row: number;
    animationDelay: number;
    image: any;
    width: number;
    height: number;
    x: number;
    y: number;
    aspectRatio: number;
    cssStyles: any;
  }>;
  totalHeight: number;
  containerWidth: number;
  metadata: {
    imageCount: number;
    rowCount: number;
    averageAspectRatio: number;
  };
}

export const STATIC_CONTENT: Record<Locale, LocalizedContent> = ${JSON.stringify(allContent, null, 2)};

export const SUPPORTED_LOCALES: Locale[] = ${JSON.stringify(LOCALES)};

export function getContentForLocale(locale: Locale): LocalizedContent {
  return STATIC_CONTENT[locale] || STATIC_CONTENT.es;
}
`;

    const tsFilePath = path.join(
      process.cwd(),
      'src',
      'lib',
      'static-content.generated.ts'
    );
    fs.writeFileSync(tsFilePath, tsContent);
    console.log(`📄 TypeScript definitions written to ${tsFilePath}`);

    // Clean FAQ data to only include supported locales (es, en, pt)
    const cleanedFaqs = faqs.map(faq => ({
      ...faq,
      question: {
        es: faq.question?.es || '',
        en: faq.question?.en || '',
        pt: faq.question?.pt || '',
      },
      answer: {
        es: faq.answer?.es || '',
        en: faq.answer?.en || '',
        pt: faq.answer?.pt || '',
      },
      // Convert date strings to Date objects for TypeScript compatibility
      createdAt: faq.createdAt ? new Date(faq.createdAt) : new Date(),
      updatedAt: faq.updatedAt ? new Date(faq.updatedAt) : new Date(),
    }));

    // Generate build-time data for FAQs
    const buildTimeDataContent = `// Auto-generated at build time - do not edit manually
// Generated on: ${new Date().toISOString()}

// Build-time data types (with string dates for JSON compatibility)
interface BuildTimeFAQ {
  id: string;
  question: {
    es?: string;
    en?: string;
    pt?: string;
  };
  answer: {
    es?: string;
    en?: string;
    pt?: string;
  };
  order: number;
  category?: string;
  published?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BUILD_TIME_FAQS: BuildTimeFAQ[] = ${JSON.stringify(cleanedFaqs, null, 2)};

export const BUILD_TIME_PROJECTS = ${JSON.stringify(projects, null, 2)};

export const BUILD_TIME_ABOUT_CONTENT = ${JSON.stringify(aboutContent, null, 2)};

export const BUILD_TIME_CREW_MEMBERS = ${JSON.stringify(crewMembers, null, 2)};
`;

    const buildTimeDataPath = path.join(
      process.cwd(),
      'src',
      'lib',
      'build-time-data.generated.ts'
    );
    fs.writeFileSync(buildTimeDataPath, buildTimeDataContent);
    console.log(`📄 Build-time data written to ${buildTimeDataPath}`);

    console.log('✅ Static content generation completed successfully!');
    console.log(`📊 Generated content for ${LOCALES.length} locales`);
    console.log(`📝 ${faqs.length} FAQs, ${projects.length} projects`);

    return allContent;
  } catch (error) {
    console.error('❌ Error generating static content:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  buildStaticContent()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { buildStaticContent };
