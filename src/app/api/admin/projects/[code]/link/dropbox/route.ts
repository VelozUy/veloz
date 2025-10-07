import { NextRequest, NextResponse } from 'next/server';
import {
  initFirebaseAdmin,
  verifyAdminFromRequest,
} from '@/app/api/_utils/firebase-admin';
import {
  getOrCreateExportLink,
  revokeSharedLink,
} from '@/lib/dropbox/projects';

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
    const rootPath = project?.storage?.rootPath;
    if (!rootPath) {
      return NextResponse.json(
        { error: 'Project missing Dropbox root path reference' },
        { status: 400 }
      );
    }

    const link = await getOrCreateExportLink(rootPath);
    const now = new Date().toISOString();
    await db
      .collection('projects')
      .doc(code)
      .set(
        {
          storage: {
            ...project.storage,
            exportLink: link.url,
            exportLinkId: link.id,
          },
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
    const linkId = project?.storage?.exportLinkId;
    if (!linkId) {
      return NextResponse.json(
        { error: 'No export link to revoke' },
        { status: 400 }
      );
    }

    await revokeSharedLink(linkId);

    const now = new Date().toISOString();
    await db
      .collection('projects')
      .doc(code)
      .set(
        {
          storage: { ...project.storage, exportLink: null, exportLinkId: null },
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
