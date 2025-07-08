'use client';

import { MediaBlock } from '@/types';
import VisualGridEditor from './VisualGridEditor';
import { ProjectMedia } from '@/services/firebase';

interface LayoutTemplateSelectorProps {
  projectMedia: ProjectMedia[];
  mediaBlocks?: MediaBlock[];
  onMediaBlocksChange: (
    blocks: MediaBlock[],
    gridConfig?: { width: number; height: number }
  ) => void;
  disabled?: boolean;
  projectName?: string;
  expandable?: boolean;
  initialGridConfig?: { width: number; height: number };
}

export default function LayoutTemplateSelector({
  projectMedia,
  mediaBlocks = [],
  onMediaBlocksChange,
  disabled,
  projectName,
  expandable = false,
  initialGridConfig,
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
        onMediaBlocksChange={(blocks, gridConfig) => {
          console.log(
            '🔍 LayoutTemplateSelector - onMediaBlocksChange called:',
            {
              blocksCount: blocks.length,
              gridConfig,
              gridHeight: gridConfig?.height,
              gridWidth: gridConfig?.width,
            }
          );
          onMediaBlocksChange(blocks, gridConfig);
        }}
        disabled={disabled}
        projectName={projectName}
        expandable={expandable}
        initialGridConfig={initialGridConfig}
      />
    </div>
  );
}
