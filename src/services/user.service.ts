import { Role, UserStatus } from "../types/enums";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";
import { UpdateUserRoleInput, UpdateUserStatusInput } from "../validators/user.validator";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const ensureUserExists = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const ensureNotLastActiveAdmin = async (userId: string) => {
  const activeAdminCount = await prisma.user.count({
    where: {
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  if (activeAdminCount <= 1) {
    throw new AppError(
      "At least one active admin must remain in the system",
      400,
      { userId },
    );
  }
};

export const listUsers = async () =>
  prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: publicUserSelect,
  });

export const updateRole = async (
  targetUserId: string,
  payload: UpdateUserRoleInput,
  actorUserId: string,
) => {
  const targetUser = await ensureUserExists(targetUserId);

  if (targetUser.id === actorUserId) {
    throw new AppError("You cannot change your own role from this endpoint", 400);
  }

  if (targetUser.role === Role.ADMIN && payload.role !== Role.ADMIN) {
    await ensureNotLastActiveAdmin(targetUserId);
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data: { role: payload.role },
    select: publicUserSelect,
  });
};

export const updateStatus = async (
  targetUserId: string,
  payload: UpdateUserStatusInput,
  actorUserId: string,
) => {
  const targetUser = await ensureUserExists(targetUserId);

  if (targetUser.id === actorUserId) {
    throw new AppError("You cannot change your own status from this endpoint", 400);
  }

  if (
    targetUser.role === Role.ADMIN &&
    targetUser.status === UserStatus.ACTIVE &&
    payload.status === UserStatus.INACTIVE
  ) {
    await ensureNotLastActiveAdmin(targetUserId);
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data: { status: payload.status },
    select: publicUserSelect,
  });
};
