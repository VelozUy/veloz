'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getStaticContent } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Heart,
  MessageCircle,
  Calendar,
  Phone,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { emailService, type ContactFormData } from '@/services/email';
import { contactMessageService } from '@/services/firebase';
import type { ContactMessageData } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';

type SurveyStep =
  | 'event-type'
  | 'date'
  | 'contact-preference'
  | 'phone-capture'
  | 'complete';

interface SurveyData {
  eventType?: string;
  hasDate?: boolean;
  eventDate?: string;
  wantsMoreInfo?: boolean;
  phone?: string;
}

// Inline Calendar Component
const InlineCalendar = ({
  onDateSelect,
  selectedDate,
}: {
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const previousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const nextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    const dateString = date.toISOString().split('T')[0];
    onDateSelect(dateString);
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(displayYear, displayMonth, day);
    const dateString = date.toISOString().split('T')[0];
    return dateString === selectedDate;
  };

  const isDatePast = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return date < todayStart;
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isPast = isDatePast(day);
      const isSelected = isDateSelected(day);

      days.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateClick(day)}
          disabled={isPast}
          className={`
            h-8 w-8 rounded-full text-sm transition-colors
            ${
              isPast
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-primary hover:text-primary-foreground cursor-pointer'
            }
            ${
              isSelected
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-foreground'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
        </button>
        <h3 className="font-semibold text-lg">
          {monthNames[displayMonth]} {displayYear}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground p-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
    </div>
  );
};

export function InteractiveCTAWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { trackCTAInteraction } = useAnalytics();

  // Detect current language from pathname
  const currentLanguage = useMemo(() => {
    if (pathname.startsWith('/en')) return 'en';
    if (pathname.startsWith('/pt')) return 'pt';
    return 'es'; // Default to Spanish
  }, [pathname]);

  // Get static content for current language
  const content = getStaticContent(currentLanguage);

  // Helper function to get translations
  const getTranslation = (path: string): string => {
    const keys = path.split('.');
    let current: unknown = content.translations;

    for (const key of keys) {
      if (
        current &&
        typeof current === 'object' &&
        current !== null &&
        key in current
      ) {
        current = (current as Record<string, unknown>)[key];
      } else {
        console.warn(`Translation missing for path: ${path}`);
        return path; // Return the path as fallback
      }
    }

    return typeof current === 'string' ? current : path;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<SurveyStep>('event-type');
  const [surveyData, setSurveyData] = useState<SurveyData>({});
  const [phoneInput, setPhoneInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll direction and positioning state
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to mobile to avoid hydration issues

  // Dwell time tracking for user engagement
  const [dwellStartTime, setDwellStartTime] = useState<number | null>(null);
  const [dwellPosition, setDwellPosition] = useState<number>(0);
  const [isUserEngaged, setIsUserEngaged] = useState(false);
  const [dwellProgress, setDwellProgress] = useState(0); // Progress from 0 to 1

  // Dwell time constants
  const DWELL_THRESHOLD = 5000; // 5 seconds in milliseconds
  const MOVEMENT_THRESHOLD = 100; // 100px allowed movement before resetting dwell timer

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Set initial mobile state
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    // Add a small delay for the entrance animation to feel more natural
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Handle scroll direction detection, dwell time tracking, and window resize
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      // Check for significant movement that would reset dwell timer
      const hasMovedSignificantly =
        dwellStartTime !== null &&
        Math.abs(currentScrollY - dwellPosition) > MOVEMENT_THRESHOLD;

      if (hasMovedSignificantly) {
        // User moved significantly, reset dwell tracking
        setDwellStartTime(null);
        setIsUserEngaged(false);
      } else if (dwellStartTime === null) {
        // Start new dwell timer
        const startTime = Date.now();
        setDwellStartTime(startTime);
        setDwellPosition(currentScrollY);
      }

      setLastScrollY(currentScrollY);
    };

    const handleResize = () => {
      // Update mobile state and force re-render on resize
      const checkMobile = () => window.innerWidth < 768;
      setIsMobile(checkMobile());
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    lastScrollY,
    mounted,
    dwellStartTime,
    dwellPosition,
    DWELL_THRESHOLD,
    MOVEMENT_THRESHOLD,
  ]);

  // Handle dwell timer and progress tracking
  useEffect(() => {
    if (!mounted || dwellStartTime === null) {
      setDwellProgress(0);
      return;
    }

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - dwellStartTime;
      const progress = Math.min(elapsed / DWELL_THRESHOLD, 1);
      setDwellProgress(progress);

      if (progress >= 1) {
        // Add a small delay before showing the widget to make it feel more natural
        setTimeout(() => {
          setIsUserEngaged(true);
        }, 300);
        clearInterval(progressInterval);
      }
    }, 100); // Update progress every 100ms for smooth animation

    return () => clearInterval(progressInterval);
  }, [dwellStartTime, mounted, DWELL_THRESHOLD]);

  // Calculate widget base position classes
  const getWidgetBaseClasses = () => {
    return 'fixed right-4 z-40';
  };

  // Add smooth transform animation styles with positioning and entrance animation
  const getWidgetTransformStyle = (): React.CSSProperties => {
    if (!mounted || !isVisible || !isUserEngaged) {
      return {
        transform: 'translateY(30px) scale(0.85) rotate(-2deg)',
        opacity: 0,
        filter: 'blur(2px)',
        transition:
          'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out, filter 0.3s ease-out',
        // Default positioning during load
        top: 'auto',
        bottom: '80px', // Above bottom nav on mobile
      };
    }

    // Determine position based on screen size and scroll direction
    let positioning: React.CSSProperties = {};

    if (isMobile) {
      // Mobile: Dynamic positioning based on scroll direction
      if (scrollDirection === 'down') {
        positioning = {
          top: '96px', // Below top nav (96px = 6rem = top-24)
          bottom: 'auto',
        };
      } else {
        positioning = {
          top: 'auto',
          bottom: '80px', // Above bottom nav (80px = 5rem = bottom-20)
        };
      }
    } else {
      // Desktop: Always at top
      positioning = {
        top: '96px', // Below top nav
        bottom: 'auto',
      };
    }

    return {
      transform: 'translateY(0) scale(1.02) rotate(0deg)',
      opacity: 1,
      filter: 'blur(0px)',
      transition:
        'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.6s ease-out, filter 0.4s ease-out, box-shadow 0.5s ease-out',
      boxShadow:
        '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
      animation: 'breathe 4s ease-in-out infinite',
      ...positioning,
    };
  };

  const eventTypes = [
    {
      value: 'wedding',
      label: getTranslation('widget.eventTypes.wedding'),
      emoji: '💒',
    },
    {
      value: 'corporate',
      label: getTranslation('widget.eventTypes.corporate'),
      emoji: '🏢',
    },
    {
      value: 'other',
      label: getTranslation('widget.eventTypes.other'),
      emoji: '🎉',
    },
  ];

  const handleEventTypeSelect = (eventType: string) => {
    setSurveyData({ ...surveyData, eventType });
    setCurrentStep('date');
  };

  const handleDateResponse = (hasDate: boolean, date?: string) => {
    setSurveyData({ ...surveyData, hasDate, eventDate: date });
    setCurrentStep('contact-preference');
  };

  const handleContactPreference = (preference: 'more-info' | 'call-me') => {
    if (preference === 'more-info') {
      // Navigate to contact form with pre-filled data
      const params = new URLSearchParams();
      if (surveyData.eventType) params.set('evento', surveyData.eventType);
      if (surveyData.eventDate) params.set('fecha', surveyData.eventDate);

      // Navigate to the appropriate contact page based on current language
      const contactPath =
        currentLanguage === 'es' ? '/contact' : `/${currentLanguage}/contact`;
      router.push(`${contactPath}?${params.toString()}`);
      setIsOpen(false);
      resetSurvey();
    } else {
      setSurveyData({ ...surveyData, wantsMoreInfo: false });
      setCurrentStep('phone-capture');
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneInput.trim()) return;

    setIsSubmitting(true);
    try {
      // Prepare data for both services
      const emailData: ContactFormData = {
        name: 'Prospecto desde Widget',
        email: 'widget@veloz.com.uy', // Placeholder email
        eventType: surveyData.eventType || 'otro',
        eventDate: surveyData.eventDate,
        phone: phoneInput,
        message: `Solicitud de contacto telefónico desde el widget interactivo.\nTipo de evento: ${surveyData.eventType}\nFecha: ${surveyData.eventDate || 'No especificada'}`,
        source: 'widget',
      };

      const firestoreData: ContactMessageData = {
        name: 'Prospecto desde Widget',
        phone: phoneInput,
        eventType: surveyData.eventType || 'otro',
        eventDate: surveyData.eventDate,
        message: `Solicitud de contacto telefónico desde el widget interactivo.\nTipo de evento: ${surveyData.eventType}\nFecha: ${surveyData.eventDate || 'No especificada'}`,
        source: 'widget',
        isRead: false,
        status: 'new',
        archived: false,
      };

      // Execute both operations in parallel
      const [emailResult, firestoreResult] = await Promise.allSettled([
        emailService.sendContactForm(emailData),
        contactMessageService.create(firestoreData),
      ]);

      // Log any failures but continue to show success
      if (emailResult.status === 'rejected') {
        console.error('Email sending failed:', emailResult.reason);
      }

      if (firestoreResult.status === 'rejected') {
        console.error('Firestore storage failed:', firestoreResult.reason);
      }

      setCurrentStep('complete');
    } catch (error) {
      console.error('Error processing phone request:', error);
      // Still show success to user, but log error
      setCurrentStep('complete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSurvey = () => {
    setCurrentStep('event-type');
    setSurveyData({});
    setPhoneInput('');
    setIsSubmitting(false);
  };

  const closeSurvey = () => {
    setIsOpen(false);
    // Reset after animation completes
    setTimeout(resetSurvey, 300);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'event-type':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Heart className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.eventType.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.eventType.subtitle')}
              </p>
            </div>
            <div className="space-y-3">
              {eventTypes.map(type => (
                <Button
                  key={type.value}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 text-left"
                  onClick={() => handleEventTypeSelect(type.value)}
                >
                  <span className="text-xl mr-3">{type.emoji}</span>
                  <span className="font-medium">{type.label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Calendar className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.date.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.date.subtitle')}
              </p>
            </div>
            <div className="space-y-4">
              <InlineCalendar
                onDateSelect={date => handleDateResponse(true, date)}
                selectedDate={surveyData.eventDate}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDateResponse(false)}
              >
                {getTranslation('widget.steps.date.noDate')}
              </Button>
            </div>
          </div>
        );

      case 'contact-preference':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <MessageCircle className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.contact.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.contact.subtitle')}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full justify-start h-auto p-4"
                onClick={() => handleContactPreference('more-info')}
              >
                <div className="text-left">
                  <div className="font-medium">
                    {getTranslation('widget.steps.contact.moreInfo.title')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getTranslation('widget.steps.contact.moreInfo.subtitle')}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleContactPreference('call-me')}
              >
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">
                    {getTranslation('widget.steps.contact.callMe.title')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getTranslation('widget.steps.contact.callMe.subtitle')}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </div>
        );

      case 'phone-capture':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Phone className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.phone.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.phone.subtitle')}
              </p>
            </div>
            <div className="space-y-3">
              <Input
                type="tel"
                placeholder={getTranslation('widget.steps.phone.placeholder')}
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={handlePhoneSubmit}
                disabled={!phoneInput.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full w-4 h-4 border-b-2 border-primary-foreground mr-2" />
                    {getTranslation('widget.steps.phone.loading')}
                  </>
                ) : (
                  getTranslation('widget.steps.phone.button')
                )}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.complete.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.complete.message')}
              </p>
            </div>
            <Button onClick={closeSurvey} className="w-full">
              {getTranslation('widget.steps.complete.button')}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`${getWidgetBaseClasses()}`}
        style={getWidgetTransformStyle()}
      >
        {/* Progress indicator ring - shows when user is dwelling but not yet engaged */}
        {mounted && dwellProgress > 0 && !isUserEngaged && (
          <div
            className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse"
            style={{
              background: `conic-gradient(from -90deg, transparent 0deg, rgba(var(--primary), ${0.2 + dwellProgress * 0.3}) ${dwellProgress * 360}deg, transparent ${dwellProgress * 360}deg)`,
              transform: `scale(${1 + dwellProgress * 0.05}) rotate(${dwellProgress * 10}deg)`,
              transition: 'all 0.2s ease-out',
              filter: `blur(${Math.max(0, 1 - dwellProgress)}px)`,
            }}
          />
        )}

        <Button
          onClick={() => {
            trackCTAInteraction({
              projectId: 'widget',
              ctaType: 'contact_form',
              ctaLocation: 'sticky_button',
            });
            setIsOpen(true);
          }}
          className="relative rounded-full shadow-lg hover:shadow-2xl h-12 px-4 md:px-6 w-full transition-all duration-300 hover:scale-105 active:scale-95 hover:-translate-y-1"
          size="lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">
            {getTranslation('widget.button.desktop')}
          </span>
          <span className="sm:hidden">
            {getTranslation('widget.button.mobile')}
          </span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={closeSurvey}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {getTranslation('widget.dialog.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">{renderStepContent()}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
