'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  FileText,
  Upload,
  Download,
  Edit,
  Trash2,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  MapPin,
  Star,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Link,
  Copy,
  Share2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import ClientInviteManager from './ClientInviteManager';
import NotificationManager from './NotificationManager';
import Reports from './Reports';

interface Project {
  id: string;
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
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  timeline?: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      id: string;
      title: string;
      date: string;
      status: 'pending' | 'completed' | 'overdue';
    }>;
  };
  budget?: {
    total: number;
    spent: number;
    currency: string;
  };
  crewMembers?: string[];
  createdAt: { toDate: () => Date } | null;
  updatedAt: { toDate: () => Date } | null;
}

interface CommunicationLog {
  id: string;
  projectId: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject: string;
  content: string;
  date: { toDate: () => Date } | null;
  from: string;
  to: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'other';
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: { toDate: () => Date } | null;
}

interface ProjectNotification {
  id: string;
  projectId: string;
  type: 'milestone' | 'deadline' | 'client_message' | 'team_update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: { toDate: () => Date } | null;
}

interface ProjectManagementProps {
  projectId?: string;
  mode?: 'overview' | 'communication' | 'files' | 'notifications';
}

export default function ProjectManagement({
  projectId,
  mode = 'overview',
}: ProjectManagementProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(mode);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Communication form state
  const [communicationForm, setCommunicationForm] = useState({
    type: 'email' as 'email' | 'phone' | 'meeting' | 'note',
    subject: '',
    content: '',
    to: '',
  });

  // File upload state
  const [fileUpload, setFileUpload] = useState({
    name: '',
    type: 'document' as 'image' | 'video' | 'document' | 'other',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    milestoneReminders: true,
    deadlineAlerts: true,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadCommunicationLogs();
      loadProjectFiles();
      loadNotifications();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        setError('Service not available');
        return;
      }
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      
      setProjects(projectsData);
      
      if (projectId) {
        const project = projectsData.find(p => p.id === projectId);
        setSelectedProject(project || null);
      }
    } catch (err) {
      setError('Error loading projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCommunicationLogs = async () => {
    if (!selectedProject) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;
      const logsRef = collection(db, 'communication_logs');
      const q = query(
        logsRef,
        where('projectId', '==', selectedProject.id),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CommunicationLog[];
      
      setCommunicationLogs(logsData);
    } catch (err) {
      console.error('Error loading communication logs:', err);
    }
  };

  const loadProjectFiles = async () => {
    if (!selectedProject) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;
      const filesRef = collection(db, 'project_files');
      const q = query(
        filesRef,
        where('projectId', '==', selectedProject.id),
        orderBy('uploadedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectFile[];
      
      setProjectFiles(filesData);
    } catch (err) {
      console.error('Error loading project files:', err);
    }
  };

  const loadNotifications = async () => {
    if (!selectedProject) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;
      const notificationsRef = collection(db, 'project_notifications');
      const q = query(
        notificationsRef,
        where('projectId', '==', selectedProject.id),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectNotification[];
      
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const addCommunicationLog = async () => {
    if (!selectedProject || !communicationForm.subject || !communicationForm.content) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;
      const logsRef = collection(db, 'communication_logs');
      
      const newLog = {
        projectId: selectedProject.id,
        type: communicationForm.type,
        subject: communicationForm.subject,
        content: communicationForm.content,
        to: communicationForm.to,
        from: 'Veloz Team',
        date: serverTimestamp(),
        status: 'sent' as const,
      };
      
      await addDoc(logsRef, newLog);
      
      // Reset form
      setCommunicationForm({
        type: 'email',
        subject: '',
        content: '',
        to: '',
      });
      
      // Reload logs
      loadCommunicationLogs();
    } catch (err) {
      setError('Error adding communication log');
      console.error('Error adding communication log:', err);
    }
  };

  const uploadFile = async (file: File) => {
    if (!selectedProject) return;
    
    try {
      // In a real implementation, you would upload to cloud storage
      // For now, we'll simulate file upload
      const db = await getFirestoreService();
      if (!db) return;
      const filesRef = collection(db, 'project_files');
      
      const newFile = {
        projectId: selectedProject.id,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'document',
        size: file.size,
        url: URL.createObjectURL(file), // In real app, this would be cloud storage URL
        uploadedBy: 'Current User',
        uploadedAt: serverTimestamp(),
      };
      
      await addDoc(filesRef, newFile);
      
      // Reload files
      loadProjectFiles();
    } catch (err) {
      setError('Error uploading file');
      console.error('Error uploading file:', err);
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      const db = await getFirestoreService();
      if (!db) return;
      const projectRef = doc(db, 'projects', projectId);
      
      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      
      // Reload projects
      loadProjects();
    } catch (err) {
      setError('Error updating project status');
      console.error('Error updating project status:', err);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const db = await getFirestoreService();
      if (!db) return;
      const notificationRef = doc(db, 'project_notifications', notificationId);
      
      await updateDoc(notificationRef, {
        read: true,
      });
      
      // Reload notifications
      loadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'in-progress':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'meeting':
        return <Calendar className="w-4 h-4" />;
      case 'note':
        return <FileText className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Management</h1>
          <p className="text-muted-foreground">
            Manage projects, client communications, and team collaboration
          </p>
        </div>
        
        <Button onClick={() => router.push('/admin/projects/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProject?.id || ''}
            onValueChange={(value) => {
              const project = projects.find(p => p.id === value);
              setSelectedProject(project || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a project to manage" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title.es || project.title.en || project.title.pt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedProject.title.es || selectedProject.title.en || selectedProject.title.pt}</CardTitle>
                <Badge className={getStatusColor(selectedProject.status)}>
                  {selectedProject.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProject.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(selectedProject.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProject.clientInfo?.name || 'No client info'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="clients">Client Invites</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={selectedProject.status}
                        onValueChange={(value) => updateProjectStatus(selectedProject.id, value as Project['status'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Event Type</Label>
                      <p className="text-sm text-muted-foreground">{selectedProject.eventType}</p>
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.description.es || selectedProject.description.en || selectedProject.description.pt}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedProject.clientInfo ? (
                      <>
                        <div>
                          <Label>Name</Label>
                          <p className="text-sm text-muted-foreground">{selectedProject.clientInfo.name}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="text-sm text-muted-foreground">{selectedProject.clientInfo.email}</p>
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <p className="text-sm text-muted-foreground">{selectedProject.clientInfo.phone || 'Not provided'}</p>
                        </div>
                        {selectedProject.clientInfo.company && (
                          <div>
                            <Label>Company</Label>
                            <p className="text-sm text-muted-foreground">{selectedProject.clientInfo.company}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No client information available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="communication" className="space-y-4">
              {/* Add Communication Log */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Communication Log</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={communicationForm.type}
                        onValueChange={(value) => setCommunicationForm(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>To</Label>
                      <Input
                        value={communicationForm.to}
                        onChange={(e) => setCommunicationForm(prev => ({ ...prev, to: e.target.value }))}
                        placeholder="Client email or phone"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={communicationForm.subject}
                      onChange={(e) => setCommunicationForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Communication subject"
                    />
                  </div>
                  
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={communicationForm.content}
                      onChange={(e) => setCommunicationForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Communication details"
                      rows={4}
                    />
                  </div>
                  
                  <Button onClick={addCommunicationLog}>
                    <Send className="w-4 h-4 mr-2" />
                    Add Communication Log
                  </Button>
                </CardContent>
              </Card>

              {/* Communication History */}
              <Card>
                <CardHeader>
                  <CardTitle>Communication History</CardTitle>
                </CardHeader>
                <CardContent>
                  {communicationLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No communication logs yet</p>
                  ) : (
                    <div className="space-y-4">
                      {communicationLogs.map(log => (
                        <div key={log.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getCommunicationIcon(log.type)}
                              <span className="font-medium">{log.subject}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.type}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {log.date?.toDate().toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{log.content}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>To: {log.to}</span>
                            <span>Status: {log.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>File Type</Label>
                      <Select
                        value={fileUpload.type}
                        onValueChange={(value) => setFileUpload(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>File</Label>
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadFile(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File List */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Files</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectFiles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {projectFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Upload className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: !!checked }))}
                      />
                      <Label>Email Notifications</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: !!checked }))}
                      />
                      <Label>SMS Notifications</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={notificationSettings.inAppNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, inAppNotifications: !!checked }))}
                      />
                      <Label>In-App Notifications</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={notificationSettings.milestoneReminders}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, milestoneReminders: !!checked }))}
                      />
                      <Label>Milestone Reminders</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            !notification.read ? 'bg-primary/5 border-primary/20' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                              {notification.priority}
                            </Badge>
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-4">
              {selectedProject && (
                <ClientInviteManager
                  projectId={selectedProject.id}
                  projectTitle={selectedProject.title.es || selectedProject.title.en || selectedProject.title.pt}
                />
              )}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              {selectedProject && selectedProject.clientInfo && (
                <NotificationManager
                  projectId={selectedProject.id}
                  clientEmail={selectedProject.clientInfo.email}
                  clientName={selectedProject.clientInfo.name}
                  projectTitle={selectedProject.title.es || selectedProject.title.en || selectedProject.title.pt}
                />
              )}
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Reports projectId={selectedProject?.id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 