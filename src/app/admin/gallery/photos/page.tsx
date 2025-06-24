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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Calendar,
  MapPin,
} from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import Image from 'next/image';

interface Photo {
  id: string;
  title: string;
  description: string;
  eventType: string;
  location: string;
  eventDate: string;
  imageUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  featured: boolean;
  createdAt: { toDate: () => Date } | null;
  updatedAt: { toDate: () => Date } | null;
}

const EVENT_TYPES = [
  'Wedding',
  'Corporate Event',
  'Birthday Party',
  'Anniversary',
  'Bar/Bat Mitzvah',
  'Graduation',
  'Baby Shower',
  'Engagement',
  'Other',
];

export default function PhotoGalleryPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editPhoto, setEditPhoto] = useState<Photo | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterEventType, setFilterEventType] = useState('all');

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    eventType: '',
    location: '',
    eventDate: '',
    tags: '',
    featured: false,
    file: null as File | null,
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(collection(db, 'photos'), orderBy('createdAt', 'desc')),
      snapshot => {
        const photoList: Photo[] = [];
        snapshot.forEach(doc => {
          photoList.push({ id: doc.id, ...doc.data() } as Photo);
        });
        setPhotos(photoList);
        setLoading(false);
      },
      error => {
        console.error('Error fetching photos:', error);
        setError('Failed to load photos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setUploadForm(prev => ({ ...prev, file }));
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !user) return;

    setUploadLoading(true);
    setError('');

    try {
      // Upload image to Firebase Storage
      const fileRef = ref(
        storage,
        `photos/${Date.now()}-${uploadForm.file.name}`
      );
      const snapshot = await uploadBytes(fileRef, uploadForm.file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Save photo metadata to Firestore
      await addDoc(collection(db, 'photos'), {
        title: uploadForm.title,
        description: uploadForm.description,
        eventType: uploadForm.eventType,
        location: uploadForm.location,
        eventDate: uploadForm.eventDate,
        imageUrl,
        tags: uploadForm.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        featured: uploadForm.featured,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess('Photo uploaded successfully!');
      setUploadForm({
        title: '',
        description: '',
        eventType: '',
        location: '',
        eventDate: '',
        tags: '',
        featured: false,
        file: null,
      });

      // Reset file input
      const fileInput = document.getElementById(
        'photo-upload'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => {
        setUploadDialogOpen(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPhoto) return;

    try {
      await updateDoc(doc(db, 'photos', editPhoto.id), {
        title: editPhoto.title,
        description: editPhoto.description,
        eventType: editPhoto.eventType,
        location: editPhoto.location,
        eventDate: editPhoto.eventDate,
        tags: editPhoto.tags,
        featured: editPhoto.featured,
        updatedAt: serverTimestamp(),
      });

      setSuccess('Photo updated successfully!');
      setTimeout(() => {
        setEditDialogOpen(false);
        setEditPhoto(null);
        setSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Error updating photo:', error);
      setError('Failed to update photo');
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (
      !confirm(
        `Are you sure you want to delete "${photo.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'photos', photo.id));

      // Delete from Storage
      const imageRef = ref(storage, photo.imageUrl);
      await deleteObject(imageRef);

      setSuccess('Photo deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError('Failed to delete photo');
    }
  };

  const filteredPhotos =
    filterEventType === 'all'
      ? photos
      : photos.filter(photo => photo.eventType === filterEventType);

  if (loading) {
    return (
      <AdminLayout title="Photo Gallery">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Photo Gallery">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Photo Gallery
            </h1>
            <p className="text-muted-foreground">
              Manage your event photography portfolio
            </p>
          </div>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Photo</DialogTitle>
                <DialogDescription>
                  Add a new photo to your gallery with details and metadata.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleUpload} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="photo-upload">Photo File *</Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadLoading}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Max file size: 10MB. Supported formats: JPG, PNG, WebP
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={e =>
                      setUploadForm(prev => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Beautiful Wedding Ceremony"
                    disabled={uploadLoading}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={e =>
                      setUploadForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe this photo..."
                    disabled={uploadLoading}
                    rows={3}
                  />
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select
                    value={uploadForm.eventType}
                    onValueChange={value =>
                      setUploadForm(prev => ({ ...prev, eventType: value }))
                    }
                    disabled={uploadLoading}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={uploadForm.location}
                      onChange={e =>
                        setUploadForm(prev => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="New York, NY"
                      disabled={uploadLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={uploadForm.eventDate}
                      onChange={e =>
                        setUploadForm(prev => ({
                          ...prev,
                          eventDate: e.target.value,
                        }))
                      }
                      disabled={uploadLoading}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={uploadForm.tags}
                    onChange={e =>
                      setUploadForm(prev => ({ ...prev, tags: e.target.value }))
                    }
                    placeholder="outdoor, ceremony, bride, groom"
                    disabled={uploadLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>

                {/* Featured */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={uploadForm.featured}
                    onChange={e =>
                      setUploadForm(prev => ({
                        ...prev,
                        featured: e.target.checked,
                      }))
                    }
                    disabled={uploadLoading}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="featured">Featured Photo</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={uploadLoading || !uploadForm.file}
                  >
                    {uploadLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                    disabled={uploadLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{photos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Featured Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {photos.filter(p => p.featured).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(photos.map(p => p.eventType)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  photos.filter(p => {
                    const photoDate = p.createdAt?.toDate();
                    const now = new Date();
                    return (
                      photoDate &&
                      photoDate.getMonth() === now.getMonth() &&
                      photoDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterEventType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterEventType('all')}
              >
                All ({photos.length})
              </Button>
              {EVENT_TYPES.map(type => {
                const count = photos.filter(p => p.eventType === type).length;
                if (count === 0) return null;
                return (
                  <Button
                    key={type}
                    variant={filterEventType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterEventType(type)}
                  >
                    {type} ({count})
                  </Button>
                );
              })}
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

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No photos found
              </h3>
              <p className="text-muted-foreground">
                {filterEventType === 'all'
                  ? 'Start by uploading your first photo'
                  : `No photos found for ${filterEventType} events`}
              </p>
            </div>
          ) : (
            filteredPhotos.map(photo => (
              <Card key={photo.id} className="overflow-hidden group">
                <div className="relative aspect-square">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {photo.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditPhoto(photo);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(photo)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {photo.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {photo.eventType}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground space-x-4">
                    {photo.location && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {photo.location}
                      </div>
                    )}
                    {photo.eventDate && (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(photo.eventDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {photo.tags.slice(0, 3).map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {photo.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{photo.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedPhoto && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedPhoto.title}</DialogTitle>
                  <DialogDescription>
                    {selectedPhoto.eventType} • {selectedPhoto.location}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={selectedPhoto.imageUrl}
                      alt={selectedPhoto.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Event Type:</strong> {selectedPhoto.eventType}
                    </div>
                    <div>
                      <strong>Location:</strong>{' '}
                      {selectedPhoto.location || 'Not specified'}
                    </div>
                    <div>
                      <strong>Event Date:</strong>{' '}
                      {selectedPhoto.eventDate
                        ? new Date(selectedPhoto.eventDate).toLocaleDateString()
                        : 'Not specified'}
                    </div>
                    <div>
                      <strong>Featured:</strong>{' '}
                      {selectedPhoto.featured ? 'Yes' : 'No'}
                    </div>
                  </div>
                  {selectedPhoto.description && (
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1 text-muted-foreground">
                        {selectedPhoto.description}
                      </p>
                    </div>
                  )}
                  {selectedPhoto.tags.length > 0 && (
                    <div>
                      <strong>Tags:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPhoto.tags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {editPhoto && (
              <>
                <DialogHeader>
                  <DialogTitle>Edit Photo</DialogTitle>
                  <DialogDescription>
                    Update photo details and metadata.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={editPhoto.title}
                      onChange={e =>
                        setEditPhoto(prev =>
                          prev ? { ...prev, title: e.target.value } : null
                        )
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editPhoto.description}
                      onChange={e =>
                        setEditPhoto(prev =>
                          prev ? { ...prev, description: e.target.value } : null
                        )
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-eventType">Event Type *</Label>
                    <Select
                      value={editPhoto.eventType}
                      onValueChange={value =>
                        setEditPhoto(prev =>
                          prev ? { ...prev, eventType: value } : null
                        )
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={editPhoto.location}
                        onChange={e =>
                          setEditPhoto(prev =>
                            prev ? { ...prev, location: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-eventDate">Event Date</Label>
                      <Input
                        id="edit-eventDate"
                        type="date"
                        value={editPhoto.eventDate}
                        onChange={e =>
                          setEditPhoto(prev =>
                            prev ? { ...prev, eventDate: e.target.value } : null
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-tags">Tags</Label>
                    <Input
                      id="edit-tags"
                      value={editPhoto.tags.join(', ')}
                      onChange={e =>
                        setEditPhoto(prev =>
                          prev
                            ? {
                                ...prev,
                                tags: e.target.value
                                  .split(',')
                                  .map(tag => tag.trim())
                                  .filter(tag => tag.length > 0),
                              }
                            : null
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-featured"
                      checked={editPhoto.featured}
                      onChange={e =>
                        setEditPhoto(prev =>
                          prev ? { ...prev, featured: e.target.checked } : null
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-featured">Featured Photo</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Edit className="w-4 h-4 mr-2" />
                      Update Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
