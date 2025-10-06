import { NextRequest, NextResponse } from 'next/server';
import {
  initFirebaseAdmin,
  verifyAdminFromRequest,
} from '@/app/api/_utils/firebase-admin';
import { makeProjectCode } from '@/lib/projects/project-code';
import { createProjectTree } from '@/lib/dropbox/projects';

type CreateProjectBody = {
  eventName: string;
  eventDate: string; // YYYY-MM-DD
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

    // Generate a unique project code
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

    // Create Dropbox folder tree
    const tree = await createProjectTree(projectCode);

    // Persist project
    const now = new Date().toISOString();
    const doc = {
      eventName: body.eventName,
      eventDate: body.eventDate,
      projectCode,
      storage: {
        provider: 'dropbox',
        rootPath: tree.root,
        exportPath: tree.exportPath,
      },
      status: 'initialized',
      createdAt: now,
      createdBy: admin.email || 'admin',
      audit: [
        { action: 'create', at: now, by: admin.email || 'admin' },
        { action: 'dropbox_tree_created', at: now, by: admin.email || 'admin' },
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
