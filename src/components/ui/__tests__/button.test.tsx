import { render, screen } from '@/lib/test-utils';
import { Button } from '@/components/ui/button';
import { userInteraction } from '@/lib/test-utils';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('shadow-none');
    expect(button).toHaveClass('rounded-none');
    // Default variant classes
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="outline">Outline</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('shadow-none');
    expect(button).toHaveClass('rounded-none');
    // Outline variant classes
    expect(button).toHaveClass('bg-transparent');
    expect(button).toHaveClass('text-foreground');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('shadow-none');
    expect(button).toHaveClass('rounded-none');
    // Secondary variant classes
    expect(button).toHaveClass('bg-transparent');
    expect(button).toHaveClass('text-foreground');

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-none');
    // Ghost variant classes
    expect(button).toHaveClass('text-foreground');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('rounded-none');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('rounded-none');

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('size-9');
    expect(button).toHaveClass('rounded-full'); // Icon size uses rounded-full
  });

  it('renders with different priorities', () => {
    const { rerender } = render(<Button priority="high">High Priority</Button>);
    let button = screen.getByRole('button');
    // Default variant classes still apply
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');

    rerender(<Button priority="medium">Medium Priority</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');

    rerender(<Button priority="low">Low Priority</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');
  });

  it('renders with different section types', () => {
    const { rerender } = render(<Button sectionType="hero">Hero Button</Button>);
    let button = screen.getByRole('button');
    // Hero section overrides default variant
    expect(button).toHaveClass('bg-foreground');
    expect(button).toHaveClass('text-background');
    expect(button).toHaveClass('border-transparent');

    rerender(<Button sectionType="cta">CTA Button</Button>);
    button = screen.getByRole('button');
    // CTA section with medium priority uses bg-card
    expect(button).toHaveClass('bg-card');
    expect(button).toHaveClass('text-card-foreground');
    expect(button).toHaveClass('border-primary');

    rerender(<Button sectionType="cta" priority="high">High Priority CTA</Button>);
    button = screen.getByRole('button');
    // CTA section with high priority uses bg-primary
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');
    expect(button).toHaveClass('border-primary');

    rerender(<Button sectionType="form">Form Button</Button>);
    button = screen.getByRole('button');
    // Form section uses default variant (no override)
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('handles asChild prop', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('bg-primary');
    expect(link).toHaveClass('text-primary-foreground');
  });

  it('handles user interactions', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    await userInteraction.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
