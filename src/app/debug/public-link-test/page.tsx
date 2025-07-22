'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicLinkTestPage() {
  const testLinks = [
    {
      name: 'Test Project Public Link',
      url: 'http://localhost:3000/client/signup?project=test-project-123&public=true',
      description: 'This should show both Sign Up and Sign In options'
    },
    {
      name: 'Regular Invite Link (for comparison)',
      url: 'http://localhost:3000/client/signup?project=test-project-123&code=test-code',
      description: 'This should show only Sign Up (no toggle)'
    },
    {
      name: 'Public Link without project (should show error)',
      url: 'http://localhost:3000/client/signup?public=true',
      description: 'This should show an error because no project ID'
    },
    {
      name: 'Wrong Port Test (should not work)',
      url: 'http://localhost:3001/client/signup?project=test-project-123&public=true',
      description: 'This uses the wrong port (3001 instead of 3000)'
    }
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Public Link Test</h1>
      <p className="mb-6">Test the public link functionality with these pre-generated links:</p>
      
      <div className="space-y-4">
        {testLinks.map((link, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{link.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{link.description}</p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={link.url} 
                  readOnly 
                  className="flex-1 p-2 border rounded text-sm"
                />
                <Button 
                  onClick={() => navigator.clipboard.writeText(link.url)}
                  size="sm"
                >
                  Copy
                </Button>
                <Button 
                  onClick={() => window.open(link.url, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-muted border border-border rounded">
        <h3 className="font-medium mb-2">What to Look For:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ <strong>Public Link:</strong> Should show blue debug box + toggle buttons</li>
          <li>✅ <strong>Regular Link:</strong> Should show only signup form (no toggle)</li>
          <li>✅ <strong>Both:</strong> Should show project information on the left</li>
          <li>✅ <strong>Debug Info:</strong> Should show isPublic: true and isSignIn: false</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded">
        <h3 className="font-medium mb-2">If you see "Login failed":</h3>
        <ul className="text-sm space-y-1">
          <li>❌ You're seeing the Sign In form instead of Sign Up</li>
          <li>❌ Check if toggle buttons are visible</li>
          <li>❌ Check if debug box shows isSignIn: true</li>
          <li>❌ Click "Sign Up" button to switch to signup form</li>
        </ul>
      </div>
    </div>
  );
} 