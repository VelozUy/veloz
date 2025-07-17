'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Instagram, Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { SocialPostService } from '@/services/social-post';
import type { SocialPost } from '@/types';

interface SocialFeedProps {
  projectId: string;
  language?: 'es' | 'en' | 'pt';
  className?: string;
}

export default function SocialFeed({
  projectId,
  language = 'es',
  className,
}: SocialFeedProps) {
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSocialPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const socialPostService = new SocialPostService();
      const result = await socialPostService.getByProjectId(projectId);
      if (result.success) {
        setSocialPosts(result.data || []);
      } else {
        setError(result.error || 'Error loading social posts');
      }
    } catch (error) {
      console.error('Error loading social posts:', error);
      setError('Error loading social posts');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadSocialPosts();
  }, [loadSocialPosts]);

  const getCaption = (post: SocialPost) => {
    return post.caption?.[language] || post.caption?.es || '';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(
      language === 'en' ? 'en-US' : language === 'pt' ? 'pt-BR' : 'es-ES',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    ).format(date);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando feed social...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (socialPosts.length === 0) {
    return null; // Don't show anything if no social posts
  }

  return (
    <section className={`py-12 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Instagram className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl font-bold">
            {language === 'en'
              ? 'Behind the Scenes'
              : language === 'pt'
                ? 'Nos Bastidores'
                : 'Detrás de Escenas'}
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {language === 'en'
            ? 'Follow along as we capture your special moments'
            : language === 'pt'
              ? 'Acompanhe enquanto capturamos seus momentos especiais'
              : 'Síguenos mientras capturamos tus momentos especiales'}
        </p>
      </div>

      {/* Social Posts Grid */}
      <div className="max-w-2xl mx-auto space-y-6">
        {socialPosts.map(post => (
          <Card key={post.id} className="overflow-hidden">
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4 border-b">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {language === 'en'
                    ? 'Veloz Studio'
                    : language === 'pt'
                      ? 'Estúdio Veloz'
                      : 'Estudio Veloz'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.createdAt)}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {post.type === 'image'
                  ? language === 'en'
                    ? 'Photo'
                    : language === 'pt'
                      ? 'Foto'
                      : 'Foto'
                  : language === 'en'
                    ? 'Video'
                    : language === 'pt'
                      ? 'Vídeo'
                      : 'Video'}
              </Badge>
            </div>

            {/* Post Media */}
            <div className="relative aspect-square">
              {post.type === 'image' ? (
                <Image
                  src={post.url}
                  alt={getCaption(post)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={post.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    controls
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-4 p-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                <span className="text-sm">0</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">0</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 ml-auto"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Post Caption */}
            {getCaption(post) && (
              <div className="px-4 pb-4">
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold mr-2">
                    {language === 'en'
                      ? 'Veloz Studio'
                      : language === 'pt'
                        ? 'Estúdio Veloz'
                        : 'Estudio Veloz'}
                  </span>
                  {getCaption(post)}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          {language === 'en'
            ? 'Want to see more behind-the-scenes content?'
            : language === 'pt'
              ? 'Quer ver mais conteúdo dos bastidores?'
              : '¿Quieres ver más contenido detrás de escenas?'}
        </p>
        <Button variant="outline" className="gap-2">
          <Instagram className="w-4 h-4" />
          {language === 'en'
            ? 'Follow Us'
            : language === 'pt'
              ? 'Siga-nos'
              : 'Síguenos'}
        </Button>
      </div>
    </section>
  );
}
