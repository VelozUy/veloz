'use client';

import ClientInviteManager from '@/components/admin/ClientInviteManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientInviteTestPage() {
  const testPublicLink =
    'http://localhost:3001/client/signup?project=test-project-123&public=true';

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Client Invite Manager Test</h1>
      <p className="mb-4">
        This page tests the ClientInviteManager component with a sample project.
      </p>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Generate Public Link</h3>
                <p className="text-sm text-muted-foreground">
                  Click &quot;Generate Public Link&quot; in the Client Invite
                  Manager below. This will create a public access link and
                  display it with copy/test buttons.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Test Public Link</h3>
                <p className="text-sm text-muted-foreground">
                  Use the generated link to test the sign up/sign in flow. The
                  link should allow both new user registration and existing user
                  sign-in.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Manual Test Link</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Or use this test link directly:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={testPublicLink}
                    readOnly
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  <Button
                    onClick={() =>
                      navigator.clipboard.writeText(testPublicLink)
                    }
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ClientInviteManager
        projectId="test-project-123"
        projectTitle="Test Project"
      />
    </div>
  );
}
