'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { LayoutTemplate, HeroRatio } from '@/types';
import LayoutPreview from './LayoutPreview';
import HeroMediaSelector from './HeroMediaSelector';
import { ProjectMedia } from '@/services/firebase';
import { Layout, Columns, AlignJustify, Settings } from 'lucide-react';

interface LayoutTemplateSelectorProps {
  layoutTemplate: LayoutTemplate;
  heroRatio: HeroRatio;
  customHeroRatio?: { width: number; height: number };
  onLayoutTemplateChange: (template: LayoutTemplate) => void;
  onHeroRatioChange: (ratio: HeroRatio) => void;
  onCustomHeroRatioChange: (ratio: { width: number; height: number }) => void;
  onHeroMediaChange: (mediaId: string | null) => void;
  projectTitle?: string;
  projectDescription?: string;
  projectMedia: ProjectMedia[];
  selectedHeroMedia?: ProjectMedia;
  disabled?: boolean;
}

const layoutTemplates = [
  {
    value: 'hero' as LayoutTemplate,
    label: 'Hero Full-Width',
    description: 'Immersive opening with large media and minimal text overlay',
    icon: Layout,
    preview: 'Large hero image/video with centered content',
  },
  {
    value: '2-column' as LayoutTemplate,
    label: '2-Column Alternating',
    description:
      'Story-driven narrative flow with media and text alternating in columns',
    icon: Columns,
    preview: 'Media and text alternate in two columns',
  },
  {
    value: 'vertical-story' as LayoutTemplate,
    label: 'Vertical Story Flow',
    description:
      'Timeline-style presentation with annotated blocks and chronological flow',
    icon: AlignJustify,
    preview: 'Vertical timeline with media and text blocks',
  },
  {
    value: 'custom' as LayoutTemplate,
    label: 'Custom Layout',
    description: 'Admin-defined combinations for unique projects',
    icon: Settings,
    preview: 'Custom layout configuration',
  },
];

export default function LayoutTemplateSelector({
  layoutTemplate,
  heroRatio,
  customHeroRatio,
  onLayoutTemplateChange,
  onHeroRatioChange,
  onCustomHeroRatioChange,
  onHeroMediaChange,
  projectTitle,
  projectDescription,
  projectMedia,
  selectedHeroMedia,
  disabled,
}: LayoutTemplateSelectorProps) {
  const [showCustomRatio, setShowCustomRatio] = useState(
    heroRatio === 'custom'
  );

  const handleHeroRatioChange = (newRatio: HeroRatio) => {
    onHeroRatioChange(newRatio);
    setShowCustomRatio(newRatio === 'custom');
    if (newRatio === 'custom' && !customHeroRatio) {
      onCustomHeroRatioChange({ width: 16, height: 9 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Layout Preview with Toolbar */}
      <LayoutPreview
        layoutTemplate={layoutTemplate}
        heroRatio={heroRatio}
        customHeroRatio={customHeroRatio}
        onLayoutTemplateChange={onLayoutTemplateChange}
        onHeroRatioChange={handleHeroRatioChange}
        onCustomHeroRatioChange={onCustomHeroRatioChange}
        showCustomRatio={showCustomRatio}
        setShowCustomRatio={setShowCustomRatio}
        projectTitle={projectTitle}
        projectDescription={projectDescription}
        projectMedia={projectMedia}
        selectedHeroMedia={selectedHeroMedia}
        disabled={disabled}
      />

      {/* Hero Media Selector */}
      <HeroMediaSelector
        projectMedia={projectMedia}
        selectedHeroMediaId={selectedHeroMedia?.id || null}
        onHeroMediaChange={onHeroMediaChange}
        heroRatio={heroRatio}
        disabled={disabled}
      />
    </div>
  );
}
