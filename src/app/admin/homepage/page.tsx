'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Save,
  Upload,
  Eye,
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon,
  Type,
  Link,
  Palette,
  Globe,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import Image from 'next/image';

interface HomepageContent {
  id: string;
  headline: {
    en: string;
    es: string;
    he: string;
  };
  subheadline: {
    en: string;
    es: string;
    he: string;
  };
  ctaButtons: {
    primary: {
      text: {
        en: string;
        es: string;
        he: string;
      };
      link: string;
      enabled: boolean;
    };
    secondary: {
      text: {
        en: string;
        es: string;
        he: string;
      };
      link: string;
      enabled: boolean;
    };
  };
  backgroundVideo: {
    url: string;
    enabled: boolean;
    filename: string;
  };
  backgroundImages: {
    urls: string[];
    enabled: boolean;
    filenames: string[];
  };
  logo: {
    url: string;
    enabled: boolean;
    filename: string;
  };
  theme: {
    overlayOpacity: number;
    gradientColors: string[];
  };
  updatedAt: { toDate: () => Date } | null;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'he', name: 'Hebrew' },
];

const DEFAULT_CONTENT: Omit<HomepageContent, 'id' | 'updatedAt'> = {
  headline: {
    en: 'Capturing the Unrepeatable',
    es: 'Capturamos lo irrepetible',
    he: 'לוכדים את מה שלא ניתן לחזור עליו',
  },
  subheadline: {
    en: 'Professional photography and videography for your most precious moments',
    es: 'Fotografía y videografía profesional para tus momentos más preciados',
    he: 'צילום ווידאו מקצועיים לרגעים היקרים ביותר שלכם',
  },
  ctaButtons: {
    primary: {
      text: {
        en: 'About Us',
        es: 'Sobre Nosotros',
        he: 'אודותינו',
      },
      link: '/about',
      enabled: true,
    },
    secondary: {
      text: {
        en: 'Our Work',
        es: 'Nuestro Trabajo',
        he: 'העבודות שלנו',
      },
      link: '/gallery',
      enabled: true,
    },
  },
  backgroundVideo: {
    url: '',
    enabled: false,
    filename: '',
  },
  backgroundImages: {
    urls: [],
    enabled: false,
    filenames: [],
  },
  logo: {
    url: '',
    enabled: false,
    filename: '',
  },
  theme: {
    overlayOpacity: 20,
    gradientColors: ['#000000', '#1a1a1a', '#000000'],
  },
};

