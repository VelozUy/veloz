'use client';

import { BentoGrid, BentoItem } from '@/components/ui/bento-grid';
import Image from 'next/image';

interface ProjectMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  aspectRatio?: '1:1' | '16:9' | '9:16';
}

interface ExpandableProjectGridProps {
  media: ProjectMedia[];
  projectTitle: string;
}

export default function ExpandableProjectGrid({
  media,
  projectTitle,
}: ExpandableProjectGridProps) {
  return (
    <BentoGrid
      className="max-w-7xl mx-auto"
      expandable={true}
      onExpand={rows => {
        console.log(`Grid expanded to ${rows} additional rows`);
      }}
    >
      {media.map((item, index) => (
        <BentoItem
          key={item.id || index}
          size="medium"
          aspectRatio={item.aspectRatio || '16:9'}
          index={index}
        >
          <div className="relative w-full h-full overflow-hidden rounded-none">
            {item.type === 'video' ? (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
                preload={index < 4 ? 'auto' : 'metadata'}
              />
            ) : (
              <Image
                src={item.url}
                alt={projectTitle}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index < 4}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        </BentoItem>
      ))}
    </BentoGrid>
  );
}
