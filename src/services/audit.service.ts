import { prisma } from "../utils/prisma";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export const logAction = async (
  userId: string,
  action: AuditAction,
  resourceId: string,
  details?: unknown,
) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceId,
      details: details ? JSON.stringify(details) : null,
    },
  });
};
