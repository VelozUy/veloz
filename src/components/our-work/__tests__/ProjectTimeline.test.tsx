import { render, screen, fireEvent } from '@testing-library/react';
import ProjectTimeline from '../ProjectTimeline';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // Filter out framer-motion props to avoid React warnings
      const {
        whileHover,
        whileTap,
        whileInView,
        initial,
        animate,
        exit,
        transition,
        viewport,
        onKeyDown,
        tabIndex,
        ...restProps
      } = props;
      return <div {...restProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

const mockProject = {
  id: 'test-project',
  title: 'Test Wedding',
  eventDate: '2024-06-15',
  location: 'Buenos Aires',
  eventType: 'casamientos',
  crewMembers: ['crew1', 'crew2'],
};

describe('ProjectTimeline', () => {
  it('renders timeline with project phases', () => {
    render(<ProjectTimeline project={mockProject} />);

    // Check that main timeline elements are rendered
    expect(screen.getByText('Cronología del Proyecto')).toBeInTheDocument();
    expect(screen.getByText('Planificación')).toBeInTheDocument();
    expect(screen.getByText('Preparación')).toBeInTheDocument();
    expect(screen.getByText('Día del Evento')).toBeInTheDocument();
    expect(screen.getByText('Edición')).toBeInTheDocument();
    expect(screen.getByText('Entrega')).toBeInTheDocument();
  });

  it('shows project title in description', () => {
    render(<ProjectTimeline project={mockProject} />);

    expect(
      screen.getByText(/Descubre el proceso completo detrás de Test Wedding/)
    ).toBeInTheDocument();
  });

  it('displays call-to-action section', () => {
    render(<ProjectTimeline project={mockProject} />);

    expect(
      screen.getByText('¿Te gustaría un proceso similar para tu evento?')
    ).toBeInTheDocument();
    expect(screen.getByText('Consultar Disponibilidad')).toBeInTheDocument();
  });

  it('shows status badges for each phase', () => {
    render(<ProjectTimeline project={mockProject} />);

    // All phases should show as completed
    const completedBadges = screen.getAllByText('Completado');
    expect(completedBadges.length).toBeGreaterThan(0);
  });

  it('handles phase expansion when clicked', () => {
    render(<ProjectTimeline project={mockProject} />);

    // Click on the first phase to expand it
    const planningPhase = screen.getByText('Planificación').closest('div');
    if (planningPhase) {
      fireEvent.click(planningPhase);

      // Check that details are shown
      expect(screen.getByText('Actividades Incluidas')).toBeInTheDocument();
      expect(
        screen.getByText('Consulta inicial con el cliente')
      ).toBeInTheDocument();
    }
  });

  it('renders with different project data', () => {
    const differentProject = {
      id: 'different-project',
      title: 'Corporate Event',
      eventDate: '2024-08-20',
      location: 'Córdoba',
      eventType: 'corporativos',
    };

    render(<ProjectTimeline project={differentProject} />);

    expect(
      screen.getByText(/Descubre el proceso completo detrás de Corporate Event/)
    ).toBeInTheDocument();
  });

  it('handles project without event date', () => {
    const projectWithoutDate = {
      id: 'no-date-project',
      title: 'Project Without Date',
      location: 'Rosario',
      eventType: 'otros',
    };

    render(<ProjectTimeline project={projectWithoutDate} />);

    // Should still render without errors
    expect(screen.getByText('Cronología del Proyecto')).toBeInTheDocument();
  });
});
