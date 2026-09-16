import crypto from 'node:crypto';
import { query } from './db.js';

export interface AuditEventParams {
  actorUserId?: string | null;
  action: string;
  objectType: string;
  objectId?: string | null;
  metadata?: Record<string, any>;
}

export async function recordAuditEvent(params: AuditEventParams): Promise<string> {
  const id = crypto.randomUUID();
  const actorUserId = params.actorUserId || null;
  const objectId = params.objectId || null;
  const metadata = params.metadata || {};

  try {
    await query(
      `INSERT INTO audit_events (id, actor_user_id, action, object_type, object_id, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())`,
      [id, actorUserId, params.action, params.objectType, objectId, JSON.stringify(metadata)]
    );
  } catch (err: any) {
    // Non-fatal fallback if DB offline or in testing mode
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Audit Logger] Could not persist audit event ${params.action}:`, err.message);
    }
  }

  return id;
}
