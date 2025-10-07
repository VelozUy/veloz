import { NextRequest, NextResponse } from 'next/server';
import {
  initFirebaseAdmin,
  verifyAdminFromRequest,
} from '@/app/api/_utils/firebase-admin';
import {
  getOrCreateExportLinkDrive,
  revokeExportLinkDrive,
} from '@/lib/google/drive';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const admin = await verifyAdminFromRequest(req);
    const { db } = initFirebaseAdmin();
    const { code } = await params;

    const snap = await db.collection('projects').doc(code).get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const project = snap.data() as any;
    const exportId = project?.storage?.exportId;
    if (!exportId) {
      return NextResponse.json(
        { error: 'Project missing export folder reference' },
        { status: 400 }
      );
    }

    const link = await getOrCreateExportLinkDrive(exportId);
    const now = new Date().toISOString();
    await db
      .collection('projects')
      .doc(code)
      .set(
        {
          storage: { ...project.storage, exportLink: link.url },
          audit: [
            ...(project.audit || []),
            {
              action: 'export_link_ready',
              at: now,
              by: admin.email || 'admin',
            },
          ],
        },
        { merge: true }
      );

    return NextResponse.json({ success: true, link });
  } catch (e: any) {
    const msg = e?.message || 'Internal error';
    const status = /Unauthorized|Forbidden/.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const admin = await verifyAdminFromRequest(req);
    const { db } = initFirebaseAdmin();
    const { code } = await params;

    const snap = await db.collection('projects').doc(code).get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const project = snap.data() as any;
    const exportId: string | undefined = project?.storage?.exportId;
    if (!exportId) {
      return NextResponse.json(
        { error: 'No export link to revoke' },
        { status: 400 }
      );
    }

    await revokeExportLinkDrive(exportId);

    const now = new Date().toISOString();
    await db
      .collection('projects')
      .doc(code)
      .set(
        {
          storage: { ...project.storage, exportLink: null },
          audit: [
            ...(project.audit || []),
            {
              action: 'export_link_revoked',
              at: now,
              by: admin.email || 'admin',
            },
          ],
        },
        { merge: true }
      );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    const msg = e?.message || 'Internal error';
    const status = /Unauthorized|Forbidden/.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
