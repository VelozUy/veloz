'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Building,
  Phone,
  Lock,
  ArrowRight,
  Calendar,
  MapPin,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

interface Project {
  id: string;
  title: {
    en: string;
    es: string;
    pt: string;
  };
  eventType: string;
  eventDate: string;
  location: string;
  status: string;
}

interface ClientInvite {
  id: string;
  projectId: string;
  projectTitle: string;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: { toDate: () => Date } | null;
}

interface ClientSignupForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function ClientSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const inviteCode = searchParams.get('code');
  const isPublic = searchParams.get('public') === 'true';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [project, setProject] = useState<Project | null>(null);
  const [invite, setInvite] = useState<ClientInvite | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [signupForm, setSignupForm] = useState<ClientSignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [signinForm, setSigninForm] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    validateInvite();
  }, [projectId, inviteCode, isPublic]);

  const validateInvite = async () => {
    if (!projectId) {
      setError('Invalid invite link. Please contact your project manager for a valid invite.');
      setLoading(false);
      return;
    }

    // For public access, we don't need an invite code
    if (!isPublic && !inviteCode) {
      setError('Invalid invite link. Please contact your project manager for a valid invite.');
      setLoading(false);
      return;
    }

    try {
      const db = await getFirestoreService();
      if (!db) {
        setError('Service not available');
        setLoading(false);
        return;
      }

      // Load project details
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
            eventType: 'Wedding',
            eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            location: 'Test Location',
            status: 'active'
          };
          setProject(mockProject);
        } else {
          setError('Project not found');
          setLoading(false);
          return;
        }
      } else {
        const projectData = projectDoc.data() as Project;
        setProject({ ...projectData, id: projectId });
      }

      // For public access, skip invite validation
      if (isPublic) {
        setLoading(false);
        return;
      }

      // Validate invite code (only for non-public access)
      if (!inviteCode) {
        setError('Invalid invite code');
        setLoading(false);
        return;
      }

      const invitesRef = collection(db, 'client_invites');
      const inviteQuery = query(
        invitesRef,
        where('projectId', '==', projectId),
        where('inviteCode', '==', inviteCode)
      );
      const inviteSnapshot = await getDocs(inviteQuery);

      if (inviteSnapshot.empty) {
        setError('Invalid invite code');
        setLoading(false);
        return;
      }

      const inviteData = inviteSnapshot.docs[0].data() as ClientInvite;
      const inviteDoc = { ...inviteData, id: inviteSnapshot.docs[0].id };

      // Check if invite is expired
      if (inviteDoc.expiresAt && inviteDoc.expiresAt.toDate() < new Date()) {
        setError('This invite has expired. Please contact your project manager for a new invite.');
        setLoading(false);
        return;
      }

      // Check if invite is already accepted
      if (inviteDoc.status === 'accepted') {
        setError('This invite has already been used. Please contact your project manager for a new invite.');
        setLoading(false);
        return;
      }

      setInvite(inviteDoc);
    } catch (err) {
      console.error('Error validating invite:', err);
      setError('Error validating invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const db = await getFirestoreService();
      if (!db) {
        setError('Service not available');
        return;
      }

      // Check if client exists
      const clientsRef = collection(db, 'clients');
      const emailQuery = query(clientsRef, where('email', '==', signinForm.email));
      const emailSnapshot = await getDocs(emailQuery);

      if (emailSnapshot.empty) {
        setError('No account found with this email. Please sign up instead.');
        return;
      }

      const clientDoc = emailSnapshot.docs[0];
      const clientData = clientDoc.data();

      // Check password (in production, use proper hashing)
      if (clientData.password !== signinForm.password) {
        setError('Invalid password');
        return;
      }

      // Check if client has access to this project
      const clientProjects = clientData.projects || [];
      if (!clientProjects.includes(projectId)) {
        // Add project to client's projects if it's public access
        if (isPublic) {
          await updateDoc(doc(db, 'clients', clientDoc.id), {
            projects: [...clientProjects, projectId],
          });
        } else {
          setError('You do not have access to this project');
          return;
        }
      }

      // Store client session
      localStorage.setItem('clientId', clientDoc.id);
      localStorage.setItem('clientName', clientData.fullName);

      // Redirect to project portal
      router.push(`/client/${projectId}`);
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Error signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate form
    const errors: typeof formErrors = {};
    
    if (!signupForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!signupForm.password) {
      errors.password = 'Password is required';
    } else if (signupForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (!signupForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        setFormErrors({ general: 'Service not available' });
        return;
      }

      console.log('Checking if email already exists:', signupForm.email);
      
      // Check if email already exists
      const clientsRef = collection(db, 'clients');
      const emailQuery = query(clientsRef, where('email', '==', signupForm.email));
      
      try {
        const emailSnapshot = await getDocs(emailQuery);
        console.log('Email check completed, empty:', emailSnapshot.empty);

        if (!emailSnapshot.empty) {
          setFormErrors({ general: 'An account with this email already exists. Please sign in instead.' });
          return;
        }
      } catch (emailCheckError) {
        console.error('Error checking email:', emailCheckError);
        setFormErrors({ general: 'Error checking email availability. Please try again.' });
        return;
      }

      // Create client account
      const clientData = {
        name: signupForm.email.split('@')[0], // Use email prefix as name
        fullName: signupForm.email.split('@')[0], // Keep for compatibility
        email: signupForm.email,
        password: signupForm.password, // In production, hash this password
        projects: [projectId],
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      console.log('Attempting to create client account with data:', clientData);
      
      let clientRef;
      try {
        clientRef = await addDoc(collection(db, 'clients'), clientData);
        console.log('Client account created successfully with ID:', clientRef.id);
      } catch (clientCreationError) {
        console.error('Error creating client account:', clientCreationError);
        setFormErrors({ general: 'Error creating client account. Please try again.' });
        return;
      }

      // Update invite status (only for non-public access)
      if (invite && !isPublic) {
        await updateDoc(doc(db, 'client_invites', invite.id), {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
          clientId: clientRef.id,
        });
      }

      // For public access, create a public access record
      if (isPublic) {
        try {
          await addDoc(collection(db, 'public_access'), {
            projectId,
            clientId: clientRef.id,
            clientEmail: signupForm.email,
            clientName: clientData.fullName,
            accessType: 'public_signup',
            createdAt: new Date(),
            status: 'active',
          });
        } catch (publicAccessError) {
          console.error('Error creating public access record:', publicAccessError);
          // Continue even if this fails
        }
      }

      // Store client session
      localStorage.setItem('clientId', clientRef.id);
      localStorage.setItem('clientName', clientData.fullName);

      // Redirect to project portal
      router.push(`/client/${projectId}`);
    } catch (err) {
      console.error('Error creating client account:', err);
      setFormErrors({ general: 'Error creating account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {isPublic ? 'Public Project Access' : 'Project Invitation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project && (
                <>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">
                        {project.title.es || project.title.en || project.title.pt}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {project.eventType} Event
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{project.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Event Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(project.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Badge variant="outline" className="mb-2">
                      {isPublic ? 'Public Access' : project.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {isPublic 
                        ? 'This project is publicly accessible. Create your account to view project updates, download files, and communicate with the team.'
                        : 'You\'re being invited to access the client portal for this project. Create your account to view project updates, download files, and communicate with the team.'
                      }
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Signup/Signin Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {isSignIn ? 'Sign In to Your Account' : 'Create Account'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isPublic 
                  ? isSignIn 
                    ? 'Sign in to access this public project'
                    : 'Create your account to access this public project'
                  : 'Create your account to access your project'
                }
              </p>
            </CardHeader>
            <CardContent>

              
              {/* Toggle for public access */}
              {isPublic && (
                <div className="mb-4">
                  <div className="flex rounded-lg border p-1">
                    <button
                      type="button"
                      onClick={() => setIsSignIn(false)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        !isSignIn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSignIn(true)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isSignIn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {isSignIn ? (
                <form onSubmit={handleSignin} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signinForm.email}
                      onChange={(e) => setSigninForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signinForm.password}
                        onChange={(e) => setSigninForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                {/* General error message */}
                {formErrors.general && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formErrors.general}</AlertDescription>
                  </Alert>
                )}
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    className={formErrors.email ? 'border-destructive' : ''}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      className={formErrors.password ? 'border-destructive' : ''}
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
                  {formErrors.password && (
                    <p className="text-sm text-destructive mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={formErrors.confirmPassword ? 'border-destructive' : ''}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 