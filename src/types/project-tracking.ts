// Enhanced Project Tracking Types
// This file defines the comprehensive types for the Client Project Tracking System

export type ProjectStatus =
  | 'draft'
  | 'shooting_scheduled'
  | 'in_editing'
  | 'delivered'
  | 'archived';

export type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue';

export type MilestoneType =
  | 'fecha_confirmada'
  | 'crew_armado'
  | 'shooting_finalizado'
  | 'imagenes_editadas'
  | 'imagenes_entregadas'
  | 'videos_editados'
  | 'videos_entregados'
  | 'album_creado'
  | 'material_entregado';

export type CommunicationType =
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'meeting'
  | 'feedback'
  | 'update';

export type FileType =
  | 'photo'
  | 'video'
  | 'document'
  | 'contract'
  | 'invoice'
  | 'album';

export type NotificationType =
  | 'milestone_update'
  | 'file_upload'
  | 'status_change'
  | 'reminder'
  | 'urgent';

// Enhanced Project Interface
export interface EnhancedProject {
  id: string;
  slug?: string;
  title: {
    en: string;
    es: string;
    pt: string;
  };
  description: {
    en: string;
    es: string;
    pt: string;
  };
  eventType: string;
  location: string;
  eventDate: string;
  tags: string[];
  featured: boolean;
  status: ProjectStatus;
  coverImage?: string;
  order: number;

  // Enhanced tracking fields
  client: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    notes?: string;
    confidential: boolean;
    accessCode: string; // For client portal access
  };

  // Project management
  assignedTo?: string; // Admin user ID
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: {
    amount: number;
    currency: string;
    paid: number;
    dueDate?: string;
  };

  // Timeline and milestones
  timeline: Milestone[];
  progress: {
    percentage: number;
    completedMilestones: number;
    totalMilestones: number;
    lastUpdated: string;
  };

  // Communication tracking
  communications: Communication[];

  // File management
  files: ProjectFile[];

  // Crew assignments
  crewMembers: string[];

  // Legacy fields for compatibility
  mediaCount: {
    photos: number;
    videos: number;
  };
  mediaBlocks?: MediaBlock[];
  detailPageBlocks?: MediaBlock[];
  heroMediaConfig?: HeroMediaConfig;
  media?: ProjectMedia[];
  detailPageGridHeight?: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

// Milestone Interface
export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  completedDate?: string;
  assignedTo?: string;
  notes?: string;
  attachments?: string[]; // File IDs
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Communication Interface
export interface Communication {
  id: string;
  type: CommunicationType;
  subject: string;
  message: string;
  from: string; // Admin email or client email
  to: string[]; // Recipients
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: string[]; // File IDs
  timestamp: Date;
  notes?: string;
}

// Project File Interface
export interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  url: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
  isPublic: boolean; // Whether client can access
  downloadCount: number;
  lastDownloaded?: Date;
}

// Notification Interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  projectId: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
}

// Client Portal Session Interface
export interface ClientSession {
  id: string;
  projectId: string;
  accessCode: string;
  clientEmail: string;
  lastAccess: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: Date;
}

// Legacy interfaces for compatibility
export interface MediaBlock {
  id: string;
  mediaId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'image' | 'video' | 'title';
  zIndex: number;
  title?: string;
  font?: string;
  color?: string;
  mediaOffsetX?: number;
  mediaOffsetY?: number;
}

export interface HeroMediaConfig {
  mediaId?: string;
  aspectRatio: '1:1' | '16:9' | '4:5' | '9:16' | 'custom';
  customRatio?: {
    width: number;
    height: number;
  };
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export interface ProjectMedia {
  id?: string;
  projectId: string;
  type: 'photo' | 'video';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnail?: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | string | number;
  width?: number;
  height?: number;
  description?: {
    en: string;
    es: string;
    pt: string;
  };
  tags: string[];
  order: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Utility types
export type ProjectWithTracking = EnhancedProject & {
  milestones: Milestone[];
  communications: Communication[];
  files: ProjectFile[];
  notifications: Notification[];
};

export type ProjectSummary = Pick<
  EnhancedProject,
  'id' | 'title' | 'status' | 'eventDate' | 'client' | 'progress' | 'priority'
> & {
  lastCommunication?: Communication;
  nextMilestone?: Milestone;
  unreadNotifications: number;
};
