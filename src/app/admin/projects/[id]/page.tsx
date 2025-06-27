'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const resolvedParams = await params;
      // Redirect to unified edit form
      router.replace(`/admin/projects/${resolvedParams.id}/edit`);
    };
    redirect();
  }, [params, router]);

  return null;
}
