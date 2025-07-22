'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Link,
  Copy,
  Share2,
  Mail,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
  where,
  serverTimestamp,
} from 'firebase/firestore';

interface ClientInvite {
  id: string;
  projectId: string;
  projectTitle: string;
  inviteCode: string;
  inviteUrl: string;
  clientEmail?: string;
  clientName?: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: { toDate: () => Date } | null;
  acceptedAt?: { toDate: () => Date } | null;
  expiresAt: { toDate: () => Date } | null;
}

interface ClientInviteManagerProps {
  projectId: string;
  projectTitle: string;
}

export default function ClientInviteManager({
  projectId,
  projectTitle,
}: ClientInviteManagerProps) {
  const [invites, setInvites] = useState<ClientInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [publicLink, setPublicLink] = useState<string>('');
  const [newInvite, setNewInvite] = useState({
    clientEmail: '',
    clientName: '',
    customMessage: '',
  });

  useEffect(() => {
    loadInvites();
  }, [projectId]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        setError('Service not available');
        return;
      }

      const invitesRef = collection(db, 'client_invites');
      const q = query(
        invitesRef,
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const invitesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ClientInvite[];
      
      setInvites(invitesData);
    } catch (err) {
      console.error('Error loading invites:', err);
      setError('Error loading invites');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createInvite = async () => {
    try {
      const db = await getFirestoreService();
      if (!db) return;

      const inviteCode = generateInviteCode();
      const inviteUrl = `${window.location.origin}/client/signup?project=${projectId}&code=${inviteCode}`;
      
      const inviteData = {
        projectId,
        projectTitle,
        inviteCode,
        inviteUrl,
        clientEmail: newInvite.clientEmail || null,
        clientName: newInvite.clientName || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };

      await addDoc(collection(db, 'client_invites'), inviteData);
      
      // Reset form
      setNewInvite({
        clientEmail: '',
        clientName: '',
        customMessage: '',
      });
      setShowCreateDialog(false);
      
      // Reload invites
      loadInvites();
    } catch (err) {
      console.error('Error creating invite:', err);
      setError('Error creating invite');
    }
  };

  const copyInviteLink = async (inviteUrl: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const copyPublicLink = async () => {
    if (!publicLink) return;
    
    try {
      await navigator.clipboard.writeText(publicLink);
      alert('Public link copied to clipboard!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      alert('Failed to copy link. Please copy manually.');
    }
  };

  const shareInviteLink = async (inviteUrl: string, clientEmail?: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitation to ${projectTitle}`,
          text: `You've been invited to access your project portal. Click the link to sign up:`,
          url: inviteUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      copyInviteLink(inviteUrl);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to delete this invite?')) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;

      await deleteDoc(doc(db, 'client_invites', inviteId));
      loadInvites();
    } catch (err) {
      console.error('Error deleting invite:', err);
    }
  };

  const generatePublicLink = async () => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        setError('Firebase service not available');
        return;
      }

      // Create a public access link (no invite code required)
      const publicUrl = `${window.location.origin}/client/signup?project=${projectId}&public=true`;
      
      // Debug: log the generated URL
      console.log('Generated public URL:', publicUrl);
      console.log('Current origin:', window.location.origin);
      
      // Store the public link in state
      setPublicLink(publicUrl);
      
      try {
        // Store public access in Firestore for tracking
        const publicAccessData = {
          projectId,
          projectTitle,
          publicUrl,
          createdAt: new Date(), // Use regular Date instead of serverTimestamp for now
          accessType: 'public',
          status: 'active',
        };

        await addDoc(collection(db, 'public_access'), publicAccessData);
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        // Continue even if Firestore fails - the main functionality is copying the link
      }
      
      // Copy the public link to clipboard
      try {
        await navigator.clipboard.writeText(publicUrl);
        alert('Public link generated and copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        // Fallback: show the URL in an alert
        alert(`Public link generated: ${publicUrl}\n\nPlease copy this link manually.`);
      }
    } catch (err) {
      console.error('Error generating public link:', err);
      setError('Error generating public link');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-primary/10 text-primary';
      case 'pending':
        return 'bg-accent/10 text-accent-foreground';
      case 'expired':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return date.toDate().toLocaleDateString();
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
          <h2 className="text-xl font-bold">Client Invites</h2>
          <p className="text-muted-foreground">
            Manage client access to project portal
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Client Invite</DialogTitle>
              <DialogDescription>
                Generate an invite link for your client to access the project portal.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientEmail">Client Email (Optional)</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newInvite.clientEmail}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="client@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="clientName">Client Name (Optional)</Label>
                <Input
                  id="clientName"
                  value={newInvite.clientName}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Client Name"
                />
              </div>
              
              <div>
                <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                <Textarea
                  id="customMessage"
                  value={newInvite.customMessage}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder="Add a personal message to your client..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createInvite}>
                  Create Invite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invites List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Invites</CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <div className="text-center py-8">
              <Link className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No invites yet</h3>
              <p className="text-muted-foreground">
                Create your first invite to give clients access to the project portal
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map(invite => (
                <div key={invite.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">
                          {invite.clientName || invite.clientEmail || 'Anonymous Client'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {invite.clientEmail || 'No email provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(invite.status)}>
                        {getStatusIcon(invite.status)}
                        <span className="ml-1">{invite.status}</span>
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInviteLink(invite.inviteUrl)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shareInviteLink(invite.inviteUrl, invite.clientEmail)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(invite.inviteUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteInvite(invite.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">{formatDate(invite.createdAt)}</p>
                    </div>
                    
                    {invite.acceptedAt && (
                      <div>
                        <span className="font-medium">Accepted:</span>
                        <p className="text-muted-foreground">{formatDate(invite.acceptedAt)}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium">Expires:</span>
                      <p className="text-muted-foreground">{formatDate(invite.expiresAt)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-muted rounded text-xs font-mono break-all">
                    {invite.inviteUrl}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Public Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Public Access Link
          </CardTitle>
          <CardDescription>
            Anyone with this link can sign up or sign in to access this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {publicLink ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-md border">
                  <p className="text-sm font-mono break-all">{publicLink}</p>
                </div>
                <Button onClick={copyPublicLink} size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(publicLink, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link allows anyone to create an account or sign in to access this project.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">
                No public link generated yet. Click the button below to create one.
              </p>
              <Button onClick={generatePublicLink}>
                <Link className="w-4 h-4 mr-2" />
                Generate Public Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Mail className="w-4 h-4 mr-2" />
            Send Invite Email
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={generatePublicLink}
          >
            <Link className="w-4 h-4 mr-2" />
            Generate Public Link
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <User className="w-4 h-4 mr-2" />
            View Client Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 