'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AccentColorsDemo() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-foreground">
        New Accent Colors Demo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accent Soft Gold */}
        <Card className="border-l-4 border-l-[oklch(0.84_0.09_100)]">
          <CardHeader>
            <CardTitle className="text-[oklch(0.84_0.09_100)]">
              Accent Soft Gold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use for subtle highlights in headings, metadata, timeline dots,
              and passive status labels.
            </p>
            <div className="space-y-2">
              <Badge
                variant="secondary"
                className="bg-[oklch(0.84_0.09_100)] text-foreground"
              >
                Reserved
              </Badge>
              <Badge
                variant="secondary"
                className="bg-[oklch(0.84_0.09_100)] text-foreground"
              >
                Optional
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Accent Sky */}
        <Card className="border-l-4 border-l-[oklch(0.82_0.12_220)]">
          <CardHeader>
            <CardTitle className="text-[oklch(0.82_0.12_220)]">
              Accent Sky
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ideal for navigation hover states, links, or underlines in
              content-heavy views.
            </p>
            <div className="space-y-2">
              <a
                href="#"
                className="text-[oklch(0.82_0.12_220)] hover:underline block"
              >
                Navigation Link
              </a>
              <a
                href="#"
                className="text-[oklch(0.82_0.12_220)] hover:underline block"
              >
                Content Link
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Accent Rose */}
        <Card className="border-l-4 border-l-[oklch(0.80_0.14_20)]">
          <CardHeader>
            <CardTitle className="text-[oklch(0.80_0.14_20)]">
              Accent Rose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use for attention-grabbing alerts, error-friendly notices, or
              emotional storytelling accents.
            </p>
            <div className="space-y-2">
              <Badge
                variant="destructive"
                className="bg-[oklch(0.80_0.14_20)] text-foreground"
              >
                Important Notice
              </Badge>
              <Badge
                variant="destructive"
                className="bg-[oklch(0.80_0.14_20)] text-foreground"
              >
                Testimonial
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Accent Lime */}
        <Card className="border-l-4 border-l-[oklch(0.84_0.16_120)]">
          <CardHeader>
            <CardTitle className="text-[oklch(0.84_0.16_120)]">
              Accent Lime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Apply to checklist items marked as complete, confirmations,
              success messages.
            </p>
            <div className="space-y-2">
              <Badge
                variant="secondary"
                className="bg-[oklch(0.84_0.16_120)] text-foreground"
              >
                ✓ Complete
              </Badge>
              <Badge
                variant="secondary"
                className="bg-[oklch(0.84_0.16_120)] text-foreground"
              >
                Success
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Usage Guidelines</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            • <strong>Accent Soft Gold:</strong> Subtle highlights, metadata,
            passive status
          </li>
          <li>
            • <strong>Accent Sky:</strong> Navigation, links, content underlines
          </li>
          <li>
            • <strong>Accent Rose:</strong> Alerts, notices, emotional content
          </li>
          <li>
            • <strong>Accent Lime:</strong> Success states, confirmations,
            completed items
          </li>
        </ul>
      </div>
    </div>
  );
}
