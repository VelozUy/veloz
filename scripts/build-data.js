#!/usr/bin/env node

/* eslint-disable */

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
      contact: 'Contacto',
    },
    homepage: {
      hero: {
        headline: 'Capturamos lo irrepetible',
        cta: {
          about: 'Sobre Nosotros',
          work: 'Nuestro Trabajo',
          contact: 'Trabaja con Nosotros',
        },
      },
    },
    contact: {
      title: 'Cuéntanos sobre tu evento',
      subtitle:
        'Mientras más sepamos, mejor podremos hacer que tu día sea perfecto',
      form: {
        name: {
          label: 'Tu nombre',
          placeholder: '¿Cómo deberíamos llamarte?',
        },
        email: {
          label: 'Correo electrónico',
          placeholder: 'tu.email@ejemplo.com',
        },
        phone: {
          label: 'Teléfono',
          placeholder: 'Tu número de teléfono',
          optional: '(opcional)',
        },
        communicationPreference: {
          label: 'Forma de contacto preferida',
          call: 'Llamada',
          whatsapp: 'WhatsApp',
          email: 'Email',
          zoom: 'Videollamada',
        },
        eventType: {
          label: '¿Qué estás celebrando?',
          placeholder: 'Elige tu tipo de evento',
          options: {
            wedding: 'Boda',
            quinceanera: 'Fiesta de 15 Años',
            birthday: 'Fiesta de Cumpleaños',
            corporate: 'Evento Corporativo',
            other: 'Otro (¡cuéntanos en el mensaje!)',
          },
        },
        eventDate: {
          label: 'Fecha aproximada',
          optional: '(opcional)',
          help: '¡No te preocupes si aún no estás seguro, podemos trabajar con fechas flexibles!',
        },
        message: {
          label: 'Cuéntanos sobre tu visión',
          optional: '(opcional)',
          placeholder:
            'Comparte tus ideas, lugar, número de invitados, momentos especiales que quieres capturar, o cualquier otra cosa que nos ayude a entender mejor tu evento...',
        },
        attachments: {
          label: 'Materiales de referencia',
          optional: '(opcional)',
          description:
            'Sube imágenes, documentos o archivos que nos ayuden a entender mejor tu visión',
        },
        submit: {
          button: 'Empezar la conversación',
          loading: 'Enviando tu mensaje...',
        },
        privacy: {
          line1:
            'No compartimos tu información. Solo te contactaremos para ayudarte con tu evento.',
          line2:
            'Sin spam, sin presión: solo excelente fotografía y videografía cuando estés listo.',
        },
      },
      success: {
        title: '¡Mensaje enviado!',
        message:
          '¡Gracias por contactarnos! Te responderemos dentro de 24 horas con todos los detalles para hacer que tu evento sea increíble.',
        action: 'Enviar otro mensaje',
      },
      trust: {
        response: {
          title: 'Respuesta Rápida',
          description:
            'Típicamente respondemos dentro de 24 horas con una cotización personalizada',
        },
        commitment: {
          title: 'Sin Compromiso',
          description:
            'Obtener una cotización es completamente gratis y sin ataduras',
        },
        privacy: {
          title: 'Privacidad Primero',
          description:
            'Nunca compartimos tu información y solo te contactamos sobre tu evento',
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
        wedding: 'Boda',
        corporate: 'Evento Empresarial',
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
          noDate: 'Aún no tengo fecha definida',
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
      contact: 'Contact',
    },
    homepage: {
      hero: {
        headline: 'Capturing the Unrepeatable',
        cta: {
          about: 'About Us',
          work: 'Our Work',
          contact: 'Work with Us',
        },
      },
    },
    contact: {
      title: 'Tell us about your event',
      subtitle:
        'The more we know, the better we can help make your day perfect',
      form: {
        name: {
          label: 'Your name',
          placeholder: 'What should we call you?',
        },
        email: {
          label: 'Email address',
          placeholder: 'your.email@example.com',
        },
        phone: {
          label: 'Phone',
          placeholder: 'Your phone number',
          optional: '(optional)',
        },
        communicationPreference: {
          label: 'Preferred contact method',
          call: 'Call',
          whatsapp: 'WhatsApp',
          email: 'Email',
          zoom: 'Video Call',
        },
        eventType: {
          label: 'What are you celebrating?',
          placeholder: 'Choose your event type',
          options: {
            wedding: 'Wedding',
            quinceanera: '15th Birthday (Quinceañera)',
            birthday: 'Birthday Party',
            corporate: 'Corporate Event',
            other: 'Other (tell us in the message!)',
          },
        },
        eventDate: {
          label: 'Approximate date',
          optional: '(optional)',
          help: "Don't worry if you're not sure yet – we can work with flexible dates!",
        },
        message: {
          label: 'Tell us about your vision',
          optional: '(optional)',
          placeholder:
            'Share your ideas, venue, number of guests, special moments you want captured, or anything else that would help us understand your event better...',
        },
        attachments: {
          label: 'Reference Materials',
          optional: '(optional)',
          description:
            'Upload images, documents, or files that help us understand your vision better',
        },
        submit: {
          button: 'Start the conversation',
          loading: 'Sending your message...',
        },
        privacy: {
          line1:
            "We don't share your info. We'll only reach out to help with your event.",
          line2:
            "No spam, no pressure – just great photography and videography when you're ready.",
        },
      },
      success: {
        title: 'Message sent!',
        message:
          "Thanks for reaching out! We'll get back to you within 24 hours with all the details about making your event amazing.",
        action: 'Send another message',
      },
      trust: {
        response: {
          title: 'Quick Response',
          description:
            'We typically respond within 24 hours with a personalized quote',
        },
        commitment: {
          title: 'No Commitment',
          description:
            'Getting a quote is completely free with no strings attached',
        },
        privacy: {
          title: 'Privacy First',
          description:
            'We never share your information and only contact you about your event',
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
        wedding: 'Wedding',
        corporate: 'Corporate Event',
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
          noDate: "I don't have a date set yet",
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
      contact: 'Contato',
    },
    homepage: {
      hero: {
        headline: 'Capturamos o que não se repete',
        cta: {
          about: 'Sobre Nós',
          work: 'Nosso Trabalho',
          contact: 'Trabalhe Conosco',
        },
      },
    },
    contact: {
      title: 'Conte-nos sobre seu evento',
      subtitle:
        'Quanto mais soubermos, melhor poderemos tornar seu dia perfeito',
      form: {
        name: {
          label: 'Seu nome',
          placeholder: 'Como devemos chamá-lo?',
        },
        email: {
          label: 'Endereço de email',
          placeholder: 'seu.email@exemplo.com',
        },
        phone: {
          label: 'Telefone',
          placeholder: 'Seu número de telefone',
          optional: '(opcional)',
        },
        communicationPreference: {
          label: 'Método de contato preferido',
          call: 'Ligação',
          whatsapp: 'WhatsApp',
          email: 'Email',
          zoom: 'Videoconferência',
        },
        eventType: {
          label: 'O que você está comemorando?',
          placeholder: 'Escolha seu tipo de evento',
          options: {
            wedding: 'Casamento',
            quinceanera: 'Festa de 15 Anos',
            birthday: 'Festa de Aniversário',
            corporate: 'Evento Corporativo',
            other: 'Outro (conte-nos na mensagem!)',
          },
        },
        eventDate: {
          label: 'Data aproximada',
          optional: '(opcional)',
          help: 'Não se preocupe se ainda não tem certeza – podemos trabalhar com datas flexíveis!',
        },
        message: {
          label: 'Conte-nos sobre sua visão',
          optional: '(opcional)',
          placeholder:
            'Compartilhe suas ideias, local, número de convidados, momentos especiais que quer capturar, ou qualquer outra coisa que nos ajude a entender melhor seu evento...',
        },
        attachments: {
          label: 'Materiais de Referência',
          optional: '(opcional)',
          description:
            'Faça upload de imagens, documentos ou arquivos que nos ajudem a entender melhor sua visão',
        },
        submit: {
          button: 'Iniciar a conversa',
          loading: 'Enviando sua mensagem...',
        },
        privacy: {
          line1:
            'Não compartilhamos suas informações. Só entraremos em contato para ajudar com seu evento.',
          line2:
            'Sem spam, sem pressão – apenas excelente fotografia e videografia quando você estiver pronto.',
        },
      },
      success: {
        title: 'Mensagem enviada!',
        message:
          'Obrigado por entrar em contato! Retornaremos dentro de 24 horas com todos os detalhes para tornar seu evento incrível.',
        action: 'Enviar outra mensagem',
      },
      trust: {
        response: {
          title: 'Resposta Rápida',
          description:
            'Normalmente respondemos dentro de 24 horas com uma cotação personalizada',
        },
        commitment: {
          title: 'Sem Compromisso',
          description: 'Obter uma cotação é completamente grátis sem amarras',
        },
        privacy: {
          title: 'Privacidade em Primeiro Lugar',
          description:
            'Nunca compartilhamos suas informações e só entramos em contato sobre seu evento',
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
        wedding: 'Casamento',
        corporate: 'Evento Corporativo',
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
          noDate: 'Ainda não tenho data definida',
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
      return data;
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
  crewMembers
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
              aboutContent.title?.[locale] ||
              aboutContent.title?.es ||
              STATIC_TRANSLATIONS[locale].about.title,
            subtitle:
              aboutContent.subtitle?.[locale] ||
              aboutContent.subtitle?.es ||
              STATIC_TRANSLATIONS[locale].about.subtitle,
            philosophy: {
              title:
                aboutContent.philosophy?.title?.[locale] ||
                aboutContent.philosophy?.title?.es ||
                STATIC_TRANSLATIONS[locale].about.philosophy.title,
              description:
                aboutContent.philosophy?.items?.[0]?.description?.[locale] ||
                aboutContent.philosophy?.items?.[0]?.description?.es ||
                STATIC_TRANSLATIONS[locale].about.philosophy.description,
            },
            methodology: {
              title:
                aboutContent.methodology?.title?.[locale] ||
                aboutContent.methodology?.title?.es ||
                STATIC_TRANSLATIONS[locale].about.methodology.title,
              planning: {
                title:
                  aboutContent.methodology?.items?.[0]?.title?.[locale] ||
                  aboutContent.methodology?.items?.[0]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.methodology.planning.title,
                description:
                  aboutContent.methodology?.items?.[0]?.description?.[locale] ||
                  aboutContent.methodology?.items?.[0]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.methodology.planning
                    .description,
              },
              coverage: {
                title:
                  aboutContent.methodology?.items?.[1]?.title?.[locale] ||
                  aboutContent.methodology?.items?.[1]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.methodology.coverage.title,
                description:
                  aboutContent.methodology?.items?.[1]?.description?.[locale] ||
                  aboutContent.methodology?.items?.[1]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.methodology.coverage
                    .description,
              },
              capture: {
                title:
                  aboutContent.methodology?.items?.[2]?.title?.[locale] ||
                  aboutContent.methodology?.items?.[2]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.methodology.capture.title,
                description:
                  aboutContent.methodology?.items?.[2]?.description?.[locale] ||
                  aboutContent.methodology?.items?.[2]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.methodology.capture
                    .description,
              },
              postproduction: {
                title:
                  aboutContent.methodology?.items?.[3]?.title?.[locale] ||
                  aboutContent.methodology?.items?.[3]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.methodology.postproduction
                    .title,
                description:
                  aboutContent.methodology?.items?.[3]?.description?.[locale] ||
                  aboutContent.methodology?.items?.[3]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.methodology.postproduction
                    .description,
              },
            },
            values: {
              title:
                aboutContent.values?.title?.[locale] ||
                aboutContent.values?.title?.es ||
                STATIC_TRANSLATIONS[locale].about.values.title,
              passion: {
                title:
                  aboutContent.values?.items?.[0]?.title?.[locale] ||
                  aboutContent.values?.items?.[0]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.passion.title,
                description:
                  aboutContent.values?.items?.[0]?.description?.[locale] ||
                  aboutContent.values?.items?.[0]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.passion.description,
              },
              teamwork: {
                title:
                  aboutContent.values?.items?.[1]?.title?.[locale] ||
                  aboutContent.values?.items?.[1]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.teamwork.title,
                description:
                  aboutContent.values?.items?.[1]?.description?.[locale] ||
                  aboutContent.values?.items?.[1]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.teamwork.description,
              },
              quality: {
                title:
                  aboutContent.values?.items?.[2]?.title?.[locale] ||
                  aboutContent.values?.items?.[2]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.quality.title,
                description:
                  aboutContent.values?.items?.[2]?.description?.[locale] ||
                  aboutContent.values?.items?.[2]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.quality.description,
              },
              agility: {
                title:
                  aboutContent.values?.items?.[3]?.title?.[locale] ||
                  aboutContent.values?.items?.[3]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.agility.title,
                description:
                  aboutContent.values?.items?.[3]?.description?.[locale] ||
                  aboutContent.values?.items?.[3]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.agility.description,
              },
              excellence: {
                title:
                  aboutContent.values?.items?.[4]?.title?.[locale] ||
                  aboutContent.values?.items?.[4]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.excellence.title,
                description:
                  aboutContent.values?.items?.[4]?.description?.[locale] ||
                  aboutContent.values?.items?.[4]?.description?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.excellence
                    .description,
              },
              trust: {
                title:
                  aboutContent.values?.items?.[5]?.title?.[locale] ||
                  aboutContent.values?.items?.[5]?.title?.es ||
                  STATIC_TRANSLATIONS[locale].about.values.trust.title,
                description:
                  aboutContent.values?.items?.[5]?.description?.[locale] ||
                  aboutContent.values?.items?.[5]?.description?.es ||
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
        crewMembers
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
        planning: {
          title: string;
          description: string;
        };
        coverage: {
          title: string;
          description: string;
        };
        capture: {
          title: string;
          description: string;
        };
        postproduction: {
          title: string;
          description: string;
        };
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
  lastUpdated: string;
  buildTime: boolean;
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
