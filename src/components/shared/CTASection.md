# CTASection Component

A reusable Call-to-Action section component extracted from the projects page.

## Usage

### Basic Usage (Default Props)

```tsx
import { CTASection } from '@/components/shared';

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <CTASection />
    </div>
  );
}
```

### Custom Props

```tsx
import { CTASection } from '@/components/shared';
import { Phone, Calendar } from 'lucide-react';

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <CTASection
        title="Get Started Today"
        description="Join thousands of satisfied customers who trust our services."
        primaryButtonText="Call Now"
        primaryButtonHref="/contact"
        secondaryButtonText="Schedule Meeting"
        secondaryButtonHref="/schedule"
        primaryButtonIcon={Phone}
        secondaryButtonIcon={Calendar}
        className="my-custom-class"
      />
    </div>
  );
}
```

## Props

| Prop                  | Type                  | Default                                                                    | Description                         |
| --------------------- | --------------------- | -------------------------------------------------------------------------- | ----------------------------------- |
| `title`               | `string`              | `'¿Listo para Comenzar?'`                                                  | The main heading text               |
| `description`         | `string`              | `'Cuéntanos sobre tu evento y descubre cómo podemos hacerlo inolvidable.'` | The description text                |
| `primaryButtonText`   | `string`              | `'Contactar Ahora'`                                                        | Text for the primary button         |
| `primaryButtonHref`   | `string`              | `'/contact'`                                                               | Link for the primary button         |
| `secondaryButtonText` | `string`              | `'Acceso Clientes'`                                                        | Text for the secondary button       |
| `secondaryButtonHref` | `string`              | `'/projects/login'`                                                        | Link for the secondary button       |
| `primaryButtonIcon`   | `React.ComponentType` | `Mail`                                                                     | Icon component for primary button   |
| `secondaryButtonIcon` | `React.ComponentType` | `Users`                                                                    | Icon component for secondary button |
| `className`           | `string`              | `''`                                                                       | Additional CSS classes              |

## Styling

The component uses:

- Primary background color (`bg-primary`)
- Primary foreground text color (`text-primary-foreground`)
- Responsive layout with flexbox
- Tailwind CSS classes for spacing and typography
- 64px border spacing (`max-w-border-64`)

## Examples

### Contact Page CTA

```tsx
<CTASection
  title="Ready to Start Your Project?"
  description="Let's discuss your vision and create something amazing together."
  primaryButtonText="Start Conversation"
  secondaryButtonText="View Portfolio"
  secondaryButtonHref="/our-work"
/>
```

### Our Work Page CTA

```tsx
<CTASection
  title="¿Listo para Comenzar?"
  description="Cuéntanos sobre tu evento y descubre cómo podemos hacerlo inolvidable."
  primaryButtonText="Contactar Ahora"
  primaryButtonHref="/contact"
  secondaryButtonText="Ver Nuestro Trabajo"
  secondaryButtonHref="/our-work"
/>
```

### Service Page CTA

```tsx
<CTASection
  title="Book Your Session"
  description="Limited availability - secure your spot today."
  primaryButtonText="Book Now"
  primaryButtonHref="/booking"
  secondaryButtonText="Learn More"
  secondaryButtonHref="/services"
  primaryButtonIcon={Calendar}
  secondaryButtonIcon={Info}
/>
```
