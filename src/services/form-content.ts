import { BaseFirebaseService } from './base-firebase-service';
import {
  FormContent,
  CreateFormContentData,
  UpdateFormContentData,
  ApiResponse,
} from '@/types';

export class FormContentService extends BaseFirebaseService<FormContent> {
  constructor() {
    super('formContent');
  }

  /**
   * Get form content with fallback to default if not found
   */
  async getFormContent(): Promise<FormContent> {
    try {
      const response: ApiResponse<FormContent[]> = await this.getAll();

      if (response.success && response.data && response.data.length > 0) {
        return response.data[0];
      }

      // Return default form content if none exists
      return this.getDefaultFormContent();
    } catch (error) {
      return this.getDefaultFormContent();
    }
  }

  /**
   * Create or update form content (upsert operation since there should only be one)
   */
  async upsertFormContent(
    data: CreateFormContentData | UpdateFormContentData
  ): Promise<FormContent> {
    try {
      const response: ApiResponse<FormContent[]> = await this.getAll();

      if (response.success && response.data && response.data.length > 0) {
        // Update existing
        const updateResponse = await this.update(
          response.data[0].id,
          data as UpdateFormContentData
        );

        if (updateResponse.success) {
          // Return updated content
          const updatedResponse = await this.getById(response.data[0].id);
          if (
            updatedResponse.success &&
            updatedResponse.data &&
            typeof updatedResponse.data === 'object' &&
            'id' in updatedResponse.data
          ) {
            return updatedResponse.data as FormContent;
          }
        }
        return this.getDefaultFormContent();
      } else {
        // Create new
        const createResponse = await this.create(data as CreateFormContentData);

        if (
          createResponse.success &&
          createResponse.data &&
          typeof createResponse.data === 'object' &&
          'id' in createResponse.data &&
          typeof (createResponse.data as FormContent).id === 'string'
        ) {
          const newId = (createResponse.data as FormContent).id;
          if (typeof newId === 'string') {
            const newResponse = await this.getById(newId);
            if (
              newResponse.success &&
              newResponse.data &&
              typeof newResponse.data === 'object' &&
              'id' in newResponse.data
            ) {
              return newResponse.data as FormContent;
            }
          }
        }
        return this.getDefaultFormContent();
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get default form content structure
   /**
    * Get default form content structure
    */
  private getDefaultFormContent(): FormContent {
    return {
      id: 'default',
      contact: {
        title: {
          es: 'Cuéntanos sobre tu evento',
          en: 'Tell us about your event',
          pt: 'Conte-nos sobre seu evento',
        },
        subtitle: {
          es: 'Mientras más sepamos, mejor podremos hacer que tu día sea perfecto',
          en: 'The more we know, the better we can help make your day perfect',
          pt: 'Quanto mais soubermos, melhor poderemos tornar seu dia perfeito',
        },
        form: {
          name: {
            label: {
              es: 'Tu nombre',
              en: 'Your name',
              pt: 'Seu nome',
            },
            placeholder: {
              es: 'Tu nombre completo',
              en: 'Your full name',
              pt: 'Seu nome completo',
            },
          },
          email: {
            label: {
              es: 'Correo',
              en: 'Email',
              pt: 'Email',
            },
            placeholder: {
              es: 'tu.email@ejemplo.com',
              en: 'your.email@example.com',
              pt: 'seu.email@exemplo.com',
            },
          },
          company: {
            label: {
              es: 'Empresa (si corresponde)',
              en: 'Company (if applicable)',
              pt: 'Empresa (se aplicável)',
            },
            placeholder: {
              es: 'Nombre de tu empresa',
              en: 'Your company name',
              pt: 'Nome da sua empresa',
            },
            optional: {
              es: '(opcional)',
              en: '(optional)',
              pt: '(opcional)',
            },
          },
          phone: {
            label: {
              es: 'Número de celu',
              en: 'Mobile number',
              pt: 'Número de celular',
            },
            placeholder: {
              es: 'Tu número de celular',
              en: 'Your mobile number',
              pt: 'Seu número de celular',
            },
            optional: {
              es: '(opcional)',
              en: '(optional)',
              pt: '(opcional)',
            },
          },
          eventType: {
            label: {
              es: '¿Qué tipo de evento tienes?',
              en: 'What type of event do you have?',
              pt: 'Que tipo de evento você tem?',
            },
            placeholder: {
              es: 'Selecciona el tipo de evento',
              en: 'Select event type',
              pt: 'Selecione o tipo de evento',
            },
            options: {
              corporate: {
                es: 'Evento corporativo',
                en: 'Corporate event',
                pt: 'Evento corporativo',
              },
              product: {
                es: 'Presentación de producto',
                en: 'Product presentation',
                pt: 'Apresentação de produto',
              },
              birthday: {
                es: 'Cumpleaños',
                en: 'Birthday',
                pt: 'Aniversário',
              },
              wedding: {
                es: 'Casamiento',
                en: 'Wedding',
                pt: 'Casamento',
              },
              quinceanera: {
                es: 'Quinceañera',
                en: 'Quinceañera',
                pt: 'Quinceañera',
              },
              concert: {
                es: 'Concierto',
                en: 'Concert',
                pt: 'Show',
              },
              exhibition: {
                es: 'Exposiciones',
                en: 'Exhibitions',
                pt: 'Exposições',
              },
              other: {
                es: 'Otros',
                en: 'Others',
                pt: 'Outros',
              },
            },
          },
          location: {
            label: {
              es: 'Lugar del evento (ciudad)',
              en: 'Event location (city)',
              pt: 'Local do evento (cidade)',
            },
            placeholder: {
              es: 'Ciudad donde será el evento',
              en: 'City where the event will be held',
              pt: 'Cidade onde o evento será realizado',
            },
          },
          attendees: {
            label: {
              es: 'Cantidad de asistentes esperados',
              en: 'Expected number of attendees',
              pt: 'Número esperado de participantes',
            },
            placeholder: {
              es: 'Número aproximado de invitados',
              en: 'Approximate number of guests',
              pt: 'Número aproximado de convidados',
            },
          },
          services: {
            label: {
              es: '¿Qué servicios te interesan?',
              en: 'What services are you interested in?',
              pt: 'Que serviços você está interessado?',
            },
            placeholder: {
              es: 'Selecciona los servicios',
              en: 'Select services',
              pt: 'Selecione os serviços',
            },
            options: {
              photography: {
                es: 'Fotografía',
                en: 'Photography',
                pt: 'Fotografia',
              },
              video: {
                es: 'Video',
                en: 'Video',
                pt: 'Vídeo',
              },
              drone: {
                es: 'Drone',
                en: 'Drone',
                pt: 'Drone',
              },
              studio: {
                es: 'Sesión de fotos estudio',
                en: 'Studio photo session',
                pt: 'Sessão de fotos estúdio',
              },
              other: {
                es: 'Otros',
                en: 'Others',
                pt: 'Outros',
              },
            },
          },
          contactMethod: {
            label: {
              es: '¿Cómo preferís que te contactemos?',
              en: 'How would you prefer us to contact you?',
              pt: 'Como você prefere que entremos em contato?',
            },
            options: {
              whatsapp: {
                es: 'Whatsapp',
                en: 'WhatsApp',
                pt: 'WhatsApp',
              },
              email: {
                es: 'Mail',
                en: 'Email',
                pt: 'Email',
              },
              call: {
                es: 'Llamada',
                en: 'Call',
                pt: 'Ligação',
              },
            },
          },
          eventDate: {
            label: {
              es: 'Fecha aproximada',
              en: 'Approximate date',
              pt: 'Data aproximada',
            },
            optional: {
              es: '(opcional)',
              en: '(optional)',
              pt: '(opcional)',
            },
            help: {
              es: '¡No te preocupes si aún no estás seguro, podemos trabajar con fechas flexibles!',
              en: "Don't worry if you're not sure yet – we can work with flexible dates!",
              pt: 'Não se preocupe se ainda não tem certeza – podemos trabalhar com datas flexíveis!',
            },
          },
          message: {
            label: {
              es: 'Cuéntanos todos los detalles que te parezcan',
              en: 'Tell us all the details you think are relevant',
              pt: 'Conte-nos todos os detalhes que achar relevantes',
            },
            optional: {
              es: '(opcional)',
              en: '(optional)',
              pt: '(opcional)',
            },
            placeholder: {
              es: 'Comparte todos los detalles que consideres importantes para tu evento...',
              en: 'Share all the details you consider important for your event...',
              pt: 'Compartilhe todos os detalhes que considerar importantes para seu evento...',
            },
          },
          attachments: {
            label: {
              es: 'Archivos adjuntos',
              en: 'Attachments',
              pt: 'Anexos',
            },
            optional: {
              es: '(opcional)',
              en: '(optional)',
              pt: '(opcional)',
            },
            description: {
              es: 'Puedes adjuntar fotos o documentos',
              en: 'You can attach photos or documents',
              pt: 'Você pode anexar fotos ou documentos',
            },
          },
          submit: {
            button: {
              es: 'Empezar la conversación',
              en: 'Start the conversation',
              pt: 'Iniciar a conversa',
            },
            loading: {
              es: 'Enviando tu mensaje...',
              en: 'Sending your message...',
              pt: 'Enviando sua mensagem...',
            },
          },
          privacy: {
            line1: {
              es: 'No compartimos tu información. Solo te contactaremos para ayudarte con tu evento.',
              en: "We don't share your info. We'll only reach out to help with your event.",
              pt: 'Não compartilhamos suas informações. Só entraremos em contato para ajudar com seu evento.',
            },
            line2: {
              es: 'Sin spam, sin presión: solo excelente fotografía y videografía cuando estés listo.',
              en: "No spam, no pressure – just great photography and videography when you're ready.",
              pt: 'Sem spam, sem pressão – apenas excelente fotografia e videografia quando estiver pronto.',
            },
          },
        },
        success: {
          title: {
            es: '¡Mensaje enviado!',
            en: 'Message sent!',
            pt: 'Mensagem enviada!',
          },
          message: {
            es: '¡Gracias por contactarnos! te responderemos dentro de 24 horas con todos los detalles para hacer que tu evento sea increíble.',
            en: "Thank you for contacting us! We'll get back to you within 24 hours with all the details to make your event amazing.",
            pt: 'Obrigado por entrar em contato! responderemos dentro de 24 horas com todos os detalhes para tornar seu evento incrível.',
          },
          action: {
            es: 'Enviar otro mensaje',
            en: 'Send another message',
            pt: 'Enviar outra mensagem',
          },
        },
        trust: {
          response: {
            title: {
              es: 'Respuesta rápida',
              en: 'Quick Response',
              pt: 'Resposta Rápida',
            },
            description: {
              es: 'Típicamente respondemos dentro de las 2 horas posteriores a tu consulta',
              en: 'We typically respond within 2 hours after your inquiry',
              pt: 'Normalmente respondemos dentro de 2 horas após sua consulta',
            },
          },
          commitment: {
            title: {
              es: 'Sin compromiso',
              en: 'No Commitment',
              pt: 'Sem Compromisso',
            },
            description: {
              es: 'Obtener una cotización es completamente gratis y sin compromiso',
              en: 'Getting a quote is completely free and without commitment',
              pt: 'Obter um orçamento é completamente gratuito e sem compromisso',
            },
          },
          privacy: {
            title: {
              es: 'Privacidad',
              en: 'Privacy',
              pt: 'Privacidade',
            },
            description: {
              es: 'Respetamos tu privacidad y nunca compartimos tu información',
              en: 'We respect your privacy and never share your information',
              pt: 'Respeitamos sua privacidade e nunca compartilhamos suas informações',
            },
          },
        },
      },
      widget: {
        button: {
          desktop: {
            es: '¿En qué evento estás pensando?',
            en: 'What event are you thinking about?',
            pt: 'Que evento você está pensando?',
          },
          mobile: {
            es: '¿tu evento?',
            en: 'your event?',
            pt: 'seu evento?',
          },
        },
        dialog: {
          title: {
            es: 'Cuéntanos sobre tu evento',
            en: 'Tell us about your event',
            pt: 'Conte-nos sobre seu evento',
          },
        },
        eventTypes: {
          wedding: {
            es: 'Boda',
            en: 'Wedding',
            pt: 'Casamento',
          },
          corporate: {
            es: 'Evento Empresarial',
            en: 'Corporate Event',
            pt: 'Evento Corporativo',
          },
          other: {
            es: 'Otro tipo de evento',
            en: 'Other type of event',
            pt: 'Outro tipo de evento',
          },
        },
        steps: {
          eventType: {
            title: {
              es: '¿En qué evento estás pensando?',
              en: 'What event are you thinking about?',
              pt: 'Que evento você está pensando?',
            },
            subtitle: {
              es: 'Cuéntanos qué quieres celebrar',
              en: 'Tell us what you want to celebrate',
              pt: 'Conte-nos o que você quer celebrar',
            },
          },
          date: {
            title: {
              es: '¿Ya tienes fecha?',
              en: 'Do you have a date already?',
              pt: 'Você já tem uma data?',
            },
            subtitle: {
              es: 'No te preocupes si aún no estás seguro',
              en: "Don't worry if you're not sure yet",
              pt: 'Não se preocupe se ainda não tem certeza',
            },
            noDate: {
              es: 'Aún no tengo fecha definida',
              en: "I don't have a date set yet",
              pt: 'Ainda não tenho uma data definida',
            },
          },
          location: {
            title: {
              es: '¿Dónde será tu evento?',
              en: 'Where will your event be?',
              pt: 'Onde será seu evento?',
            },
            subtitle: {
              es: 'Ayúdanos a entender mejor tu ubicación',
              en: 'Help us understand your location better',
              pt: 'Ajude-nos a entender melhor sua localização',
            },
            placeholder: {
              es: 'Ciudad, barrio o lugar específico',
              en: 'City, neighborhood or specific venue',
              pt: 'Cidade, bairro ou local específico',
            },
            noLocation: {
              es: 'Aún no tengo ubicación definida',
              en: "I don't have a location set yet",
              pt: 'Ainda não tenho uma localização definida',
            },
          },
          contact: {
            title: {
              es: '¿Quieres contarnos más?',
              en: 'Want to tell us more?',
              pt: 'Quer nos contar mais?',
            },
            subtitle: {
              es: 'Elige cómo prefieres que nos contactemos',
              en: 'Choose how you prefer us to contact you',
              pt: 'Escolha como prefere que entremos em contato',
            },
            moreInfo: {
              title: {
                es: 'Sí, quiero contarte más detalles',
                en: 'Yes, I want to tell you more details',
                pt: 'Sim, quero contar mais detalhes',
              },
              subtitle: {
                es: 'te llevamos al formulario completo',
                en: 'We take you to the complete form',
                pt: 'Te levamos ao formulário completo',
              },
            },
            callMe: {
              title: {
                es: 'Quiero que me llamen',
                en: 'I want you to call me',
                pt: 'Quero que me liguem',
              },
              subtitle: {
                es: 'Preferimos hablar por teléfono',
                en: 'We prefer to talk by phone',
                pt: 'Preferimos conversar por telefone',
              },
            },
          },
          phone: {
            title: {
              es: '¡Perfecto! te llamamos',
              en: 'Perfect! We call you',
              pt: 'Perfeito! Te ligamos',
            },
            subtitle: {
              es: 'Déjanos tu número y te contactamos pronto',
              en: 'Leave us your number and we contact you soon',
              pt: 'Deixe seu número e entraremos em contato em breve',
            },
            placeholder: {
              es: 'tu número de teléfono',
              en: 'Your phone number',
              pt: 'seu número de telefone',
            },
            button: {
              es: 'Solicitar llamada',
              en: 'Request call',
              pt: 'Solicitar ligação',
            },
            loading: {
              es: 'Enviando...',
              en: 'Sending...',
              pt: 'Enviando...',
            },
          },
          complete: {
            title: {
              es: '¡Listo!',
              en: 'Ready!',
              pt: 'Pronto!',
            },
            message: {
              es: 'Nos pondremos en contacto contigo muy pronto para conversar sobre tu evento.',
              en: 'We will contact you very soon to talk about your event.',
              pt: 'entraremos em contato muito em breve para conversar sobre seu evento.',
            },
            button: {
              es: 'Cerrar',
              en: 'Close',
              pt: 'Fechar',
            },
          },
        },
      },
      validation: {
        required: {
          es: 'Este campo es requerido',
          en: 'This field is required',
          pt: 'Este campo é obrigatório',
        },
        email: {
          es: 'Por favor ingresa un email válido para que podamos responderte',
          en: 'Please enter a valid email so we can get back to you',
          pt: 'Por favor insira um email válido para podermos responder',
        },
        minLength: {
          es: 'Debe tener al menos {{count}} caracteres',
          en: 'Must be at least {{count}} characters',
          pt: 'Deve ter pelo menos {{count}} caracteres',
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// Export singleton instance
export const formContentService = new FormContentService();
