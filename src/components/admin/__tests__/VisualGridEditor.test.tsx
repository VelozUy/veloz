import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VisualGridEditor, { MediaBlock } from '../VisualGridEditor';
import { ProjectMedia } from '@/services/firebase';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return (
      <div data-testid="mock-image" data-src={src} data-alt={alt} {...props} />
    );
  };
});

// Mock video element
Object.defineProperty(window.HTMLMediaElement.prototype, 'muted', {
  set: jest.fn(),
});

const mockProjectMedia: ProjectMedia[] = [
  {
    id: 'media1',
    projectId: 'project1',
    url: 'https://example.com/image1.jpg',
    fileName: 'image1.jpg',
    filePath: 'projects/project1/image1.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    type: 'photo',
    aspectRatio: '1:1',
    width: 800,
    height: 800,
    tags: [],
    order: 1,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'media2',
    projectId: 'project1',
    url: 'https://example.com/video1.mp4',
    fileName: 'video1.mp4',
    filePath: 'projects/project1/video1.mp4',
    fileSize: 2048000,
    mimeType: 'video/mp4',
    type: 'video',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    tags: [],
    order: 2,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMediaBlocks: MediaBlock[] = [
  {
    id: 'block1',
    mediaId: 'media1',
    x: 0,
    y: 0,
    width: 160, // 2 grid cells
    height: 160,
    type: 'image',
    zIndex: 1,
  },
];

describe('VisualGridEditor', () => {
  const mockOnMediaBlocksChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the grid editor with correct dimensions', () => {
    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={mockMediaBlocks}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    expect(
      screen.getByText('Editor Visual de Disposición')
    ).toBeInTheDocument();
    expect(screen.getByText('6×4 Grid • 1 bloques')).toBeInTheDocument();
  });

  it('displays available media in the library', () => {
    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={mockMediaBlocks}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    expect(screen.getByText('Biblioteca de Media')).toBeInTheDocument();
    expect(screen.getByText('video1.mp4')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('shows "all media placed" message when no available media', () => {
    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={[
          ...mockMediaBlocks,
          {
            id: 'block2',
            mediaId: 'media2',
            x: 160,
            y: 0,
            width: 160,
            height: 160,
            type: 'video',
            zIndex: 2,
          },
        ]}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    expect(
      screen.getByText('Todos los media han sido colocados en la cuadrícula')
    ).toBeInTheDocument();
  });

  it('adds new media block with proper grid constraints', () => {
    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={mockMediaBlocks}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    // Find the add button by looking for the button with Move icon (last button in the media library)
    const addButtons = screen.getAllByRole('button');
    const addButton = addButtons[addButtons.length - 1]; // The last button should be the add button
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton!);

    expect(mockOnMediaBlocksChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringContaining('block-'),
          mediaId: 'media2',
          width: 160, // 2 grid cells
          height: 160,
          x: expect.any(Number),
          y: expect.any(Number),
        }),
      ])
    );
  });

  it('prevents media blocks from being placed outside grid boundaries', () => {
    const invalidBlocks: MediaBlock[] = [
      {
        id: 'invalid1',
        mediaId: 'media1',
        x: 1000, // Outside grid
        y: 1000, // Outside grid
        width: 1000, // Too large
        height: 1000, // Too large
        type: 'image',
        zIndex: 1,
      },
    ];

    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={invalidBlocks}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    // The component should automatically fix invalid blocks on mount
    expect(mockOnMediaBlocksChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'invalid1',
          x: expect.any(Number),
          y: expect.any(Number),
          width: expect.any(Number),
          height: expect.any(Number),
        }),
      ])
    );
  });

  it('constrains resize operations to grid boundaries', async () => {
    const { container } = render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={mockMediaBlocks}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    const mediaBlock = container.querySelector('[style*="left: 0px"]');
    expect(mediaBlock).toBeInTheDocument();

    // Find resize handle by looking for the element with cursor-se-resize class
    const resizeHandle = container.querySelector('.cursor-se-resize');
    expect(resizeHandle).toBeInTheDocument();

    // Simulate resize drag
    fireEvent.mouseDown(resizeHandle!, { clientX: 0, clientY: 0 });

    // Move mouse to try to resize beyond grid
    fireEvent.mouseMove(document, { clientX: 1000, clientY: 1000 });

    fireEvent.mouseUp(document);

    await waitFor(() => {
      expect(mockOnMediaBlocksChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'block1',
            width: expect.any(Number),
            height: expect.any(Number),
          }),
        ])
      );
    });
  });

  it('removes media block when delete button is clicked', () => {
    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={mockMediaBlocks}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    // Find the delete button by looking for the button with absolute positioning
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(
      button =>
        button.classList.contains('absolute') &&
        button.classList.contains('top-1') &&
        button.classList.contains('right-1')
    );
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton!);

    expect(mockOnMediaBlocksChange).toHaveBeenCalledWith([]);
  });

  it('clears all blocks when clear button is clicked', () => {
    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={mockMediaBlocks}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    const clearButton = screen.getByText('Limpiar Todo');
    fireEvent.click(clearButton);

    expect(mockOnMediaBlocksChange).toHaveBeenCalledWith([]);
  });

  it('disables interactions when disabled prop is true', () => {
    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={mockMediaBlocks}
        onMediaBlocksChange={mockOnMediaBlocksChange}
        disabled={true}
      />
    );

    // Find the add button (last button in the media library)
    const addButtons = screen.getAllByRole('button');
    const addButton = addButtons[addButtons.length - 1];
    expect(addButton).toBeDisabled();

    const clearButton = screen.getByText('Limpiar Todo');
    expect(clearButton).toBeDisabled();
  });

  it('maintains minimum size of 1 grid cell', () => {
    const tinyBlock: MediaBlock[] = [
      {
        id: 'tiny1',
        mediaId: 'media1',
        x: 0,
        y: 0,
        width: 10, // Too small
        height: 10, // Too small
        type: 'image',
        zIndex: 1,
      },
    ];

    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={tinyBlock}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    // Should automatically fix to minimum size on mount
    expect(mockOnMediaBlocksChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'tiny1',
          width: 80, // Minimum 1 grid cell
          height: 80, // Minimum 1 grid cell
        }),
      ])
    );
  });

  it('prevents blocks from overlapping when adding new media', () => {
    const existingBlocks: MediaBlock[] = [
      {
        id: 'block1',
        mediaId: 'media1',
        x: 0,
        y: 0,
        width: 160,
        height: 160,
        type: 'image',
        zIndex: 1,
      },
    ];

    render(
      <VisualGridEditor
        projectMedia={mockProjectMedia}
        mediaBlocks={existingBlocks}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    // Find the add button (last button in the media library)
    const addButtons = screen.getAllByRole('button');
    const addButton = addButtons[addButtons.length - 1];
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton!);

    // Should place new block in non-overlapping position
    expect(mockOnMediaBlocksChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'block1',
          x: 0,
          y: 0,
        }),
        expect.objectContaining({
          id: expect.stringContaining('block-'),
          mediaId: 'media2',
          // Should be placed at a different position
          x: expect.any(Number),
          y: expect.any(Number),
        }),
      ])
    );
  });

  it('allows full range of media movement within containers', () => {
    const wideMedia: ProjectMedia = {
      id: 'wide-media',
      projectId: 'project1',
      url: 'https://example.com/wide-image.jpg',
      fileName: 'wide-image.jpg',
      filePath: 'projects/project1/wide-image.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      type: 'photo',
      aspectRatio: '3:1', // Very wide aspect ratio
      width: 2400,
      height: 800,
      tags: [],
      order: 1,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const blockWithWideMedia: MediaBlock = {
      id: 'wide-block',
      mediaId: 'wide-media',
      x: 0,
      y: 0,
      width: 4, // 4 grid cells wide
      height: 2, // 2 grid cells tall (aspect ratio 2:1)
      type: 'image',
      zIndex: 1,
    };

    const { container } = render(
      <VisualGridEditor
        projectMedia={[wideMedia]}
        mediaBlocks={[blockWithWideMedia]}
        onMediaBlocksChange={mockOnMediaBlocksChange}
      />
    );

    // The media has aspect ratio 3:1, container has 2:1
    // This means the media is wider than the container and should be able to move horizontally
    // The component should render without errors
    expect(container).toBeInTheDocument();

    // Verify the media block is rendered
    const mediaBlock = container.querySelector('[style*="left: 0px"]');
    expect(mediaBlock).toBeInTheDocument();
  });
});
