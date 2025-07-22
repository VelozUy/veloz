'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        setError('Servicio no disponible');
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
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      setSuccess('Enlace público generado exitosamente');
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error generating public link:', err);
      setError('Error al generar enlace público');
    }
  };

  const revokePublicLink = async (linkId: string) => {
    if (!confirm('¿Estás seguro de que quieres revocar este enlace?')) return;
    
    try {
      const db = await getFirestoreService();
      if (!db) return;

      await deleteDoc(doc(db, 'public_access', linkId));
      setSuccess('Enlace público revocado exitosamente');
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error revoking link:', err);
      setError('Error al revocar enlace');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copiado al portapapeles');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError('Error al copiar al portapapeles');
    }
  };

  const exportClientList = () => {
    try {
      // Create CSV content
      const headers = ['Nombre', 'Email', 'Fecha de Registro', 'Último Acceso', 'Estado'];
      const csvContent = [
        headers.join(','),
        ...clientSignups.map(client => [
          `"${client.name}"`,
          `"${client.email}"`,
          `"${client.signupDate ? client.signupDate.toDate().toLocaleDateString() : 'N/A'}"`,
          `"${client.lastLogin ? client.lastLogin.toDate().toLocaleDateString() : 'Nunca'}"`,
          `"${client.status}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `lista-clientes-${projectTitle}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess('Lista de clientes exportada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error exporting client list:', err);
      setError('Error al exportar lista de clientes');
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
            <span>Registros de Clientes</span>
            <Badge variant="secondary">{clientSignups.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="public-links" className="flex items-center space-x-2">
            <Link className="w-4 h-4" />
            <span>Enlaces Públicos</span>
            <Badge variant="secondary">{publicLinks.length}</Badge>
          </TabsTrigger>
        </TabsList>

            {/* Client Signups Tab */}
            <TabsContent value="signups" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Registros de Clientes</h3>
                <p className="text-sm text-muted-foreground">
                  Rastrea qué clientes han creado cuentas para este proyecto. Estos emails serán visibles para todos los clientes en su página de portal.
                </p>
              </div>

              {/* Search and Export */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clientes..."
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
                  Exportar Lista de Clientes
                </Button>
              </div>

              {/* Signups Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientSignups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No hay registros de clientes</h3>
                          <p className="text-muted-foreground">
                            Los clientes aparecerán aquí una vez que creen cuentas para este proyecto
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
                            {client.lastLogin ? client.lastLogin.toDate().toLocaleDateString() : 'Nunca'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                              {client.status === 'active' ? 'Activo' : 'Inactivo'}
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
                  <h3 className="text-lg font-semibold">Enlaces de Acceso Público</h3>
                  <p className="text-sm text-muted-foreground">
                    Gestiona enlaces públicos para el registro de clientes en este proyecto. Cualquiera con estos enlaces puede crear cuentas.
                  </p>
                </div>
                <Button onClick={generatePublicLink}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generar Nuevo Enlace
                </Button>
              </div>

              {/* Links Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enlace</TableHead>
                      <TableHead>Fecha de Creación</TableHead>
                      <TableHead>Contador de Uso</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPublicLinks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Link className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No hay enlaces públicos</h3>
                          <p className="text-muted-foreground">
                            Genera un enlace público para permitir registros de clientes para este proyecto
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
                              {link.status === 'active' ? 'Activo' : 'Revocado'}
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