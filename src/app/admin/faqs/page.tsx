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
  Edit,
  Trash2,
  GripVertical,
  Globe,
  HelpCircle,
  Loader2,
  Save,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

interface FAQ {
  id: string;
  question: {
    en: string;
    es: string;
    he: string;
  };
  answer: {
    en: string;
    es: string;
    he: string;
  };
  category?: string;
  order: number;
  published: boolean;
  createdAt: { toDate: () => Date } | null;
  updatedAt: { toDate: () => Date } | null;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
];

const FAQ_CATEGORIES = [
  'General',
  'Servicios',
  'Precios',
  'Proceso',
  'Técnico',
  'Entrega',
  'Otro',
];

export default function FAQsAdminPage() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFAQ, setEditFAQ] = useState<FAQ | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('es'); // Default to Spanish
  const [submitLoading, setSubmitLoading] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    question: { en: '', es: '', he: '' },
    answer: { en: '', es: '', he: '' },
    category: 'General',
    published: true,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    question: { en: '', es: '', he: '' },
    answer: { en: '', es: '', he: '' },
    category: 'General',
    published: true,
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    categories: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    if (!user) return;
    loadFAQs();
  }, [user]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const faqsQuery = query(collection(db, 'faqs'), orderBy('order', 'asc'));
      const snapshot = await getDocs(faqsQuery);
      const faqList: FAQ[] = [];

      snapshot.forEach(doc => {
        faqList.push({ id: doc.id, ...doc.data() } as FAQ);
      });

      setFaqs(faqList);

      // Calculate stats
      const categories = new Set(faqList.map(faq => faq.category)).size;
      const published = faqList.filter(faq => faq.published).length;
      const now = new Date();
      const thisMonth = faqList.filter(faq => {
        const createdAt = faq.createdAt?.toDate();
        return (
          createdAt &&
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        );
      }).length;

      setStats({
        total: faqList.length,
        published,
        categories,
        thisMonth,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      setError('Error al cargar las preguntas frecuentes');
      setLoading(false);
    }
  };

  const handleCreateFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitLoading(true);
    setError('');

    try {
      const maxOrder = Math.max(...faqs.map(faq => faq.order), 0);

      await addDoc(collection(db, 'faqs'), {
        question: createForm.question,
        answer: createForm.answer,
        category: createForm.category,
        order: maxOrder + 1,
        published: createForm.published,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess('Pregunta frecuente creada exitosamente!');
      setCreateForm({
        question: { en: '', es: '', he: '' },
        answer: { en: '', es: '', he: '' },
        category: 'General',
        published: true,
      });

      setTimeout(() => {
        setCreateDialogOpen(false);
        setSuccess('');
        loadFAQs();
      }, 2000);
    } catch (error) {
      console.error('Error creating FAQ:', error);
      setError('Error al crear la pregunta frecuente');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editFAQ) return;

    setSubmitLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'faqs', editFAQ.id), {
        question: editForm.question,
        answer: editForm.answer,
        category: editForm.category,
        published: editForm.published,
        updatedAt: serverTimestamp(),
      });

      setSuccess('Pregunta frecuente actualizada exitosamente!');

      setTimeout(() => {
        setEditDialogOpen(false);
        setEditFAQ(null);
        setSuccess('');
        loadFAQs();
      }, 2000);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      setError('Error al actualizar la pregunta frecuente');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteFAQ = async (faq: FAQ) => {
    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar esta pregunta frecuente?\n\n"${faq.question.es || faq.question.en}"`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'faqs', faq.id));
      setSuccess('Pregunta frecuente eliminada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
      loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setError('Error al eliminar la pregunta frecuente');
    }
  };

  const openEditDialog = (faq: FAQ) => {
    setEditFAQ(faq);
    setEditForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      published: faq.published,
    });
    setEditDialogOpen(true);
  };

  const getTranslationStatus = (item: {
    en: string;
    es: string;
    he: string;
  }) => {
    const translations = [
      { lang: 'es', text: item.es },
      { lang: 'en', text: item.en },
      { lang: 'he', text: item.he },
    ];

    const completed = translations.filter(t => t.text.trim() !== '').length;
    return {
      completed,
      total: 3,
      percentage: Math.round((completed / 3) * 100),
    };
  };

  if (loading) {
    return (
      <AdminLayout title="Preguntas Frecuentes">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Preguntas Frecuentes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Preguntas Frecuentes
            </h1>
            <p className="text-muted-foreground">
              Gestiona las preguntas y respuestas más comunes de tus usuarios
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Pregunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Pregunta Frecuente</DialogTitle>
                <DialogDescription>
                  Agrega una nueva pregunta y respuesta para ayudar a tus
                  usuarios.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateFAQ} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Language Selector */}
                <div className="flex items-center space-x-2">
                  <Label>Idioma de Edición:</Label>
                  <Select
                    value={currentLanguage}
                    onValueChange={setCurrentLanguage}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Question */}
                <div className="space-y-2">
                  <Label htmlFor={`question-${currentLanguage}`}>
                    Pregunta (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                  </Label>
                  <Input
                    id={`question-${currentLanguage}`}
                    value={
                      createForm.question[
                        currentLanguage as keyof typeof createForm.question
                      ]
                    }
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        question: {
                          ...prev.question,
                          [currentLanguage]: e.target.value,
                        },
                      }))
                    }
                    placeholder="¿Qué tipo de eventos cubren?"
                    required={currentLanguage === 'es'} // Spanish required
                  />
                </div>

                {/* Answer */}
                <div className="space-y-2">
                  <Label htmlFor={`answer-${currentLanguage}`}>
                    Respuesta (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                  </Label>
                  <Textarea
                    id={`answer-${currentLanguage}`}
                    value={
                      createForm.answer[
                        currentLanguage as keyof typeof createForm.answer
                      ]
                    }
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        answer: {
                          ...prev.answer,
                          [currentLanguage]: e.target.value,
                        },
                      }))
                    }
                    placeholder="Cubrimos todo tipo de eventos: bodas, cumpleaños, eventos corporativos..."
                    rows={4}
                    required={currentLanguage === 'es'} // Spanish required
                  />
                </div>

                {/* Category and Published */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                      value={createForm.category}
                      onValueChange={value =>
                        setCreateForm(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FAQ_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={createForm.published}
                        onChange={e =>
                          setCreateForm(prev => ({
                            ...prev,
                            published: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="published" className="text-sm">
                        Publicado
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitLoading}>
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Crear Pregunta
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={submitLoading}
                  >
                    Cancelar
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
                Total Preguntas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* FAQs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Lista de Preguntas Frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {faqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay preguntas frecuentes
                </h3>
                <p className="text-muted-foreground">
                  Crea tu primera pregunta frecuente para ayudar a los usuarios
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  const questionTranslation = getTranslationStatus(
                    faq.question
                  );
                  const answerTranslation = getTranslationStatus(faq.answer);

                  return (
                    <div
                      key={faq.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <Badge
                              variant={faq.published ? 'default' : 'secondary'}
                            >
                              {faq.published ? 'Publicado' : 'Borrador'}
                            </Badge>
                            <Badge variant="outline">{faq.category}</Badge>
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>

                          <h3 className="font-semibold text-foreground mb-1">
                            {faq.question.es ||
                              faq.question.en ||
                              faq.question.he ||
                              'Sin título'}
                          </h3>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {faq.answer.es ||
                              faq.answer.en ||
                              faq.answer.he ||
                              'Sin respuesta'}
                          </p>

                          {/* Translation Status */}
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Globe className="w-3 h-3" />
                              <span>
                                Pregunta: {questionTranslation.completed}/3
                                idiomas
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Globe className="w-3 h-3" />
                              <span>
                                Respuesta: {answerTranslation.completed}/3
                                idiomas
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(faq)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteFAQ(faq)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Pregunta Frecuente</DialogTitle>
              <DialogDescription>
                Modifica la pregunta y respuesta existente.
              </DialogDescription>
            </DialogHeader>

            {editFAQ && (
              <form onSubmit={handleEditFAQ} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Language Selector */}
                <div className="flex items-center space-x-2">
                  <Label>Idioma de Edición:</Label>
                  <Select
                    value={currentLanguage}
                    onValueChange={setCurrentLanguage}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Question */}
                <div className="space-y-2">
                  <Label htmlFor={`edit-question-${currentLanguage}`}>
                    Pregunta (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                  </Label>
                  <Input
                    id={`edit-question-${currentLanguage}`}
                    value={
                      editForm.question[
                        currentLanguage as keyof typeof editForm.question
                      ]
                    }
                    onChange={e =>
                      setEditForm(prev => ({
                        ...prev,
                        question: {
                          ...prev.question,
                          [currentLanguage]: e.target.value,
                        },
                      }))
                    }
                    placeholder="¿Qué tipo de eventos cubren?"
                  />
                </div>

                {/* Answer */}
                <div className="space-y-2">
                  <Label htmlFor={`edit-answer-${currentLanguage}`}>
                    Respuesta (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                  </Label>
                  <Textarea
                    id={`edit-answer-${currentLanguage}`}
                    value={
                      editForm.answer[
                        currentLanguage as keyof typeof editForm.answer
                      ]
                    }
                    onChange={e =>
                      setEditForm(prev => ({
                        ...prev,
                        answer: {
                          ...prev.answer,
                          [currentLanguage]: e.target.value,
                        },
                      }))
                    }
                    placeholder="Cubrimos todo tipo de eventos..."
                    rows={4}
                  />
                </div>

                {/* Category and Published */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                      value={editForm.category}
                      onValueChange={value =>
                        setEditForm(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FAQ_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="edit-published"
                        checked={editForm.published}
                        onChange={e =>
                          setEditForm(prev => ({
                            ...prev,
                            published: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="edit-published" className="text-sm">
                        Publicado
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitLoading}>
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    disabled={submitLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
