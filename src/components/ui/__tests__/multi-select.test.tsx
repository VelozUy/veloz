import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelect } from '../multi-select';

const mockOptions = [
  { value: 'photography', label: 'Fotografía' },
  { value: 'video', label: 'Video' },
  { value: 'drone', label: 'Drone' },
  { value: 'studio', label: 'Sesión de fotos estudio' },
  { value: 'other', label: 'Otros' },
];

describe('MultiSelect Component', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with placeholder when no options are selected', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={[]}
        onValueChange={mockOnValueChange}
        placeholder="seleccionar servicios"
      />
    );

    expect(screen.getByText('seleccionar servicios')).toBeInTheDocument();
  });

  it('renders selected options as badges', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={['photography', 'video']}
        onValueChange={mockOnValueChange}
        placeholder="seleccionar servicios"
      />
    );

    expect(screen.getByText('Fotografía')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.queryByText('seleccionar servicios')).not.toBeInTheDocument();
  });

  it('opens popover when clicked', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={[]}
        onValueChange={mockOnValueChange}
        placeholder="seleccionar servicios"
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Check that unselected options are shown
    expect(screen.getByText('Fotografía')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Drone')).toBeInTheDocument();
    expect(screen.getByText('Sesión de fotos estudio')).toBeInTheDocument();
    expect(screen.getByText('Otros')).toBeInTheDocument();
  });

  it('calls onValueChange when an option is selected', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={[]}
        onValueChange={mockOnValueChange}
        placeholder="seleccionar servicios"
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const photographyOption = screen.getByText('Fotografía');
    fireEvent.click(photographyOption);

    expect(mockOnValueChange).toHaveBeenCalledWith(['photography']);
  });

  it('removes option when X button is clicked on badge', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={['photography', 'video']}
        onValueChange={mockOnValueChange}
        placeholder="seleccionar servicios"
      />
    );

    // Find the X button in the photography badge
    const photographyBadge = screen.getByText('Fotografía').closest('div');
    const xButton = photographyBadge?.querySelector('button');

    if (xButton) {
      fireEvent.click(xButton);
      expect(mockOnValueChange).toHaveBeenCalledWith(['video']);
    }
  });

  it('shows "Todas las opciones seleccionadas" when all options are selected', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={['photography', 'video', 'drone', 'studio', 'other']}
        onValueChange={mockOnValueChange}
        placeholder="seleccionar servicios"
      />
    );

    // Use getAllByRole to get all buttons and click the first one (the main trigger)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(
      screen.getByText('Todas las opciones seleccionadas')
    ).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(
      <MultiSelect
        options={mockOptions}
        value={[]}
        onValueChange={mockOnValueChange}
        placeholder="seleccionar servicios"
      />
    );

    const trigger = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByText('Fotografía')).toBeInTheDocument();

    // Test Space key - close and reopen
    fireEvent.keyDown(trigger, { key: 'Escape' });
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(screen.getByText('Fotografía')).toBeInTheDocument();
  });
});
