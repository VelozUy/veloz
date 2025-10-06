import { NextRequest, NextResponse } from 'next/server';
import {
  initFirebaseAdmin,
  verifyAdminFromRequest,
} from '@/app/api/_utils/firebase-admin';
import { makeProjectCode } from '@/lib/projects/project-code';
import { createProjectTreeDrive } from '@/lib/google/drive';
import { createProjectTree } from '@/lib/dropbox/projects';

type CreateProjectBody = {
  eventName: string;
  eventDate: string; // YYYY-MM-DD
  provider?: 'gdrive' | 'dropbox'; // Default to gdrive for backward compatibility
};

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminFromRequest(req);
    const { db } = initFirebaseAdmin();

    const body = (await req.json()) as CreateProjectBody;
    if (!body?.eventName || !body?.eventDate) {
      return NextResponse.json(
        { error: 'eventName and eventDate are required' },
        { status: 400 }
      );
    }

    // Generate a temporary code with index 000 (uniqueness: check if exists, then increment index)
    let index = 1;
    let projectCode: string;
    while (true) {
      projectCode = makeProjectCode(body.eventName, body.eventDate, index);
      const existing = await db.collection('projects').doc(projectCode).get();
      if (!existing.exists) break;
      index++;
      if (index > 999) {
        return NextResponse.json(
          { error: 'Unable to generate unique project code' },
          { status: 500 }
        );
      }
    }

    // Determine storage provider (default to gdrive for backward compatibility)
    const provider = body.provider || 'gdrive';

    let storage: any;
    let auditAction: string;

    if (provider === 'dropbox') {
      // Create Dropbox folder tree
      const tree = await createProjectTree(projectCode);
      storage = {
        provider: 'dropbox',
        rootPath: tree.root,
        exportPath: tree.exportPath,
      };
      auditAction = 'dropbox_tree_created';
    } else {
      // Create Google Drive folder tree
      const tree = await createProjectTreeDrive(projectCode);
      storage = {
        provider: 'gdrive',
        rootId: tree.rootId,
        exportId: tree.exportId,
      };
      auditAction = 'gdrive_tree_created';
    }

    // Persist project
    const now = new Date().toISOString();
    const doc = {
      eventName: body.eventName,
      eventDate: body.eventDate,
      projectCode,
      storage,
      status: 'initialized',
      createdAt: now,
      createdBy: admin.email || 'admin',
      audit: [
        { action: 'create', at: now, by: admin.email || 'admin' },
        { action: auditAction, at: now, by: admin.email || 'admin' },
      ],
    };

    await db.collection('projects').doc(projectCode).set(doc, { merge: true });

    return NextResponse.json({ success: true, project: doc });
  } catch (e: any) {
    const msg = e?.message || 'Internal error';
    const status = /Unauthorized|Forbidden/.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
