'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Link,
  Copy,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Search,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
  where,
  serverTimestamp,
} from 'firebase/firestore';

interface ClientSignup {
  id: string;
  email: string;
  name: string;
  signupDate: { toDate: () => Date } | null;
  lastLogin?: { toDate: () => Date } | null;
  status: 'active' | 'inactive';
  projectAccess: string[];
}

interface PublicLink {
  id: string;
  url: string;
  createdAt: { toDate: () => Date } | null;
  usageCount: number;
  status: 'active' | 'revoked';
}

interface ClientInviteManagerProps {
  projectId: string;
  projectTitle: string;
}

export default function ClientInviteManager({
  projectId,
  projectTitle,
}: ClientInviteManagerProps) {
  // State for each section
  const [clientSignups, setClientSignups] = useState<ClientSignup[]>([]);
  const [publicLinks, setPublicLinks] = useState<PublicLink[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('signups');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        setError('Service not available');
        return;
      }

      // Load client signups for this project
      const clientsRef = collection(db, 'clients');
      const clientsQuery = query(
        clientsRef, 
        where('projectAccess', 'array-contains', projectId),
        orderBy('signupDate', 'desc')
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      const clientsData = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ClientSignup[];
      setClientSignups(clientsData);

      // Load public links for this project
      const publicLinksRef = collection(db, 'public_access');
      const publicLinksQuery = query(
        publicLinksRef, 
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const publicLinksSnapshot = await getDocs(publicLinksQuery);
      const publicLinksData = publicLinksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PublicLink[];
      setPublicLinks(publicLinksData);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Public Link Management
  const generatePublicLink = async () => {
    try {
      const publicUrl = `${window.location.origin}/client/signup?project=${projectId}&public=true`;
      
      const db = await getFirestoreService();
      if (!db) return;

      const linkData = {
        url: publicUrl,
        projectId,
        createdAt: serverTimestamp(),
        usageCount: 0,
        status: 'active',
      };

      await addDoc(collection(db, 'public_access'), linkData);
      setSuccess('Public link generated successfully');
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error generating public link:', err);
      setError('Error generating public link');
    }
  };

  const revokePublicLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to revoke this link?')) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;

      await deleteDoc(doc(db, 'public_access', linkId));
      setSuccess('Public link revoked successfully');
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error revoking link:', err);
      setError('Error revoking link');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError('Failed to copy to clipboard');
    }
  };

  const exportClientList = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Signup Date', 'Last Login', 'Status'];
      const csvContent = [
        headers.join(','),
        ...clientSignups.map(client => [
          `"${client.name}"`,
          `"${client.email}"`,
          `"${client.signupDate ? client.signupDate.toDate().toLocaleDateString() : 'N/A'}"`,
          `"${client.lastLogin ? client.lastLogin.toDate().toLocaleDateString() : 'Never'}"`,
          `"${client.status}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `client-list-${projectTitle}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess('Client list exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error exporting client list:', err);
      setError('Failed to export client list');
    }
  };

  // Filter functions
  const filteredClientSignups = clientSignups.filter(client =>
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublicLinks = publicLinks.filter(link =>
    link.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Success/Error messages */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-primary/10 border border-primary text-primary rounded-md">
          <CheckCircle className="w-4 h-4 inline mr-2" />
          {success}
        </div>
      )}

            {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signups" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Client Signups</span>
            <Badge variant="secondary">{clientSignups.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="public-links" className="flex items-center space-x-2">
            <Link className="w-4 h-4" />
            <span>Public Links</span>
            <Badge variant="secondary">{publicLinks.length}</Badge>
          </TabsTrigger>
        </TabsList>

            {/* Client Signups Tab */}
            <TabsContent value="signups" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Client Signups</h3>
                <p className="text-sm text-muted-foreground">
                  Track which clients have created accounts for this project. These emails will be visible to all clients on their portal page.
                </p>
              </div>

              {/* Search and Export */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={exportClientList}
                  disabled={clientSignups.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Client List
                </Button>
              </div>

              {/* Signups Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Signup Date</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientSignups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No client signups</h3>
                          <p className="text-muted-foreground">
                            Clients will appear here once they create accounts for this project
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClientSignups.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>
                            {client.signupDate ? client.signupDate.toDate().toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {client.lastLogin ? client.lastLogin.toDate().toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Public Links Tab */}
            <TabsContent value="public-links" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Public Access Links</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage public links for client signup to this project. Anyone with these links can create accounts.
                  </p>
                </div>
                <Button onClick={generatePublicLink}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Link
                </Button>
              </div>

              {/* Links Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Link</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPublicLinks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Link className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No public links</h3>
                          <p className="text-muted-foreground">
                            Generate a public link to allow client signups for this project
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPublicLinks.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell className="font-mono text-sm">
                            {link.url}
                          </TableCell>
                          <TableCell>
                            {link.createdAt ? link.createdAt.toDate().toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>{link.usageCount}</TableCell>
                          <TableCell>
                            <Badge variant={link.status === 'active' ? 'default' : 'secondary'}>
                              {link.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(link.url)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(link.url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              {link.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => revokePublicLink(link.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

          </Tabs>
    </div>
  );
} 