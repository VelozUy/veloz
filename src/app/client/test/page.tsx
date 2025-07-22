'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Send,
  MessageSquare,
  Calendar,
  Users,
  FileText,
  Video,
  Image as ImageIcon,
} from 'lucide-react';

export default function ClientTestPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: 'test@client.com',
    password: 'test123',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState('wedding');
  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: '',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.email === 'test@client.com' && loginForm.password === 'test123') {
      setIsLoggedIn(true);
      localStorage.setItem('clientId', 'test-client-id');
    } else {
      alert('Invalid credentials. Use test@client.com / test123');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('clientId');
  };

  const sendMessage = () => {
    if (messageForm.subject && messageForm.content) {
      alert(`Message sent!\nSubject: ${messageForm.subject}\nContent: ${messageForm.content}`);
      setMessageForm({ subject: '', content: '' });
    } else {
      alert('Please fill in both subject and content');
    }
  };

  const testProjects = [
    {
      id: 'wedding',
      title: 'Wedding Photography',
      status: 'in-progress',
      eventType: 'Wedding',
      location: 'Barcelona, Spain',
      progress: 25,
      mediaCount: { photos: 150, videos: 3 },
      milestones: [
        { title: 'Initial Consultation', status: 'completed' },
        { title: 'Photo Session', status: 'pending' },
        { title: 'Photo Selection', status: 'pending' },
        { title: 'Final Delivery', status: 'pending' },
      ],
    },
    {
      id: 'corporate',
      title: 'Corporate Event',
      status: 'completed',
      eventType: 'Corporate',
      location: 'Madrid, Spain',
      progress: 100,
      mediaCount: { photos: 200, videos: 5 },
      milestones: [
        { title: 'Planning Meeting', status: 'completed' },
        { title: 'Event Coverage', status: 'completed' },
        { title: 'Photo Editing', status: 'completed' },
        { title: 'Final Delivery', status: 'completed' },
      ],
    },
  ];

  const testFiles = [
    { name: 'wedding_photos.zip', type: 'image', size: '250MB' },
    { name: 'wedding_video.mp4', type: 'video', size: '500MB' },
    { name: 'corporate_event_photos.zip', type: 'image', size: '300MB' },
  ];

  const testMessages = [
    {
      from: 'Veloz Team',
      to: 'Client',
      subject: 'Wedding Photos Ready',
      content: 'Your wedding photos are ready for review. Please check the files section.',
      date: '2 hours ago',
    },
    {
      from: 'Client',
      to: 'Veloz Team',
      subject: 'Photo Selection Questions',
      content: 'I have some questions about the photo selection process. Can we schedule a call?',
      date: '1 day ago',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'in-progress':
        return 'bg-primary/10 text-primary';
      case 'pending':
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
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Client Portal Test</CardTitle>
            <p className="text-muted-foreground">
              Test the client portal features with sample data
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
            
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-primary">
                <strong>Test Credentials:</strong><br />
                Email: test@client.com<br />
                Password: test123
              </p>
            </div>
          </CardContent>
        </Card>
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
              <h1 className="text-xl font-bold">Client Portal Test</h1>
              <Badge variant="secondary">Test Mode</Badge>
            </div>
            
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  My Projects
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Messages
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Files
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Calendar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your projects
                </p>
              </div>
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Team
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">1 in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">50% success rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Photos and videos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Milestones due soon</p>
                </CardContent>
              </Card>
            </div>

            {/* Project Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testProjects.map(project => (
                    <Card
                      key={project.id}
                      className={`cursor-pointer transition-colors ${
                        selectedProject === project.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{project.title}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status}</span>
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {project.eventType} • {project.location}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            {project.mediaCount.photos}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Video className="w-3 h-3 mr-1" />
                            {project.mediaCount.videos}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            {selectedProject && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {testProjects.find(p => p.id === selectedProject)?.title} - Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Project Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Project Information</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Status: </span>
                          <Badge className={getStatusColor(testProjects.find(p => p.id === selectedProject)?.status || '')}>
                            {testProjects.find(p => p.id === selectedProject)?.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Event Type: </span>
                          <span className="text-sm text-muted-foreground">
                            {testProjects.find(p => p.id === selectedProject)?.eventType}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Location: </span>
                          <span className="text-sm text-muted-foreground">
                            {testProjects.find(p => p.id === selectedProject)?.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Milestones</h4>
                      <div className="space-y-2">
                        {testProjects.find(p => p.id === selectedProject)?.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{milestone.title}</span>
                            <Badge
                              variant={milestone.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {milestone.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Files */}
                  <div>
                    <h4 className="font-medium mb-2">Project Files</h4>
                    <div className="space-y-2">
                      {testFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Download className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.type} • {file.size}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Messages */}
                  <div>
                    <h4 className="font-medium mb-2">Send Message</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={messageForm.subject}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Message subject"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="content">Message</Label>
                        <Textarea
                          id="content"
                          value={messageForm.content}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Your message..."
                          rows={4}
                        />
                      </div>
                      
                      <Button onClick={sendMessage} disabled={!messageForm.subject || !messageForm.content}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>

                  {/* Message History */}
                  <div>
                    <h4 className="font-medium mb-2">Message History</h4>
                    <div className="space-y-3">
                      {testMessages.map((message, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{message.from}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">{message.to}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{message.date}</span>
                          </div>
                          <h5 className="font-medium mb-1">{message.subject}</h5>
                          <p className="text-sm text-muted-foreground">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 