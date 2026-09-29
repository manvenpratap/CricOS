export interface AuditEventParams {
    actorUserId?: string | null;
    action: string;
    objectType: string;
    objectId?: string | null;
    metadata?: Record<string, any>;
}
export declare function recordAuditEvent(params: AuditEventParams): Promise<string>;
//# sourceMappingURL=audit.d.ts.map