export default function HomepageAdminPage() {
  const { user } = useAuth();
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadContent = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'homepage', 'content');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContent({ id: docSnap.id, ...docSnap.data() } as HomepageContent);
        } else {
          // Create default content
          const defaultWithId = {
            ...DEFAULT_CONTENT,
            id: 'content',
            updatedAt: null,
          };
          setContent(defaultWithId);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading homepage content:', error);
        setError('Failed to load homepage content');
        setLoading(false);
      }
    };

    loadContent();
  }, [user]);

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    setError('');

    try {
      const docRef = doc(db, 'homepage', 'content');
      const { id: _id, ...contentData } = content;

      await setDoc(docRef, {
        ...contentData,
        updatedAt: serverTimestamp(),
      });

      setSuccess('Homepage content saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving homepage content:', error);
      setError('Failed to save homepage content');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    type: 'logo' | 'video' | 'image'
  ) => {
    if (!content) return;

    setUploading(true);
    setError('');

    try {
      // Validate file
      const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for images
      if (file.size > maxSize) {
        throw new Error(
          `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
        );
      }

      if (type === 'video' && !file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file');
      }

      if (type !== 'video' && !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Upload to Firebase Storage
      const filename = `homepage/${type}s/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update content
      const updatedContent = { ...content };

      if (type === 'logo') {
        // Delete old logo if exists
        if (updatedContent.logo.url) {
          try {
            const oldRef = ref(storage, updatedContent.logo.filename);
            await deleteObject(oldRef);
          } catch (error) {
            console.warn('Could not delete old logo:', error);
          }
        }
        updatedContent.logo = {
          url: downloadURL,
          enabled: true,
          filename,
        };
      } else if (type === 'video') {
        // Delete old video if exists
        if (updatedContent.backgroundVideo.url) {
          try {
            const oldRef = ref(
              storage,
              updatedContent.backgroundVideo.filename
            );
            await deleteObject(oldRef);
          } catch (error) {
            console.warn('Could not delete old video:', error);
          }
        }
        updatedContent.backgroundVideo = {
          url: downloadURL,
          enabled: true,
          filename,
        };
      } else if (type === 'image') {
        // Add to background images
        updatedContent.backgroundImages.urls.push(downloadURL);
        updatedContent.backgroundImages.filenames.push(filename);
        updatedContent.backgroundImages.enabled = true;
      }

      setContent(updatedContent);
      setSuccess(
        `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`
      );
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to upload file'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBackgroundImage = async (index: number) => {
    if (!content) return;

    try {
      const imageToDelete = content.backgroundImages.filenames[index];

      // Delete from storage
      if (imageToDelete) {
        try {
          const storageRef = ref(storage, imageToDelete);
          await deleteObject(storageRef);
        } catch (error) {
          console.warn('Could not delete image from storage:', error);
        }
      }

      // Update content
      const updatedContent = { ...content };
      updatedContent.backgroundImages.urls.splice(index, 1);
      updatedContent.backgroundImages.filenames.splice(index, 1);

      if (updatedContent.backgroundImages.urls.length === 0) {
        updatedContent.backgroundImages.enabled = false;
      }

      setContent(updatedContent);
      setSuccess('Background image deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting background image:', error);
      setError('Failed to delete background image');
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      window.open('/', '_blank');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Homepage Management">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!content) {
    return (
      <AdminLayout title="Homepage Management">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Content Not Found
          </h2>
          <p className="text-muted-foreground">
            Failed to load homepage content.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Homepage Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Homepage Management
            </h1>
            <p className="text-muted-foreground">
              Manage your homepage hero section content and media
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={togglePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Site
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Language Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Language Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Label>Editing Language:</Label>
              <Select
                value={currentLanguage}
                onValueChange={setCurrentLanguage}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Content */}
          <div className="space-y-6">
            {/* Headlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  Headlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">
                    Main Headline (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                  </Label>
                  <Input
                    id="headline"
                    value={
                      content.headline[
                        currentLanguage as keyof typeof content.headline
                      ]
                    }
                    onChange={e =>
                      setContent(prev =>
                        prev
                          ? {
                              ...prev,
                              headline: {
                                ...prev.headline,
                                [currentLanguage]: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="Enter main headline..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subheadline">
                    Subheadline (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                  </Label>
                  <Textarea
                    id="subheadline"
                    value={
                      content.subheadline[
                        currentLanguage as keyof typeof content.subheadline
                      ]
                    }
                    onChange={e =>
                      setContent(prev =>
                        prev
                          ? {
                              ...prev,
                              subheadline: {
                                ...prev.subheadline,
                                [currentLanguage]: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="Enter subheadline..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Link className="w-5 h-5 mr-2" />
                  Call-to-Action Buttons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary CTA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Primary Button
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="primary-enabled"
                        checked={content.ctaButtons.primary.enabled}
                        onChange={e =>
                          setContent(prev =>
                            prev
                              ? {
                                  ...prev,
                                  ctaButtons: {
                                    ...prev.ctaButtons,
                                    primary: {
                                      ...prev.ctaButtons.primary,
                                      enabled: e.target.checked,
                                    },
                                  },
                                }
                              : prev
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="primary-enabled" className="text-sm">
                        Enabled
                      </Label>
                    </div>
                  </div>
                  <Input
                    value={
                      content.ctaButtons.primary.text[
                        currentLanguage as keyof typeof content.ctaButtons.primary.text
                      ]
                    }
                    onChange={e =>
                      setContent(prev =>
                        prev
                          ? {
                              ...prev,
                              ctaButtons: {
                                ...prev.ctaButtons,
                                primary: {
                                  ...prev.ctaButtons.primary,
                                  text: {
                                    ...prev.ctaButtons.primary.text,
                                    [currentLanguage]: e.target.value,
                                  },
                                },
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="Button text..."
                  />
                  <Input
                    value={content.ctaButtons.primary.link}
                    onChange={e =>
                      setContent(prev =>
                        prev
                          ? {
                              ...prev,
                              ctaButtons: {
                                ...prev.ctaButtons,
                                primary: {
                                  ...prev.ctaButtons.primary,
                                  link: e.target.value,
                                },
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="/about"
                  />
                </div>

                {/* Secondary CTA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Secondary Button
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="secondary-enabled"
                        checked={content.ctaButtons.secondary.enabled}
                        onChange={e =>
                          setContent(prev =>
                            prev
                              ? {
                                  ...prev,
                                  ctaButtons: {
                                    ...prev.ctaButtons,
                                    secondary: {
                                      ...prev.ctaButtons.secondary,
                                      enabled: e.target.checked,
                                    },
                                  },
                                }
                              : prev
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="secondary-enabled" className="text-sm">
                        Enabled
                      </Label>
                    </div>
                  </div>
                  <Input
                    value={
                      content.ctaButtons.secondary.text[
                        currentLanguage as keyof typeof content.ctaButtons.secondary.text
                      ]
                    }
                    onChange={e =>
                      setContent(prev =>
                        prev
                          ? {
                              ...prev,
                              ctaButtons: {
                                ...prev.ctaButtons,
                                secondary: {
                                  ...prev.ctaButtons.secondary,
                                  text: {
                                    ...prev.ctaButtons.secondary.text,
                                    [currentLanguage]: e.target.value,
                                  },
                                },
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="Button text..."
                  />
                  <Input
                    value={content.ctaButtons.secondary.link}
                    onChange={e =>
                      setContent(prev =>
                        prev
                          ? {
                              ...prev,
                              ctaButtons: {
                                ...prev.ctaButtons,
                                secondary: {
                                  ...prev.ctaButtons.secondary,
                                  link: e.target.value,
                                },
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="/gallery"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Media Content */}
          <div className="space-y-6">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Logo
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="logo-enabled"
                      checked={content.logo.enabled}
                      onChange={e =>
                        setContent(prev =>
                          prev
                            ? {
                                ...prev,
                                logo: {
                                  ...prev.logo,
                                  enabled: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="logo-enabled" className="text-sm">
                      Enabled
                    </Label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {content.logo.url ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={content.logo.url}
                        alt="Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'logo');
                        }}
                        className="hidden"
                        id="logo-upload"
                        disabled={uploading}
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById('logo-upload')?.click()
                        }
                        disabled={uploading}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Replace
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No logo uploaded
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                      className="hidden"
                      id="logo-upload"
                      disabled={uploading}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById('logo-upload')?.click()
                      }
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Background Video */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <VideoIcon className="w-5 h-5 mr-2" />
                    Background Video
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="video-enabled"
                      checked={content.backgroundVideo.enabled}
                      onChange={e =>
                        setContent(prev =>
                          prev
                            ? {
                                ...prev,
                                backgroundVideo: {
                                  ...prev.backgroundVideo,
                                  enabled: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="video-enabled" className="text-sm">
                      Enabled
                    </Label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {content.backgroundVideo.url ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <video
                        src={content.backgroundVideo.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        controls
                      />
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'video');
                        }}
                        className="hidden"
                        id="video-upload"
                        disabled={uploading}
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById('video-upload')?.click()
                        }
                        disabled={uploading}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Replace
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <VideoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No background video uploaded
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'video');
                      }}
                      className="hidden"
                      id="video-upload"
                      disabled={uploading}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById('video-upload')?.click()
                      }
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Video
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Background Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Background Images ({content.backgroundImages.urls.length})
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="images-enabled"
                      checked={content.backgroundImages.enabled}
                      onChange={e =>
                        setContent(prev =>
                          prev
                            ? {
                                ...prev,
                                backgroundImages: {
                                  ...prev.backgroundImages,
                                  enabled: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="images-enabled" className="text-sm">
                      Enabled
                    </Label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {content.backgroundImages.urls.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {content.backgroundImages.urls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                            <Image
                              src={url}
                              alt={`Background ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteBackgroundImage(index)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleFileUpload(file, 'image'));
                      }}
                      className="hidden"
                      id="images-upload"
                      disabled={uploading}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById('images-upload')?.click()
                      }
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add More Images
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No background images uploaded
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleFileUpload(file, 'image'));
                      }}
                      className="hidden"
                      id="images-upload"
                      disabled={uploading}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById('images-upload')?.click()
                      }
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Images
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Theme Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="overlay-opacity">
                Overlay Opacity ({content.theme.overlayOpacity}%)
              </Label>
              <input
                type="range"
                id="overlay-opacity"
                min="0"
                max="80"
                value={content.theme.overlayOpacity}
                onChange={e =>
                  setContent(prev =>
                    prev
                      ? {
                          ...prev,
                          theme: {
                            ...prev.theme,
                            overlayOpacity: parseInt(e.target.value),
                          },
                        }
                      : prev
                  )
                }
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Controls the darkness of the overlay for text readability
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        {content.updatedAt && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Last updated: {content.updatedAt.toDate().toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
