'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  portrait: string;
  bio: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
    email?: string;
  };
  skills: string[];
  order: number;
}

interface MeetTheTeamStaticProps {
  crewMembers: CrewMember[];
  language?: 'es' | 'en' | 'pt';
  className?: string;
  projectId?: string;
  enhanced?: boolean;
  onInteraction?: (
    action: 'view' | 'click' | 'social_click',
    crewMemberId?: string
  ) => void;
}

export default function MeetTheTeamStatic({
  crewMembers,
  language = 'es',
  className = '',
  projectId,
  enhanced = false,
  onInteraction,
}: MeetTheTeamStaticProps) {
  const { trackCrewInteraction } = useAnalytics();

  // Track crew section view
  useEffect(() => {
    if (crewMembers.length > 0) {
      onInteraction?.('view');
    }
  }, [crewMembers, onInteraction]);

  const handleCrewMemberClick = (member: CrewMember) => {
    onInteraction?.('click', member.id);
  };

  const handleSocialLinkClick = (member: CrewMember, platform: string) => {
    onInteraction?.('social_click', member.id);
  };

  if (crewMembers.length === 0) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n: string) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className={`py-12 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-6 h-6 text-blue-accent" />
            <h2 className="text-3xl font-bold text-charcoal">
              {language === 'en'
                ? 'Meet the Team'
                : language === 'pt'
                  ? 'Conheça a Equipe'
                  : 'Conoce al Equipo'}
            </h2>
          </div>
          <p className="text-charcoal max-w-2xl mx-auto">
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
              className="group hover:shadow-lg transition-all duration-300 bg-white border border-gray-medium"
            >
              <CardContent className="p-6">
                {/* Portrait and Basic Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    {member.portrait ? (
                      <img
                        src={member.portrait}
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-accent/20"
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
                    <h3 className="font-semibold text-lg mb-1 truncate text-charcoal">
                      {member.name}
                    </h3>
                    <p className="text-charcoal text-sm mb-2">{member.role}</p>

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
                            <Badge variant="secondary" className="text-xs">
                              +{member.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* Bio */}
                {member.bio && (
                  <p className="text-charcoal text-sm mb-4 line-clamp-3">
                    {member.bio}
                  </p>
                )}

                {/* Social Links */}
                {member.socialLinks && (
                  <div className="flex gap-2">
                    {member.socialLinks.instagram && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleSocialLinkClick(member, 'instagram')
                        }
                        className="p-2 h-8 w-8"
                      >
                        <span className="sr-only">Instagram</span>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </Button>
                    )}
                    {member.socialLinks.linkedin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleSocialLinkClick(member, 'linkedin')
                        }
                        className="p-2 h-8 w-8"
                      >
                        <span className="sr-only">LinkedIn</span>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </Button>
                    )}
                    {member.socialLinks.website && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSocialLinkClick(member, 'website')}
                        className="p-2 h-8 w-8"
                      >
                        <span className="sr-only">Website</span>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                      </Button>
                    )}
                    {member.socialLinks.email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSocialLinkClick(member, 'email')}
                        className="p-2 h-8 w-8"
                      >
                        <span className="sr-only">Email</span>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
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
