'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Instagram, Linkedin, Globe, Mail } from 'lucide-react';
import { crewMemberService } from '@/services/crew-member';
import type { CrewMember, LocalizedContent } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';
import Image from 'next/image';

interface MeetTheTeamProps {
  crewMemberIds: string[];
  language?: 'es' | 'en' | 'pt';
  className?: string;
  projectId?: string; // Add projectId for analytics tracking
}

export default function MeetTheTeam({
  crewMemberIds,
  language = 'es',
  className = '',
  projectId,
}: MeetTheTeamProps) {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { trackCrewInteraction } = useAnalytics();

  // Load crew member details
  useEffect(() => {
    const loadCrewMembers = async () => {
      if (crewMemberIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await crewMemberService.getAllCrewMembers();
        if (result.success) {
          const allCrewMembers = (result.data as CrewMember[]) || [];
          const projectCrewMembers = allCrewMembers
            .filter(crew => crewMemberIds.includes(crew.id))
            .sort((a, b) => a.order - b.order); // Sort by order
          setCrewMembers(projectCrewMembers);
        }
      } catch (error) {
        console.error('Error loading crew members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCrewMembers();
  }, [crewMemberIds]);

  // Track crew section view
  useEffect(() => {
    if (crewMembers.length > 0 && projectId) {
      crewMembers.forEach(member => {
        trackCrewInteraction({
          projectId,
          crewMemberId: member.id,
          crewMemberName: getLocalizedText(member.name, language),
          interactionType: 'view',
          crewMemberRole: getLocalizedText(member.role, language),
        });
      });
    }
  }, [crewMembers, projectId, language, trackCrewInteraction]);

  const handleCrewMemberClick = (member: CrewMember) => {
    if (projectId) {
      trackCrewInteraction({
        projectId,
        crewMemberId: member.id,
        crewMemberName: getLocalizedText(member.name, language),
        interactionType: 'click',
        crewMemberRole: getLocalizedText(member.role, language),
      });
    }
  };

  const handleSocialLinkClick = (member: CrewMember, platform: string) => {
    if (projectId) {
      trackCrewInteraction({
        projectId,
        crewMemberId: member.id,
        crewMemberName: getLocalizedText(member.name, language),
        interactionType: 'contact',
        crewMemberRole: getLocalizedText(member.role, language),
      });
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-5 h-5 animate-pulse" />
          <span>Cargando equipo...</span>
        </div>
      </div>
    );
  }

  if (crewMembers.length === 0) {
    return null;
  }

  const getLocalizedText = (
    content: LocalizedContent | undefined,
    lang: string
  ) => {
    return (
      content?.[lang as keyof LocalizedContent] ||
      content?.es ||
      content?.en ||
      ''
    );
  };

  const getInitials = (name: LocalizedContent | undefined) => {
    const fullName = getLocalizedText(name, language);
    return fullName
      .split(' ')
      .map((n: string) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className={`py-12 bg-muted/30 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">
              {language === 'en'
                ? 'Meet the Team'
                : language === 'pt'
                  ? 'Conheça a Equipe'
                  : 'Conoce al Equipo'}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'The talented professionals behind this project'
              : language === 'pt'
                ? 'Os talentosos profissionais por trás deste projeto'
                : 'Los talentosos profesionales detrás de este proyecto'}
          </p>
        </div>

        {/* Crew Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crewMembers.map(member => (
            <Card
              key={member.id}
              className="group hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Portrait and Basic Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    {member.portrait ? (
                      <Image
                        src={member.portrait}
                        alt={getLocalizedText(member.name, language)}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <Avatar className="w-20 h-20">
                        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {getLocalizedText(member.name, language)}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {getLocalizedText(member.role, language)}
                    </p>

                    {/* Skills */}
                    {Array.isArray(member.skills) &&
                      member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {member.skills.slice(0, 3).map(skill => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* Bio */}
                {getLocalizedText(member.bio, language) && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {getLocalizedText(member.bio, language)}
                  </p>
                )}

                {/* Social Links */}
                {member.socialLinks && (
                  <div className="flex items-center gap-2">
                    {member.socialLinks.instagram && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <a
                          href={member.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      </Button>
                    )}

                    {member.socialLinks.linkedin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      </Button>
                    )}

                    {member.socialLinks.website && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <a
                          href={member.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      </Button>
                    )}

                    {member.socialLinks.email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <a
                          href={`mailto:${member.socialLinks.email}`}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
