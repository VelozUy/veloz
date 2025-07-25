'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Instagram,
  Linkedin,
  Globe,
  Mail,
  Facebook,
  Twitter,
  Youtube,
  ExternalLink,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import type { CrewMember } from '@/types';

interface CrewListingProps {
  crewMembers: CrewMember[];
}

// Social media platform configuration
const socialMediaConfig = {
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    color: 'text-primary',
  },
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    color: 'text-primary',
  },
  website: {
    icon: Globe,
    label: 'Website',
    color: 'text-primary',
  },
  email: {
    icon: Mail,
    label: 'Email',
    color: 'text-primary',
  },
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    color: 'text-primary',
  },
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    color: 'text-primary',
  },
  youtube: {
    icon: Youtube,
    label: 'YouTube',
    color: 'text-primary',
  },
  vimeo: {
    icon: ExternalLink,
    label: 'Vimeo',
    color: 'text-primary',
  },
  behance: {
    icon: ExternalLink,
    label: 'Behance',
    color: 'text-primary',
  },
  dribbble: {
    icon: Share2,
    label: 'Dribbble',
    color: 'text-primary',
  },
  pinterest: {
    icon: Share2,
    label: 'Pinterest',
    color: 'text-primary',
  },
  tiktok: {
    icon: ExternalLink,
    label: 'TikTok',
    color: 'text-foreground',
  },
};

export default function CrewListing({ crewMembers }: CrewListingProps) {
  const getSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Get available social media links for a crew member
  const getAvailableSocialLinks = (member: CrewMember) => {
    if (!member.socialLinks) return [];

    return Object.entries(member.socialLinks)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([platform, value]) => ({
        platform,
        value: value!,
        config: socialMediaConfig[platform as keyof typeof socialMediaConfig],
      }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestro Equipo
            </h1>
            <p className="text-xl text-background/80 max-w-2xl mx-auto">
              Conoce a nuestro equipo de fotógrafos y videógrafos profesionales.
              Cada miembro tiene su estilo único y especialidades.
            </p>
          </div>
        </div>
      </div>

      {/* Crew Members Grid */}
      <div className="container mx-auto px-4 py-8">
        {crewMembers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No hay miembros del equipo disponibles
            </h3>
            <p className="text-muted-foreground">
              No hay miembros del equipo para mostrar en este momento.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {crewMembers.map(member => {
              const availableSocialLinks = getAvailableSocialLinks(member);

              return (
                <Link
                  key={member.id}
                  href={`/crew/${getSlugFromName(member.name.es || '')}`}
                  className="block"
                >
                  <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                            {member.portrait ? (
                              <Image
                                src={member.portrait}
                                alt={member.name.es || 'Crew Member'}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {member.name.es}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {member.role.es}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Bio Preview */}
                      {member.bio.es && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {member.bio.es}
                        </p>
                      )}

                      {/* Skills */}
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3} más
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Enhanced Social Links */}
                      {availableSocialLinks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">
                            Redes Sociales
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {availableSocialLinks
                              .slice(0, 4)
                              .map(({ platform, config }) => {
                                const IconComponent = config.icon;
                                return (
                                  <div
                                    key={platform}
                                    className={`p-1 rounded-full ${config.color} bg-muted/50`}
                                    title={config.label}
                                  >
                                    <IconComponent className="w-3 h-3" />
                                  </div>
                                );
                              })}
                            {availableSocialLinks.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{availableSocialLinks.length - 4} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
