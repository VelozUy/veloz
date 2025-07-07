'use client';

import { MediaBlock } from '@/types';
import VisualGridEditor from './VisualGridEditor';
import { ProjectMedia } from '@/services/firebase';

interface LayoutTemplateSelectorProps {
  projectMedia: ProjectMedia[];
  mediaBlocks?: MediaBlock[];
  onMediaBlocksChange: (blocks: MediaBlock[]) => void;
  disabled?: boolean;
  projectName?: string;
  expandable?: boolean;
}

export default function LayoutTemplateSelector({
  projectMedia,
  mediaBlocks = [],
  onMediaBlocksChange,
  disabled,
  projectName,
  expandable = false,
}: LayoutTemplateSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Editor de Diseño Visual
        </h3>
        <p className="text-sm text-muted-foreground">
          Arrastra y redimensiona bloques de media para crear el diseño perfecto
          de tu proyecto
        </p>
      </div>

      <VisualGridEditor
        projectMedia={projectMedia}
        mediaBlocks={mediaBlocks}
        onMediaBlocksChange={onMediaBlocksChange}
        disabled={disabled}
        projectName={projectName}
        expandable={expandable}
      />
    </div>
  );
}
