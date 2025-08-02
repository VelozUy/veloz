'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { crewMemberService } from '@/services/crew-member';
import type { CrewMember } from '@/types';

interface CrewMemberDisplayProps {
  crewMemberIds: string[];
  maxDisplay?: number;
  showCount?: boolean;
}

export default function CrewMemberDisplay({
  crewMemberIds,
  maxDisplay = 3,
  showCount = true,
}: CrewMemberDisplayProps) {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  // const [loading, setLoading] = useState(false);

  // Load crew member details
  useEffect(() => {
    const loadCrewMembers = async () => {
      if (crewMemberIds.length === 0) return;

      try {
        // setLoading(true);
        const result = await crewMemberService.getAllCrewMembers();
        if (result.success) {
          const allCrewMembers = (result.data as CrewMember[]) || [];
          const projectCrewMembers = allCrewMembers.filter(crew =>
            crewMemberIds.includes(crew.id)
          );
          setCrewMembers(projectCrewMembers);
        }
      } catch (error) {
      } finally {
        // setLoading(false);
      }
    };

    loadCrewMembers();
  }, [crewMemberIds]);

  if (crewMemberIds.length === 0) {
    return null;
  }

  const displayedCrewMembers = crewMembers.slice(0, maxDisplay);
  const remainingCount = crewMembers.length - maxDisplay;

  return (
    <div className="flex items-center gap-1">
      <Users className="w-3 h-3 text-muted-foreground" />
      {showCount && (
        <Badge variant="outline" className="text-xs">
          {crewMembers.length}
        </Badge>
      )}
      <div className="flex items-center gap-1">
        {displayedCrewMembers.map(crew => (
          <Badge key={crew.id} variant="secondary" className="text-xs">
            {crew.name.es || crew.name.en}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount}
          </Badge>
        )}
      </div>
    </div>
  );
}
