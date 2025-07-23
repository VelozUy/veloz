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
} from 'lucide-react';
import Link from 'next/link';
import type { CrewMember } from '@/types';
import CrewPortfolio from './CrewPortfolio';
import CrewWorks from './CrewWorks';

interface CrewProfileProps {
  crewMember: CrewMember;
}

export default function CrewProfile({ crewMember }: CrewProfileProps) {
  const [activeTab, setActiveTab] = useState('about');

  const getSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

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

              {/* Social Links */}
              {crewMember.socialLinks && (
                <div className="flex gap-3">
                  {crewMember.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${crewMember.socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-background/20 rounded-full hover:bg-background/30 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {crewMember.socialLinks.linkedin && (
                    <a
                      href={crewMember.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-background/20 rounded-full hover:bg-background/30 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {crewMember.socialLinks.website && (
                    <a
                      href={crewMember.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-background/20 rounded-full hover:bg-background/30 transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {crewMember.socialLinks.email && (
                    <a
                      href={`mailto:${crewMember.socialLinks.email}`}
                      className="p-2 bg-background/20 rounded-full hover:bg-background/30 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
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

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">
                  Información de Contacto
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                  {crewMember.socialLinks?.instagram && (
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-muted-foreground" />
                      <a
                        href={`https://instagram.com/${crewMember.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{crewMember.socialLinks.instagram}
                      </a>
                    </div>
                  )}
                  {crewMember.socialLinks?.linkedin && (
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-5 h-5 text-muted-foreground" />
                      <a
                        href={crewMember.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Perfil de LinkedIn
                      </a>
                    </div>
                  )}
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
