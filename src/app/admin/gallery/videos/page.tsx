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
  Video as VideoIcon,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Calendar,
  MapPin,
  Play,
  ExternalLink,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';

interface Video {
  id: string;
  title: string;
  description: string;
  eventType: string;
  location: string;
  eventDate: string;
  embedUrl: string;
  thumbnailUrl?: string;
  platform: 'youtube' | 'vimeo' | 'other';
  tags: string[];
  featured: boolean;
  duration?: string;
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

const extractVideoInfo = (url: string) => {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (youtubeMatch) {
    return {
      platform: 'youtube' as const,
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      platform: 'vimeo' as const,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      thumbnailUrl: '', // Vimeo thumbnails require API call
    };
  }

  return {
    platform: 'other' as const,
    embedUrl: url,
    thumbnailUrl: '',
  };
};

const VIDEOS_PER_PAGE = 12;

export default function VideoGalleryPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterEventType, setFilterEventType] = useState('all');
  const [lastDoc, setLastDoc] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [totalStats, setTotalStats] = useState({
    total: 0,
    featured: 0,
    youtube: 0,
    vimeo: 0,
  });

  // Add form state
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    eventType: '',
    location: '',
    eventDate: '',
    videoUrl: '',
    tags: '',
    featured: false,
    duration: '',
  });

  // Load stats separately (faster query)
  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        const statsQuery = query(collection(db, 'videos'));
        const snapshot = await getDocs(statsQuery);

        let total = 0;
        let featured = 0;
        let youtube = 0;
        let vimeo = 0;

        snapshot.forEach(doc => {
          const video = doc.data() as Video;
          total++;
          if (video.featured) featured++;
          if (video.platform === 'youtube') youtube++;
          if (video.platform === 'vimeo') vimeo++;
        });

        setTotalStats({
          total,
          featured,
          youtube,
          vimeo,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, [user]);

  // Load initial videos with pagination
  useEffect(() => {
    if (!user) return;

    const loadInitialVideos = async () => {
      try {
        setLoading(true);
        const videosQuery = query(
          collection(db, 'videos'),
          orderBy('createdAt', 'desc'),
          limit(VIDEOS_PER_PAGE)
        );

        const snapshot = await getDocs(videosQuery);
        const videoList: Video[] = [];

        snapshot.forEach(doc => {
          videoList.push({ id: doc.id, ...doc.data() } as Video);
        });

        setVideos(videoList);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === VIDEOS_PER_PAGE);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos');
        setLoading(false);
      }
    };

    loadInitialVideos();
  }, [user]);

  const loadMoreVideos = async () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const moreQuery = query(
        collection(db, 'videos'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(VIDEOS_PER_PAGE)
      );

      const snapshot = await getDocs(moreQuery);
      const moreVideos: Video[] = [];

      snapshot.forEach(doc => {
        moreVideos.push({ id: doc.id, ...doc.data() } as Video);
      });

      setVideos(prev => [...prev, ...moreVideos]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === VIDEOS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more videos:', error);
      setError('Failed to load more videos');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitLoading(true);
    setError('');

    try {
      const videoInfo = extractVideoInfo(addForm.videoUrl);

      await addDoc(collection(db, 'videos'), {
        title: addForm.title,
        description: addForm.description,
        eventType: addForm.eventType,
        location: addForm.location,
        eventDate: addForm.eventDate,
        embedUrl: videoInfo.embedUrl,
        thumbnailUrl: videoInfo.thumbnailUrl,
        platform: videoInfo.platform,
        tags: addForm.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        featured: addForm.featured,
        duration: addForm.duration,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess('Video added successfully!');
      setAddForm({
        title: '',
        description: '',
        eventType: '',
        location: '',
        eventDate: '',
        videoUrl: '',
        tags: '',
        featured: false,
        duration: '',
      });

      setTimeout(() => {
        setAddDialogOpen(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error adding video:', error);
      setError('Failed to add video. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVideo) return;

    setSubmitLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'videos', editVideo.id), {
        title: editVideo.title,
        description: editVideo.description,
        eventType: editVideo.eventType,
        location: editVideo.location,
        eventDate: editVideo.eventDate,
        tags: editVideo.tags,
        featured: editVideo.featured,
        duration: editVideo.duration,
        updatedAt: serverTimestamp(),
      });

      setSuccess('Video updated successfully!');
      setTimeout(() => {
        setEditDialogOpen(false);
        setEditVideo(null);
        setSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Error updating video:', error);
      setError('Failed to update video');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (video: Video) => {
    if (
      !confirm(
        `Are you sure you want to delete "${video.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'videos', video.id));
      setSuccess('Video deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting video:', error);
      setError('Failed to delete video');
    }
  };

  const filteredVideos =
    filterEventType === 'all'
      ? videos
      : videos.filter(video => video.eventType === filterEventType);

  if (loading) {
    return (
      <AdminLayout title="Video Gallery">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Video Gallery">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Video Gallery
            </h1>
            <p className="text-muted-foreground">
              Manage your event videography portfolio
            </p>
          </div>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
                <DialogDescription>
                  Add a new video to your gallery with YouTube or Vimeo embed
                  URL.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAdd} className="space-y-4">
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

                {/* Video URL */}
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    value={addForm.videoUrl}
                    onChange={e =>
                      setAddForm(prev => ({
                        ...prev,
                        videoUrl: e.target.value,
                      }))
                    }
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    disabled={submitLoading}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Supports YouTube and Vimeo URLs
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={addForm.title}
                    onChange={e =>
                      setAddForm(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Beautiful Wedding Highlights"
                    disabled={submitLoading}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={addForm.description}
                    onChange={e =>
                      setAddForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe this video..."
                    disabled={submitLoading}
                    rows={3}
                  />
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select
                    value={addForm.eventType}
                    onValueChange={value =>
                      setAddForm(prev => ({ ...prev, eventType: value }))
                    }
                    disabled={submitLoading}
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

                {/* Location, Date, Duration */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={addForm.location}
                      onChange={e =>
                        setAddForm(prev => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="New York, NY"
                      disabled={submitLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={addForm.eventDate}
                      onChange={e =>
                        setAddForm(prev => ({
                          ...prev,
                          eventDate: e.target.value,
                        }))
                      }
                      disabled={submitLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={addForm.duration}
                      onChange={e =>
                        setAddForm(prev => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      placeholder="3:45"
                      disabled={submitLoading}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={addForm.tags}
                    onChange={e =>
                      setAddForm(prev => ({ ...prev, tags: e.target.value }))
                    }
                    placeholder="highlights, ceremony, reception"
                    disabled={submitLoading}
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
                    checked={addForm.featured}
                    onChange={e =>
                      setAddForm(prev => ({
                        ...prev,
                        featured: e.target.checked,
                      }))
                    }
                    disabled={submitLoading}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="featured">Featured Video</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitLoading || !addForm.videoUrl}
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <VideoIcon className="w-4 h-4 mr-2" />
                        Add Video
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    disabled={submitLoading}
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
                Total Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Featured Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.featured}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">YouTube</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.youtube}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vimeo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.vimeo}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterEventType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterEventType('all')}
              >
                All ({totalStats.total})
              </Button>
              {EVENT_TYPES.map(type => {
                // For now, show all event types - we can optimize this later with separate counts
                return (
                  <Button
                    key={type}
                    variant={filterEventType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterEventType(type)}
                  >
                    {type}
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

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <VideoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No videos found
              </h3>
              <p className="text-muted-foreground">
                {filterEventType === 'all'
                  ? 'Start by adding your first video'
                  : `No videos found for ${filterEventType} events`}
              </p>
            </div>
          ) : (
            filteredVideos.map(video => (
              <Card key={video.id} className="overflow-hidden group">
                <div className="relative aspect-video bg-muted">
                  {video.thumbnailUrl ? (
                    <div className="relative w-full h-full">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${video.thumbnailUrl})`,
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  {video.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      Featured
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 capitalize"
                  >
                    {video.platform}
                  </Badge>
                  {video.duration && (
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 right-2"
                    >
                      {video.duration}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedVideo(video);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditVideo(video);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(video.embedUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(video)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {video.eventType}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground space-x-4">
                    {video.location && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {video.location}
                      </div>
                    )}
                    {video.eventDate && (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(video.eventDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {video.tags.slice(0, 3).map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {video.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{video.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMore && !loading && filteredVideos.length > 0 && (
          <div className="flex justify-center">
            <Button
              onClick={loadMoreVideos}
              disabled={loadingMore}
              variant="outline"
              size="lg"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                <>Load More Videos</>
              )}
            </Button>
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedVideo && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedVideo.title}</DialogTitle>
                  <DialogDescription>
                    {selectedVideo.eventType} • {selectedVideo.location}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={selectedVideo.embedUrl}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allowFullScreen
                      frameBorder="0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Event Type:</strong> {selectedVideo.eventType}
                    </div>
                    <div>
                      <strong>Platform:</strong>{' '}
                      <span className="capitalize">
                        {selectedVideo.platform}
                      </span>
                    </div>
                    <div>
                      <strong>Location:</strong>{' '}
                      {selectedVideo.location || 'Not specified'}
                    </div>
                    <div>
                      <strong>Duration:</strong>{' '}
                      {selectedVideo.duration || 'Not specified'}
                    </div>
                    <div>
                      <strong>Event Date:</strong>{' '}
                      {selectedVideo.eventDate
                        ? new Date(selectedVideo.eventDate).toLocaleDateString()
                        : 'Not specified'}
                    </div>
                    <div>
                      <strong>Featured:</strong>{' '}
                      {selectedVideo.featured ? 'Yes' : 'No'}
                    </div>
                  </div>
                  {selectedVideo.description && (
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1 text-muted-foreground">
                        {selectedVideo.description}
                      </p>
                    </div>
                  )}
                  {selectedVideo.tags.length > 0 && (
                    <div>
                      <strong>Tags:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedVideo.tags.map(tag => (
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
            {editVideo && (
              <>
                <DialogHeader>
                  <DialogTitle>Edit Video</DialogTitle>
                  <DialogDescription>
                    Update video details and metadata.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={editVideo.title}
                      onChange={e =>
                        setEditVideo(prev =>
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
                      value={editVideo.description}
                      onChange={e =>
                        setEditVideo(prev =>
                          prev ? { ...prev, description: e.target.value } : null
                        )
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-eventType">Event Type *</Label>
                    <Select
                      value={editVideo.eventType}
                      onValueChange={value =>
                        setEditVideo(prev =>
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

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={editVideo.location}
                        onChange={e =>
                          setEditVideo(prev =>
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
                        value={editVideo.eventDate}
                        onChange={e =>
                          setEditVideo(prev =>
                            prev ? { ...prev, eventDate: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration">Duration</Label>
                      <Input
                        id="edit-duration"
                        value={editVideo.duration || ''}
                        onChange={e =>
                          setEditVideo(prev =>
                            prev ? { ...prev, duration: e.target.value } : null
                          )
                        }
                        placeholder="3:45"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-tags">Tags</Label>
                    <Input
                      id="edit-tags"
                      value={editVideo.tags.join(', ')}
                      onChange={e =>
                        setEditVideo(prev =>
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
                      checked={editVideo.featured}
                      onChange={e =>
                        setEditVideo(prev =>
                          prev ? { ...prev, featured: e.target.checked } : null
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-featured">Featured Video</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitLoading}>
                      {submitLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Video
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                      disabled={submitLoading}
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
