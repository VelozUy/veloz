'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified form with 'new' as the ID to indicate creation mode
    router.replace('/admin/projects/new/form');
  }, [router]);

  return null;
}
