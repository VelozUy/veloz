'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Instagram,
  Linkedin,
  Globe,
  Mail,
  Camera,
  Video,
  User,
  ArrowLeft,
  Facebook,
  Twitter,
  Youtube,
  ExternalLink,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import type { CrewMember } from '@/types';
import CrewPortfolio from './CrewPortfolio';
import CrewWorks from './CrewWorks';

interface CrewProfileProps {
  crewMember: CrewMember;
}

// Social media platform configuration
const socialMediaConfig = {
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    getUrl: (username: string) => `https://instagram.com/${username}`,
    color: 'hover:text-primary',
  },
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    getUrl: (url: string) => url,
    color: 'hover:text-primary',
  },
  website: {
    icon: Globe,
    label: 'Website',
    getUrl: (url: string) => url,
    color: 'hover:text-primary',
  },
  email: {
    icon: Mail,
    label: 'Email',
    getUrl: (email: string) => `mailto:${email}`,
    color: 'hover:text-primary',
  },
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    getUrl: (url: string) => url,
    color: 'hover:text-primary',
  },
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    getUrl: (url: string) => url,
    color: 'hover:text-primary',
  },
  youtube: {
    icon: Youtube,
    label: 'YouTube',
    getUrl: (url: string) => url,
    color: 'hover:text-primary',
  },
  vimeo: {
    icon: Video,
    label: 'Vimeo',
    getUrl: (url: string) => url,
    color: 'hover:text-primary',
  },
  behance: {
    icon: ExternalLink,
    label: 'Behance',
    getUrl: (url: string) => url,
    color: 'hover:text-primary',
  },
  dribbble: {
    icon: Share2,
    label: 'Dribbble',
    getUrl: (url: string) => url,
    color: 'hover:text-primary',
  },
  pinterest: {
    icon: Share2,
    label: 'Pinterest',
    getUrl: (url: string) => url,
    color: 'hover:text-primary',
  },
  tiktok: {
    icon: Video,
    label: 'TikTok',
    getUrl: (url: string) => url,
    color: 'hover:text-foreground',
  },
};

export default function CrewProfile({ crewMember }: CrewProfileProps) {
  const [activeTab, setActiveTab] = useState('about');

  const getSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Get available social media links
  const availableSocialLinks = crewMember.socialLinks
    ? Object.entries(crewMember.socialLinks)
        .filter(([_, value]) => value && value.trim() !== '')
        .map(([platform, value]) => ({
          platform,
          value: value!,
          config: socialMediaConfig[platform as keyof typeof socialMediaConfig],
        }))
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/crew">
              <Button
                variant="ghost"
                size="sm"
                className="text-background hover:text-background/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Equipo
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Portrait */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {crewMember.portrait ? (
                  <Image
                    src={crewMember.portrait}
                    alt={crewMember.name.es || 'Crew Member'}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-24 h-24 text-primary" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {crewMember.name.es}
              </h1>
              <p className="text-xl md:text-2xl text-background/80 mb-4">
                {crewMember.role.es}
              </p>

              {/* Skills */}
              {crewMember.skills && crewMember.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {crewMember.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-background/20 text-background"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Enhanced Social Links */}
              {availableSocialLinks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-background/90">
                    Sígueme en redes sociales
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {availableSocialLinks.map(({ platform, value, config }) => {
                      const IconComponent = config.icon;
                      return (
                        <a
                          key={platform}
                          href={config.getUrl(value)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-3 bg-background/20 rounded-full hover:bg-background/30 transition-all duration-200 ${config.color} group`}
                          title={`${config.label}: ${value}`}
                        >
                          <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">Sobre Mí</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="works">Trabajos Recientes</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">Biografía</h2>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {crewMember.bio.es || 'Biografía no disponible.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Skills and Specialties */}
            {crewMember.skills && crewMember.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">Especialidades</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {crewMember.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Contact Information */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">
                  Información de Contacto
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Email */}
                  {crewMember.socialLinks?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <a
                        href={`mailto:${crewMember.socialLinks.email}`}
                        className="text-primary hover:underline"
                      >
                        {crewMember.socialLinks.email}
                      </a>
                    </div>
                  )}

                  {/* Website */}
                  {crewMember.socialLinks?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <a
                        href={crewMember.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Sitio Web
                      </a>
                    </div>
                  )}

                  {/* Social Media Links */}
                  {availableSocialLinks.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">
                        Redes Sociales
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableSocialLinks
                          .filter(
                            ({ platform }) =>
                              platform !== 'email' && platform !== 'website'
                          )
                          .map(({ platform, value, config }) => (
                            <div
                              key={platform}
                              className="flex items-center gap-3"
                            >
                              <config.icon className="w-4 h-4 text-muted-foreground" />
                              <a
                                href={config.getUrl(value)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                {config.label}
                              </a>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <CrewPortfolio crewMember={crewMember} />
          </TabsContent>

          <TabsContent value="works">
            <CrewWorks crewMember={crewMember} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
