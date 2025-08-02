'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Download,
  Upload,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  FileText,
  Video,
  Image as ImageIcon,
  Send,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

interface ClientProject {
  id: string;
  title: {
    en: string;
    es: string;
    pt: string;
  };
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  eventType: string;
  eventDate: string;
  location: string;
  progress: number;
  mediaCount: {
    photos: number;
    videos: number;
  };
  lastUpdate: Date;
  crewMembers?: string[];
  milestones?: Array<{
    id: string;
    title: string;
    date: string;
    status: 'pending' | 'completed' | 'overdue';
  }>;
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
}

interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'other';
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
}

interface ProjectMessage {
  id: string;
  projectId: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date: Date;
  read: boolean;
  type: 'email' | 'note' | 'update';
}

interface ClientPortalProps {
  clientId: string;
  mode?: 'overview' | 'projects' | 'files' | 'messages' | 'calendar';
}

export default function ClientPortal({
  clientId,
  mode = 'overview',
}: ClientPortalProps) {
  const [activeTab, setActiveTab] = useState(mode);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(
    null
  );
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Message form state
  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: '',
    type: 'note' as 'email' | 'note' | 'update',
  });

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectFiles();
      loadProjectMessages();
    }
  }, [selectedProject]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        setError('Service not available');
        return;
      }

      // Load client's projects
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(
        projectsRef,
        where('clientId', '==', clientId),
        orderBy('updatedAt', 'desc')
      );
      const projectsSnapshot = await getDocs(projectsQuery);

      const projectsData: ClientProject[] = [];

      projectsSnapshot.forEach(doc => {
        const projectData = doc.data() as ClientProject;
        const project = { ...projectData, id: doc.id };

        // Calculate progress based on milestones
        if (project.milestones) {
          const completed = project.milestones.filter(
            m => m.status === 'completed'
          ).length;
          project.progress = Math.round(
            (completed / project.milestones.length) * 100
          );
        } else {
          project.progress = 0;
        }

        projectsData.push(project);
      });

      setProjects(projectsData);

      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0]);
      }
    } catch (error) {
      setError('Error loading client data');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectFiles = async () => {
    if (!selectedProject) return;

    try {
      const db = await getFirestoreService();
      if (!db) return;

      const filesRef = collection(db, 'project_files');
      const filesQuery = query(
        filesRef,
        where('projectId', '==', selectedProject.id),
        orderBy('uploadedAt', 'desc')
      );
      const filesSnapshot = await getDocs(filesQuery);

      const filesData: ProjectFile[] = [];
      filesSnapshot.forEach(doc => {
        const fileData = doc.data() as ProjectFile;
        filesData.push({ ...fileData, id: doc.id });
      });

      setProjectFiles(filesData);
    } catch (error) {}
  };

  const loadProjectMessages = async () => {
    if (!selectedProject) return;

    try {
      const db = await getFirestoreService();
      if (!db) return;

      const messagesRef = collection(db, 'project_messages');
      const messagesQuery = query(
        messagesRef,
        where('projectId', '==', selectedProject.id),
        orderBy('date', 'desc')
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      const messagesData: ProjectMessage[] = [];
      messagesSnapshot.forEach(doc => {
        const messageData = doc.data() as ProjectMessage;
        messagesData.push({ ...messageData, id: doc.id });
      });

      setMessages(messagesData);
    } catch (error) {}
  };

  const sendMessage = async () => {
    if (!selectedProject || !messageForm.subject || !messageForm.content)
      return;

    try {
      const db = await getFirestoreService();
      if (!db) return;

      const messagesRef = collection(db, 'project_messages');
      const newMessage = {
        projectId: selectedProject.id,
        from: 'Client',
        to: 'Veloz Team',
        subject: messageForm.subject,
        content: messageForm.content,
        type: messageForm.type,
        date: serverTimestamp(),
        read: false,
      };

      await addDoc(messagesRef, newMessage);

      // Reset form
      setMessageForm({
        subject: '',
        content: '',
        type: 'note',
      });

      // Reload messages
      loadProjectMessages();
    } catch (error) {}
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'in-progress':
        return 'bg-primary/10 text-primary';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'archived':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Portal</h1>
          <p className="text-muted-foreground">
            Manage your projects and communicate with the team
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
          <Button>
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Team
          </Button>
        </div>
      </div>

      {/* Project Selection */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-colors ${
                    selectedProject?.id === project.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {project.title.es ||
                          project.title.en ||
                          project.title.pt}
                      </h3>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{project.status}</span>
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {project.eventType} • {project.location}
                    </p>

                    {project.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    )}

                    <div className="flex items-center space-x-2 mt-2">
                      {project.mediaCount.photos > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {project.mediaCount.photos}
                        </Badge>
                      )}
                      {project.mediaCount.videos > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Video className="w-3 h-3 mr-1" />
                          {project.mediaCount.videos}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProject && (
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as any)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
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
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(selectedProject.status)}>
                        {getStatusIcon(selectedProject.status)}
                        <span className="ml-1">{selectedProject.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Event Type</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedProject.eventType}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedProject.location}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Event Date</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(selectedProject.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle>Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProject.milestones &&
                  selectedProject.milestones.length > 0 ? (
                    <div className="space-y-3">
                      {selectedProject.milestones.map(milestone => (
                        <div
                          key={milestone.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{milestone.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(milestone.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              milestone.status === 'completed'
                                ? 'default'
                                : milestone.status === 'overdue'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {milestone.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No milestones defined
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop files here or click to browse
                  </p>
                  <Button className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
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
                  <p className="text-sm text-muted-foreground">
                    No files uploaded yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {projectFiles.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Download className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.type} •{' '}
                              {(file.size / 1024 / 1024).toFixed(2)} MB
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

          <TabsContent value="messages" className="space-y-4">
            {/* Send Message */}
            <Card>
              <CardHeader>
                <CardTitle>Send Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={e =>
                      setMessageForm(prev => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    value={messageForm.content}
                    onChange={e =>
                      setMessageForm(prev => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                    rows={4}
                    placeholder="Your message..."
                  />
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={!messageForm.subject || !messageForm.content}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Message History */}
            <Card>
              <CardHeader>
                <CardTitle>Message History</CardTitle>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No messages yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div key={message.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{message.from}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium">{message.to}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {message.date.toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium mb-1">{message.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {message.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                  <p className="text-muted-foreground">
                    Calendar functionality will be implemented here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
