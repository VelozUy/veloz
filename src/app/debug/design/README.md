# Debug Design Page

This page serves as an experimental playground for Veloz brand components and design patterns. It's designed to help us test and iterate on components before implementing them in the main site.

## Components Showcased

### VelozSignature

- **Horizontal variant**: Shows the full Veloz logo with geometric icon and text
- **Compact variant**: Shows only the geometric icon without text
- Uses the REDJOLA font for the "VELOZ" text
- Adapts to the current theme's primary color

### VelozTarget

- **Simple variant**: Basic crosshair target design
- **Circle variant**: Circular target with concentric rings
- **Complex variant**: Detailed target with multiple elements
- Multiple size options: small, default, large
- Perfect for precision and accuracy themes

### VelozCircles

- **Horizontal orientation**: Row of interconnected circles
- **Vertical orientation**: Column of interconnected circles
- Multiple size options: small, default, large
- Represents connectivity and flow

### VelozWorld

- **World-2 variant**: Simplified globe design
- **World-3 variant**: Detailed globe with grid lines
- Multiple size options: small, default, large
- Perfect for global and international themes

### VelozBarcode

- Traditional barcode pattern design
- Multiple size options: small, default, large
- Represents data, scanning, and technology

### VelozCheckboard

- Checkerboard pattern design
- Multiple size options: small, default, large
- Represents strategy, games, and patterns

### VelozRuler

- **Vertical orientation**: Traditional vertical ruler
- **Horizontal orientation**: Horizontal ruler (rotated)
- Multiple size options: small, default, large
- Represents measurement, precision, and accuracy

### Loader Components

- **TargetLoader**: Bouncing target design with staggered animations for each element
- **VelozLoader**: Animated circles design with pulse/bounce animations
- Multiple size and orientation options
- Perfect for loading states and progress indicators

### PerimeterBox

- Creates a sophisticated double-border frame effect
- Uses CSS `before` pseudo-element for the inner border
- Perfect for highlighting important content sections

### StripedDivider

- Creates a subtle striped line using CSS gradients
- Repeats a 16px pattern for consistent visual rhythm
- Adapts to theme colors automatically

### VelozStamp

- Small branding element with geometric icon and "Veloz Studio" text
- Uses muted colors for subtle placement
- Perfect for footer or signature areas

### GridDotOverlay

- Creates a dot grid background pattern
- Configurable spacing parameter
- Positioned absolutely to overlay content
- Uses muted colors to not interfere with content

## Usage

Visit `/debug/design` to see all components in action with various configurations and combinations. This page is perfect for:

- Testing component variations
- Experimenting with component combinations
- Verifying theme integration
- Prototyping new design patterns

## Theme Integration

All components use CSS custom properties (CSS variables) to automatically adapt to the current theme:

- `--primary` for main brand colors
- `--muted` for subtle elements
- `--border` for frame elements
- `--muted-foreground` for secondary text

## Component Variants

### Size Variants

Most components support three size variants:

- **small**: Compact version for tight spaces
- **default**: Standard size for most use cases
- **large**: Prominent version for emphasis

### Orientation Variants

Some components support different orientations:

- **horizontal**: Left-to-right layout
- **vertical**: Top-to-bottom layout

### Design Variants

Components like VelozTarget and VelozWorld offer multiple design variants:

- **simple**: Basic, clean design
- **circle/complex**: More detailed, intricate designs

### Animation Variants

Loader components offer different animation styles:

- **pulse**: Single circle with pulsing animation (TargetLoader)
- **pulse**: Subtle fade in/out (VelozLoader horizontal)
- **bounce**: Up/down movement (VelozLoader vertical)

## Updated Components

### VelozSignature & VelozStamp

- Now use proper geometric Veloz logo design instead of placeholder
- Consistent design language across both components
- Better integration with the overall brand identity

### TargetLoader

- Now uses the actual target SVG from the Veloz Design Manual
- Features a single large circle with pulsing animation
- Crosshair lines remain static for clean visual design
- Simple, elegant loading state that's easy to notice

### VelozLoader (New)

- Uses the circles design from the Veloz Design Manual
- Offers both pulse and bounce animation options
- Provides an alternative loading pattern to TargetLoader

## Development Notes

- Components are located in `src/components/shared/`
- Tests are in `src/components/shared/__tests__/`
- The page uses the existing theme system
- All animations are defined in `tailwind.config.ts`
- All SVG paths are extracted from the Veloz Design Manual
- Components are fully responsive and accessible
- Updated components now use authentic Veloz design elements
