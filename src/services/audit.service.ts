import { prisma } from "../utils/prisma";

export const logAction = async (
    userId: string,
    action: string,
    resourceId: string,
    details?: any
) => {
    prisma.auditLog.create({
        data:{
            userId,
            action,
            resourceId,
            details: details ? JSON.stringify(details) : null,
        },
    }).catch(err=> console.error("Audit log failed:", err));
};