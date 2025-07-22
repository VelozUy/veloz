'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  ArrowLeft,
  LogOut,
  Bell,
  User,
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

interface Project {
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

interface ClientUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  projects: string[];
  lastLogin: Date;
}

interface ProjectClient {
  id: string;
  name: string;
  email: string;
  signupDate: { toDate: () => Date } | null;
  lastLogin?: { toDate: () => Date } | null;
  status: 'active' | 'inactive';
}

export default function ProjectClientPortal() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<ClientUser | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [projectClients, setProjectClients] = useState<ProjectClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Message form state
  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: '',
    type: 'note' as 'email' | 'note' | 'update',
  });

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      loadProjectFiles();
      loadProjectMessages();
      loadProjectClients();
    }
  }, [project]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Check if client is logged in
      const clientId = localStorage.getItem('clientId');
      let isPublicAccess = false;

      const db = await getFirestoreService();
      if (!db) {
        setError('Service not available');
        return;
      }

      // If no client is logged in, check for public access
      if (!clientId) {
        // Check if this project has public access enabled
        const publicAccessRef = collection(db, 'public_access');
        const publicAccessQuery = query(
          publicAccessRef,
          where('projectId', '==', projectId),
          where('status', '==', 'active')
        );
        const publicAccessSnapshot = await getDocs(publicAccessQuery);
        
        if (!publicAccessSnapshot.empty) {
          isPublicAccess = true;
          // For public access, we don't need client data
          setClient(null);
        } else {
          router.push('/client/signup');
          return;
        }
      } else {
        // Load client data for authenticated access
        const clientDoc = await getDoc(doc(db, 'clients', clientId));
        if (!clientDoc.exists()) {
          localStorage.removeItem('clientId');
          router.push('/client/signup');
          return;
        }

        const clientData = clientDoc.data() as ClientUser;
        setClient({ ...clientData, id: clientId });

        // Check if client has access to this project
        if (!clientData.projects.includes(projectId)) {
          setError('You do not have access to this project');
          setLoading(false);
          return;
        }
      }

      // Load project data
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) {
        // For testing purposes, create a mock project if it doesn't exist
        if (projectId === 'test-project-123') {
          const mockProject: Project = {
            id: projectId,
            title: {
              en: 'Test Project',
              es: 'Proyecto de Prueba',
              pt: 'Projeto de Teste'
            },
            status: 'in-progress',
            eventType: 'Wedding',
            eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Test Location',
            progress: 0,
            mediaCount: {
              photos: 0,
              videos: 0
            },
            lastUpdate: new Date(),
            milestones: []
          };
          setProject(mockProject);
          setLoading(false);
          return;
        } else {
          setError('Project not found');
          setLoading(false);
          return;
        }
      }

      const projectData = projectDoc.data() as Project;
      
      // Calculate progress based on milestones
      if (projectData.milestones) {
        const completed = projectData.milestones.filter(m => m.status === 'completed').length;
        projectData.progress = Math.round((completed / projectData.milestones.length) * 100);
      } else {
        projectData.progress = 0;
      }
      
      setProject({ ...projectData, id: projectId });
    } catch (error) {
      console.error('Error loading project data:', error);
      setError('Error loading project data');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectFiles = async () => {
    if (!project) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;

      const filesRef = collection(db, 'project_files');
      const filesQuery = query(
        filesRef,
        where('projectId', '==', project.id),
        orderBy('uploadedAt', 'desc')
      );
      const filesSnapshot = await getDocs(filesQuery);

      const filesData: ProjectFile[] = [];
      filesSnapshot.forEach(doc => {
        const fileData = doc.data() as ProjectFile;
        filesData.push({ ...fileData, id: doc.id });
      });

      setProjectFiles(filesData);
    } catch (error) {
      console.error('Error loading project files:', error);
    }
  };

  const loadProjectMessages = async () => {
    if (!project) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;

      const messagesRef = collection(db, 'project_messages');
      const messagesQuery = query(
        messagesRef,
        where('projectId', '==', project.id),
        orderBy('date', 'desc')
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      const messagesData: ProjectMessage[] = [];
      messagesSnapshot.forEach(doc => {
        const messageData = doc.data() as ProjectMessage;
        messagesData.push({ ...messageData, id: doc.id });
      });

      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading project messages:', error);
    }
  };

  const loadProjectClients = async () => {
    if (!project) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;

      const clientsRef = collection(db, 'clients');
      const clientsQuery = query(
        clientsRef,
        where('projects', 'array-contains', project.id),
        orderBy('signupDate', 'desc')
      );
      const clientsSnapshot = await getDocs(clientsQuery);

      const clientsData: ProjectClient[] = [];
      clientsSnapshot.forEach(doc => {
        const clientData = doc.data() as any;
        clientsData.push({
          id: doc.id,
          name: clientData.fullName || `${clientData.firstName} ${clientData.lastName}`,
          email: clientData.email,
          signupDate: clientData.signupDate,
          lastLogin: clientData.lastLogin,
          status: clientData.status || 'active',
        });
      });

      setProjectClients(clientsData);
    } catch (error) {
      console.error('Error loading project clients:', error);
    }
  };

  const sendMessage = async () => {
    if (!project || !messageForm.subject || !messageForm.content) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;

      const messagesRef = collection(db, 'project_messages');
      const newMessage = {
        projectId: project.id,
        from: client?.fullName || 'Client',
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
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientId');
    localStorage.removeItem('clientName');
    router.push('/client/signup');
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

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/client')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {project.title.es || project.title.en || project.title.pt}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {client ? `Client Portal • Welcome, ${client.fullName}` : 'Public Project View'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {client && (
                <>
                  <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
              {!client && (
                <Button variant="outline" size="sm" onClick={() => router.push('/client/signup')}>
                  <User className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('files')}
                >
                  Files
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('messages')}
                >
                  Messages
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('calendar')}
                >
                  Calendar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('clients')}
                >
                  Other Clients
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="clients">Other Clients</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Project Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Event Type</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.eventType}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.location}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Event Date</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(project.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Overall Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold">{project.mediaCount.photos}</div>
                            <div className="text-xs text-muted-foreground">Photos</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{project.mediaCount.videos}</div>
                            <div className="text-xs text-muted-foreground">Videos</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.milestones.map(milestone => (
                          <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                    </CardContent>
                  </Card>
                )}
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
                      <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                    ) : (
                      <div className="space-y-2">
                        {projectFiles.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Download className="w-4 h-4 text-muted-foreground" />
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

              <TabsContent value="messages" className="space-y-4">
                {/* Send Message */}
                {client && (
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
                          onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                          placeholder="Message subject"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Message</label>
                        <textarea
                          value={messageForm.content}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                          rows={4}
                          placeholder="Your message..."
                        />
                      </div>
                      
                      <Button onClick={sendMessage} disabled={!messageForm.subject || !messageForm.content}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {!client && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Sign up to send messages and access full project features.
                        </p>
                        <Button 
                          className="mt-2" 
                          onClick={() => router.push('/client/signup')}
                        >
                          Sign Up Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Message History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Message History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No messages yet</p>
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
                            <p className="text-sm text-muted-foreground">{message.content}</p>
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

              <TabsContent value="clients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Other Project Clients</CardTitle>
                    <CardDescription>
                      View all clients who have signed up for this project. This information is visible to all project participants.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {projectClients.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No other clients yet</h3>
                        <p className="text-muted-foreground">
                          Other clients will appear here once they sign up for this project
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">
                            {projectClients.length} client{projectClients.length !== 1 ? 's' : ''} signed up
                          </h3>
                        </div>
                        
                        <div className="space-y-3">
                          {projectClients.map((projectClient) => (
                            <div key={projectClient.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {projectClient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{projectClient.name}</p>
                                  <p className="text-sm text-muted-foreground">{projectClient.email}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Signed up: {projectClient.signupDate ? projectClient.signupDate.toDate().toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={projectClient.status === 'active' ? 'default' : 'secondary'}>
                                  {projectClient.status}
                                </Badge>
                                {projectClient.lastLogin && (
                                  <span className="text-xs text-muted-foreground">
                                    Last login: {projectClient.lastLogin.toDate().toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 