'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { LayoutTemplate, HeroRatio } from '@/types';
import LayoutPreview from './LayoutPreview';
import HeroMediaSelector from './HeroMediaSelector';
import { ProjectMedia } from '@/services/firebase';
import { 
  Layout, 
  Image, 
  Columns, 
  AlignJustify, 
  Settings,
  Video,
  Instagram,
  Smartphone as MobileIcon,
  Square,
} from 'lucide-react';

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
    description: 'Story-driven narrative flow with media and text alternating in columns',
    icon: Columns,
    preview: 'Media and text alternate in two columns',
  },
  {
    value: 'vertical-story' as LayoutTemplate,
    label: 'Vertical Story Flow',
    description: 'Timeline-style presentation with annotated blocks and chronological flow',
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

const heroRatios = [
  {
    value: '1:1' as HeroRatio,
    label: 'Square (1:1)',
    description: 'Square format for portrait-style content',
    icon: Square,
    preview: 'Perfect square format',
  },
  {
    value: '16:9' as HeroRatio,
    label: 'Widescreen (16:9)',
    description: 'Cinematic widescreen for video content',
    icon: Video,
    preview: 'Cinematic widescreen format',
  },
  {
    value: '4:5' as HeroRatio,
    label: 'Instagram Portrait (4:5)',
    description: 'Instagram-style portrait for social media optimization',
    icon: Instagram,
    preview: 'Instagram-optimized portrait',
  },
  {
    value: '9:16' as HeroRatio,
    label: 'Mobile Portrait (9:16)',
    description: 'Mobile-first vertical content',
    icon: MobileIcon,
    preview: 'Mobile-optimized vertical',
  },
  {
    value: 'custom' as HeroRatio,
    label: 'Custom Ratio',
    description: 'Admin-defined dimensions for unique content',
    icon: Settings,
    preview: 'Custom aspect ratio',
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
  const [showCustomRatio, setShowCustomRatio] = useState(heroRatio === 'custom');

  const handleHeroRatioChange = (newRatio: HeroRatio) => {
    onHeroRatioChange(newRatio);
    setShowCustomRatio(newRatio === 'custom');
    
    if (newRatio === 'custom' && !customHeroRatio) {
      onCustomHeroRatioChange({ width: 16, height: 9 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Layout Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Plantilla de Diseño
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {layoutTemplates.map((template) => {
              const Icon = template.icon;
              const isSelected = layoutTemplate === template.value;
              
              return (
                <button
                  key={template.value}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !disabled && onLayoutTemplateChange(template.value)}
                  title={template.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hero Ratio Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Proporción del Hero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {heroRatios.map((ratio) => {
              const Icon = ratio.icon;
              const isSelected = heroRatio === ratio.value;
              
              return (
                <button
                  key={ratio.value}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !disabled && handleHeroRatioChange(ratio.value)}
                  title={ratio.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {/* Custom Ratio Input - Compact */}
          {showCustomRatio && (
            <div className="mt-3 flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">
                Personalizada:
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="custom-width"
                  type="number"
                  min="1"
                  value={customHeroRatio?.width || 16}
                  onChange={(e) => {
                    const width = parseInt(e.target.value) || 1;
                    onCustomHeroRatioChange({
                      width,
                      height: customHeroRatio?.height || 9,
                    });
                  }}
                  disabled={disabled}
                  className="w-16 h-8 text-sm"
                />
                <span className="text-sm">:</span>
                <Input
                  id="custom-height"
                  type="number"
                  min="1"
                  value={customHeroRatio?.height || 9}
                  onChange={(e) => {
                    const height = parseInt(e.target.value) || 1;
                    onCustomHeroRatioChange({
                      width: customHeroRatio?.width || 16,
                      height,
                    });
                  }}
                  disabled={disabled}
                  className="w-16 h-8 text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Layout Preview */}
      <LayoutPreview
        layoutTemplate={layoutTemplate}
        heroRatio={heroRatio}
        customHeroRatio={customHeroRatio}
        projectTitle={projectTitle}
        projectDescription={projectDescription}
        projectMedia={projectMedia}
        selectedHeroMedia={selectedHeroMedia}
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