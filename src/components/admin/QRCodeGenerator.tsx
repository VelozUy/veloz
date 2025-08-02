'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Copy,
  QrCode,
  Eye,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import QRCodeGenerator, {
  QRCodeData,
  QRCodeOptions,
  QRCodeAnalytics,
} from '@/lib/qr-code';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
}

type WizardStep = 'type' | 'details' | 'options' | 'generate' | 'result';

export default function QRCodeGeneratorComponent() {
  const [wizardStep, setWizardStep] = useState<WizardStep>('type');
  const [qrType, setQrType] = useState<'project' | 'gallery' | 'custom' | ''>(
    ''
  );
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [qrOptions, setQrOptions] = useState<QRCodeOptions>({
    width: 256,
    margin: 2,
    color: {
      dark: 'hsl(var(--foreground))',
      light: 'hsl(var(--background))',
    },
    errorCorrectionLevel: 'M',
  });
  const [generatedQR, setGeneratedQR] = useState<QRCodeData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data - in real implementation, this would come from your database
  const projects: Project[] = [
    {
      id: '1',
      name: 'Wedding - Maria & Juan',
      slug: 'maria-juan-wedding',
      status: 'delivered',
    },
    {
      id: '2',
      name: 'Corporate Event - TechCorp',
      slug: 'techcorp-event',
      status: 'in-editing',
    },
    {
      id: '3',
      name: 'Photoshoot - Fashion Brand',
      slug: 'fashion-photoshoot',
      status: 'shooting-scheduled',
    },
  ];

  const galleryCategories: GalleryCategory[] = [
    { id: '1', name: 'Weddings', slug: 'casamientos' },
    { id: '2', name: 'Corporate Events', slug: 'eventos-corporativos' },
    { id: '3', name: 'Photoshoots', slug: 'sesiones-fotograficas' },
    { id: '4', name: 'Cultural Events', slug: 'eventos-culturales' },
  ];

  const generateProjectQR = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    setIsGenerating(true);
    try {
      const project = projects.find(p => p.id === selectedProject);
      if (!project) {
        toast.error('Project not found');
        return;
      }

      const qrData = await QRCodeGenerator.generateProjectQRCode(
        project.id,
        project.slug,
        qrOptions
      );

      const dataUrl = await QRCodeGenerator.generateQRCode(
        qrData.url,
        qrOptions
      );

      setGeneratedQR(qrData);
      setQrCodeDataUrl(dataUrl);
      toast.success('Project QR code generated successfully');
    } catch (error) {
      toast.error('Error generating QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateGalleryQR = async () => {
    if (!selectedCategory) {
      toast.error('Please select a gallery category');
      return;
    }

    setIsGenerating(true);
    try {
      const category = galleryCategories.find(c => c.id === selectedCategory);
      if (!category) {
        toast.error('Category not found');
        return;
      }

      const qrData = await QRCodeGenerator.generateGalleryQRCode(
        category.slug,
        qrOptions
      );

      const dataUrl = await QRCodeGenerator.generateQRCode(
        qrData.url,
        qrOptions
      );

      setGeneratedQR(qrData);
      setQrCodeDataUrl(dataUrl);
      toast.success('Gallery QR code generated successfully');
    } catch (error) {
      toast.error('Error generating QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomQR = async () => {
    if (!customUrl || !customName) {
      toast.error('Please enter both name and URL');
      return;
    }

    if (!QRCodeGenerator.validateQRCodeURL(customUrl)) {
      toast.error('Please enter a valid Veloz URL');
      return;
    }

    setIsGenerating(true);
    try {
      const qrData = await QRCodeGenerator.generateCustomQRCode(
        customName,
        customUrl,
        'project',
        'custom',
        qrOptions
      );

      const dataUrl = await QRCodeGenerator.generateQRCode(
        qrData.url,
        qrOptions
      );

      setGeneratedQR(qrData);
      setQrCodeDataUrl(dataUrl);
      toast.success('Custom QR code generated successfully');
    } catch (error) {
      toast.error('Error generating QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeDataUrl) {
      toast.error('No QR code to download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `${generatedQR?.name || 'qr-code'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded successfully');
    } catch (error) {
      toast.error('Error downloading QR code');
    }
  };

  const copyQRCodeURL = async () => {
    if (!generatedQR) {
      toast.error('No QR code URL to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedQR.url);
      toast.success('QR code URL copied to clipboard');
    } catch (error) {
      toast.error('Error copying URL');
    }
  };

  const handleNextStep = () => {
    switch (wizardStep) {
      case 'type':
        if (qrType) {
          setWizardStep('details');
        } else {
          toast.error('Please select a QR code type');
        }
        break;
      case 'details':
        if (
          (qrType === 'project' && selectedProject) ||
          (qrType === 'gallery' && selectedCategory) ||
          (qrType === 'custom' && customUrl && customName)
        ) {
          setWizardStep('options');
        } else {
          toast.error('Please fill in all required fields');
        }
        break;
      case 'options':
        setWizardStep('generate');
        break;
      case 'generate':
        handleGenerate();
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (wizardStep) {
      case 'details':
        setWizardStep('type');
        break;
      case 'options':
        setWizardStep('details');
        break;
      case 'generate':
        setWizardStep('options');
        break;
      case 'result':
        setWizardStep('generate');
        break;
    }
  };

  const handleGenerate = async () => {
    if (qrType === 'project') {
      await generateProjectQR();
    } else if (qrType === 'gallery') {
      await generateGalleryQR();
    } else if (qrType === 'custom') {
      await generateCustomQR();
    }

    if (generatedQR && qrCodeDataUrl) {
      setWizardStep('result');
    }
  };

  const resetWizard = () => {
    setWizardStep('type');
    setQrType('');
    setSelectedProject('');
    setSelectedCategory('');
    setCustomUrl('');
    setCustomName('');
    setGeneratedQR(null);
    setQrCodeDataUrl('');
  };

  const renderWizardStep = () => {
    switch (wizardStep) {
      case 'type':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Step 1: Choose QR Code Type
              </CardTitle>
              <CardDescription>
                Select what type of QR code you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    qrType === 'project'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setQrType('project')}
                >
                  <div className="text-center">
                    <QrCode className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">Project Album</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate QR codes for specific project albums
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    qrType === 'gallery'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setQrType('gallery')}
                >
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">Gallery Category</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate QR codes for gallery categories
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    qrType === 'custom'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setQrType('custom')}
                >
                  <div className="text-center">
                    <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">Custom URL</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate QR codes for custom Veloz URLs
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'details':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Step 2: Configure Details
              </CardTitle>
              <CardDescription>
                {qrType === 'project' && 'Select the project for your QR code'}
                {qrType === 'gallery' &&
                  'Select the gallery category for your QR code'}
                {qrType === 'custom' && 'Enter the custom URL details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrType === 'project' && (
                <div className="space-y-2">
                  <Label htmlFor="project">Select Project</Label>
                  <Select
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {qrType === 'gallery' && (
                <div className="space-y-2">
                  <Label htmlFor="category">Select Gallery Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a gallery category" />
                    </SelectTrigger>
                    <SelectContent>
                      {galleryCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {qrType === 'custom' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-name">Custom Name</Label>
                    <Input
                      id="custom-name"
                      placeholder="Enter a name for your QR code"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-url">Custom URL</Label>
                    <Input
                      id="custom-url"
                      placeholder="https://veloz.com.uy/..."
                      value={customUrl}
                      onChange={e => setCustomUrl(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Must be a valid Veloz URL
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'options':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Step 3: QR Code Options
              </CardTitle>
              <CardDescription>
                Customize the appearance of your QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (pixels)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={qrOptions.width}
                    onChange={e =>
                      setQrOptions({
                        ...qrOptions,
                        width: parseInt(e.target.value) || 256,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 256px for print, 512px for digital
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="margin">Margin</Label>
                  <Input
                    id="margin"
                    type="number"
                    value={qrOptions.margin}
                    onChange={e =>
                      setQrOptions({
                        ...qrOptions,
                        margin: parseInt(e.target.value) || 2,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    White space around the QR code
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'generate':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Step 4: Generate QR Code
              </CardTitle>
              <CardDescription>
                Review your settings and generate the QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Type:</strong> {qrType}
                  </div>
                  {qrType === 'project' && selectedProject && (
                    <div>
                      <strong>Project:</strong>{' '}
                      {projects.find(p => p.id === selectedProject)?.name}
                    </div>
                  )}
                  {qrType === 'gallery' && selectedCategory && (
                    <div>
                      <strong>Category:</strong>{' '}
                      {
                        galleryCategories.find(c => c.id === selectedCategory)
                          ?.name
                      }
                    </div>
                  )}
                  {qrType === 'custom' && (
                    <>
                      <div>
                        <strong>Name:</strong> {customName}
                      </div>
                      <div>
                        <strong>URL:</strong> {customUrl}
                      </div>
                    </>
                  )}
                  <div>
                    <strong>Size:</strong> {qrOptions.width}px
                  </div>
                  <div>
                    <strong>Margin:</strong> {qrOptions.margin}px
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'result':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Step 5: Your QR Code
              </CardTitle>
              <CardDescription>
                Your QR code has been generated successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedQR && qrCodeDataUrl ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <img
                      src={qrCodeDataUrl}
                      alt="Generated QR Code"
                      className="mx-auto border rounded-lg shadow-lg"
                      style={{
                        width: `${qrOptions.width}px`,
                        height: `${qrOptions.width}px`,
                      }}
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">QR Code Details</h4>
                    <div className="text-sm space-y-1">
                      <div>
                        <strong>Name:</strong> {generatedQR.name}
                      </div>
                      <div>
                        <strong>URL:</strong> {generatedQR.url}
                      </div>
                      <div>
                        <strong>Created:</strong>{' '}
                        {generatedQR.createdAt.toLocaleDateString()}
                      </div>
                      <div>
                        <strong>QR ID:</strong> {generatedQR.analytics.qrId}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={downloadQRCode} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={copyQRCodeURL}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generating QR code...</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  const renderWizardNavigation = () => {
    if (wizardStep === 'result') {
      return (
        <div className="flex justify-center">
          <Button onClick={resetWizard} className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Generate Another QR Code
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          disabled={wizardStep === 'type'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={handleNextStep}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {wizardStep === 'generate' ? (
            <>
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
              {!isGenerating && <QrCode className="h-4 w-4" />}
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    );
  };

  const renderWizardProgress = () => {
    const steps = [
      { key: 'type', label: 'Type', icon: QrCode },
      { key: 'details', label: 'Details', icon: CheckCircle },
      { key: 'options', label: 'Options', icon: Settings },
      { key: 'generate', label: 'Generate', icon: QrCode },
      { key: 'result', label: 'Result', icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(step => step.key === wizardStep);

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.key === wizardStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'border-success bg-success text-background'
                        : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    isActive
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-success'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-success' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
          <p className="text-muted-foreground">
            Create QR codes for projects, galleries, and custom URLs
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {renderWizardProgress()}
        {renderWizardStep()}
        <div className="mt-6">{renderWizardNavigation()}</div>
      </div>
    </div>
  );
}
