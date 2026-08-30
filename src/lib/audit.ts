import prisma from './db';

export async function logAuditEvent({
  userId,
  userName = 'System Admin',
  role,
  action,
  entity,
  entityId,
  ipAddress,
  details,
}: {
  userId?: string;
  userName?: string;
  role?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  details?: Record<string, any> | string;
}) {
  try {
    const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;
    return await prisma.auditLog.create({
      data: {
        userId,
        userName,
        role,
        action,
        entity,
        entityId,
        ipAddress,
        details: detailsString,
      },
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}
