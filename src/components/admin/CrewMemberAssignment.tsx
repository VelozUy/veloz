'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
import { Check, Plus, X, Users } from 'lucide-react';
import { crewMemberService } from '@/services/crew-member';
import type { CrewMember } from '@/types';

interface CrewMemberAssignmentProps {
  selectedCrewMemberIds: string[];
  onCrewMembersChange: (crewMemberIds: string[]) => void;
  disabled?: boolean;
}

export default function CrewMemberAssignment({
  selectedCrewMemberIds,
  onCrewMembersChange,
  disabled = false,
}: CrewMemberAssignmentProps) {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all crew members
  useEffect(() => {
    const loadCrewMembers = async () => {
      try {
        setLoading(true);
        const result = await crewMemberService.getAllCrewMembers();
        console.log('🔍 CrewMemberAssignment - getAll result:', result);
        if (result.success) {
          const crewData = (result.data as CrewMember[]) || [];
          console.log('🔍 CrewMemberAssignment - crew data:', crewData);
          setCrewMembers(crewData);
        } else {
          console.error('Failed to load crew members:', result.error);
        }
      } catch (error) {
        console.error('Error loading crew members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCrewMembers();
  }, []);

  // Get selected crew members
  const selectedCrewMembers = crewMembers.filter(crew =>
    selectedCrewMemberIds.includes(crew.id)
  );

  // Handle crew member selection
  const handleCrewMemberSelect = (crewMemberId: string) => {
    if (selectedCrewMemberIds.includes(crewMemberId)) {
      // Remove crew member
      onCrewMembersChange(
        selectedCrewMemberIds.filter(id => id !== crewMemberId)
      );
    } else {
      // Add crew member
      onCrewMembersChange([...selectedCrewMemberIds, crewMemberId]);
    }
  };

  // Handle crew member removal
  const handleRemoveCrewMember = (crewMemberId: string) => {
    onCrewMembersChange(
      selectedCrewMemberIds.filter(id => id !== crewMemberId)
    );
  };

  // Filter crew members based on search
  const filteredCrewMembers = crewMembers.filter(crew => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const nameMatch = Object.values(crew.name).some(name =>
      name.toLowerCase().includes(searchLower)
    );
    const roleMatch = Object.values(crew.role).some(role =>
      role.toLowerCase().includes(searchLower)
    );
    const skillMatch =
      Array.isArray(crew.skills) &&
      crew.skills.some(skill => skill.toLowerCase().includes(searchLower));

    return nameMatch || roleMatch || skillMatch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Crew Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Crew Members */}
        {selectedCrewMembers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Assigned Crew Members ({selectedCrewMembers.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedCrewMembers.map(crew => (
                <div
                  key={crew.id}
                  className="flex items-center gap-2 bg-muted rounded-none px-3 py-2"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {crew.name.es?.charAt(0) || crew.name.en?.charAt(0) || '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {crew.name.es || crew.name.en}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {crew.role.es || crew.role.en}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCrewMember(crew.id)}
                    disabled={disabled}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Crew Member Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              disabled={disabled || loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Crew Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Crew Members</DialogTitle>
              <DialogDescription>
                Choose crew members to assign to this project
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search crew members</Label>
                <Input
                  id="search"
                  placeholder="Search by name, role, or skills..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Crew Members List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredCrewMembers.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No crew members found</p>
                  </div>
                ) : (
                  filteredCrewMembers.map(crew => (
                    <div
                      key={crew.id}
                      className={`flex items-center gap-3 p-3 rounded-none border cursor-pointer transition-colors ${
                        selectedCrewMemberIds.includes(crew.id)
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleCrewMemberSelect(crew.id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {crew.name.es?.charAt(0) ||
                          crew.name.en?.charAt(0) ||
                          '?'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {crew.name.es || crew.name.en}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {crew.role.es || crew.role.en}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(crew.skills) &&
                            crew.skills.slice(0, 3).map(skill => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          {Array.isArray(crew.skills) &&
                            crew.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{crew.skills.length - 3} more
                              </Badge>
                            )}
                        </div>
                      </div>
                      {selectedCrewMemberIds.includes(crew.id) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* No Crew Members Message */}
        {selectedCrewMembers.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No crew members assigned to this project</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
