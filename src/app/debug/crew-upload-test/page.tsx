'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  testFirebaseStorage,
  testFileUploadService,
} from '@/lib/firebase-test';
import { FileUploadService } from '@/services/file-upload';

export default function CrewUploadTestPage() {
  const [testResults, setTestResults] = useState<{
    storage: boolean | null;
    uploadService: boolean | null;
    uploadTest: boolean | null;
  }>({
    storage: null,
    uploadService: null,
    uploadTest: null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const runTests = async () => {
    console.log('🧪 Running Firebase tests...');

    // Test Firebase Storage
    const storageOk = await testFirebaseStorage();
    setTestResults(prev => ({ ...prev, storage: storageOk }));

    // Test File Upload Service
    const uploadServiceOk = await testFileUploadService();
    setTestResults(prev => ({ ...prev, uploadService: uploadServiceOk }));

    // Test Firebase Storage directly
    try {
      const { getStorageService } = await import('@/lib/firebase');
      const storage = await getStorageService();
      console.log('🔍 Direct storage test:', storage);

      if (storage) {
        console.log('✅ Firebase Storage is available directly');
      } else {
        console.log('❌ Firebase Storage is not available directly');
      }
    } catch (error) {
      console.error('❌ Direct storage test failed:', error);
    }
  };

  const testFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🎯 testFileUpload called');
    console.log('Event:', event);
    console.log('Files:', event.target.files);

    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📁 File selected:', file);
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0);

    try {
      const fileUploadService = new FileUploadService();

      // Validate file
      const validation = fileUploadService.validateFile(
        file,
        fileUploadService.getConfigForFileType('image')
      );
      console.log('Validation result:', validation);

      if (!validation.isValid) {
        setUploadError(validation.errors.join(', '));
        return;
      }

      // Upload to Firebase Storage
      const fileName = `test-uploads/${Date.now()}-${file.name}`;
      console.log('Uploading to:', fileName);

      const result = await fileUploadService.uploadFile(
        file,
        fileName,
        fileUploadService.getConfigForFileType('image'),
        progress => {
          console.log('Progress:', progress.percentage + '%');
          setUploadProgress(progress.percentage);
        }
      );

      console.log('Upload result:', result);

      if (result.success && result.data) {
        setUploadSuccess(`File uploaded successfully! URL: ${result.data.url}`);
        setTestResults(prev => ({ ...prev, uploadTest: true }));
      } else {
        setUploadError(result.error || 'Error al subir la imagen');
        setTestResults(prev => ({ ...prev, uploadTest: false }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Error inesperado al subir la imagen');
      setTestResults(prev => ({ ...prev, uploadTest: false }));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const simpleFileTest = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 Simple file test called');
    console.log('Event:', event);
    console.log('Files:', event.target.files);

    const file = event.target.files?.[0];
    if (file) {
      console.log('✅ File selected in simple test:', file.name);
      alert(`File selected: ${file.name} (${file.size} bytes, ${file.type})`);
    } else {
      console.log('❌ No file in simple test');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Crew Member Photo Upload Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Firebase Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} className="w-full">
            Run Firebase Tests
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Firebase Storage:</span>
              {testResults.storage === null && (
                <span className="text-muted-foreground">Not tested</span>
              )}
              {testResults.storage === true && (
                <span className="text-green-600">✅ Available</span>
              )}
              {testResults.storage === false && (
                <span className="text-red-600">❌ Not available</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span>File Upload Service:</span>
              {testResults.uploadService === null && (
                <span className="text-muted-foreground">Not tested</span>
              )}
              {testResults.uploadService === true && (
                <span className="text-green-600">✅ Available</span>
              )}
              {testResults.uploadService === false && (
                <span className="text-red-600">❌ Not available</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span>File Upload Test:</span>
              {testResults.uploadTest === null && (
                <span className="text-muted-foreground">Not tested</span>
              )}
              {testResults.uploadTest === true && (
                <span className="text-green-600">✅ Success</span>
              )}
              {testResults.uploadTest === false && (
                <span className="text-red-600">❌ Failed</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simple File Input Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={simpleFileTest}
              className="hidden"
              id="simple-test-upload"
            />
            <label htmlFor="simple-test-upload" className="cursor-pointer">
              <Button type="button" variant="outline">
                Simple File Test
              </Button>
            </label>
            <p className="text-sm text-muted-foreground mt-2">
              Test basic file selection (no upload)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test File Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadError && (
            <Alert variant="destructive">
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadSuccess && (
            <Alert>
              <AlertDescription>{uploadSuccess}</AlertDescription>
            </Alert>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Uploading...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={testFileUpload}
              className="hidden"
              id="test-upload"
              disabled={uploading}
            />
            <label htmlFor="test-upload" className="cursor-pointer">
              <Button type="button" variant="outline" disabled={uploading}>
                Select Test Image
              </Button>
            </label>
            <p className="text-sm text-muted-foreground mt-2">
              Select an image file to test upload functionality
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
