import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CrewMemberAssignment from '../CrewMemberAssignment';
import { crewMemberService } from '@/services/crew-member';

// Mock the crew member service
jest.mock('@/services/crew-member');
const mockCrewMemberService = crewMemberService as jest.Mocked<typeof crewMemberService>;

// Mock crew member data
const mockCrewMembers = [
  {
    id: '1',
    name: { es: 'Juan Pérez', en: 'Juan Perez', pt: 'Juan Perez' },
    role: { es: 'Fotógrafo/a', en: 'Photographer', pt: 'Fotógrafo/a' },
    portrait: 'https://example.com/juan.jpg',
    bio: { es: 'Fotógrafo/a profesional', en: 'Professional Photographer', pt: 'Fotógrafo/a profissional' },
    skills: ['Fotografía', 'Edición', 'Iluminación'],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: { es: 'María García', en: 'Maria Garcia', pt: 'Maria Garcia' },
    role: { es: 'Videógrafo/a', en: 'Videographer', pt: 'Videógrafo/a' },
    portrait: 'https://example.com/maria.jpg',
    bio: { es: 'Videógrafo/a profesional', en: 'Professional Videographer', pt: 'Videógrafo/a profissional' },
    skills: ['Video', 'Edición', 'Sonido'],
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('CrewMemberAssignment', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock the getAllCrewMembers method
    mockCrewMemberService.getAllCrewMembers.mockResolvedValue({
      success: true,
      data: mockCrewMembers,
    });
  });

  it('renders crew member assignment component', async () => {
    const onCrewMembersChange = jest.fn();
    
    render(
      <CrewMemberAssignment
        selectedCrewMemberIds={[]}
        onCrewMembersChange={onCrewMembersChange}
      />
    );

    // Check if the component renders
    expect(screen.getByText('Crew Members')).toBeInTheDocument();
    expect(screen.getByText('Add Crew Member')).toBeInTheDocument();
    
    // Wait for crew members to load
    await waitFor(() => {
      expect(mockCrewMemberService.getAllCrewMembers).toHaveBeenCalled();
    });
  });

  it('shows selected crew members', async () => {
    const onCrewMembersChange = jest.fn();
    
    render(
      <CrewMemberAssignment
        selectedCrewMemberIds={['1']}
        onCrewMembersChange={onCrewMembersChange}
      />
    );

    // Wait for crew members to load
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Check if selected crew member is displayed
    expect(screen.getByText('Assigned Crew Members (1)')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Fotógrafo/a')).toBeInTheDocument();
  });

  it('allows adding crew members', async () => {
    const onCrewMembersChange = jest.fn();
    
    render(
      <CrewMemberAssignment
        selectedCrewMemberIds={[]}
        onCrewMembersChange={onCrewMembersChange}
      />
    );

    // Wait for crew members to load
    await waitFor(() => {
      expect(mockCrewMemberService.getAllCrewMembers).toHaveBeenCalled();
    });

    // Open the dialog
    const addButton = screen.getByText('Add Crew Member');
    fireEvent.click(addButton);

    // Check if dialog opens
    await waitFor(() => {
      expect(screen.getByText('Select Crew Members')).toBeInTheDocument();
    });

    // Check if crew members are listed in dialog
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María García')).toBeInTheDocument();
  });

  it('allows removing crew members', async () => {
    const onCrewMembersChange = jest.fn();
    
    render(
      <CrewMemberAssignment
        selectedCrewMemberIds={['1']}
        onCrewMembersChange={onCrewMembersChange}
      />
    );

    // Wait for crew members to load
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Find and click the remove button (X button)
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    // Check if the callback was called with empty array
    expect(onCrewMembersChange).toHaveBeenCalledWith([]);
  });

  it('shows no crew members message when none assigned', async () => {
    const onCrewMembersChange = jest.fn();
    
    render(
      <CrewMemberAssignment
        selectedCrewMemberIds={[]}
        onCrewMembersChange={onCrewMembersChange}
      />
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('No crew members assigned to this project')).toBeInTheDocument();
    });
  });

  it('disables component when disabled prop is true', async () => {
    const onCrewMembersChange = jest.fn();
    
    render(
      <CrewMemberAssignment
        selectedCrewMemberIds={[]}
        onCrewMembersChange={onCrewMembersChange}
        disabled={true}
      />
    );

    // Check if add button is disabled
    const addButton = screen.getByText('Add Crew Member');
    expect(addButton).toBeDisabled();
  });
}); 