import { Role, UserStatus } from "../types/enums";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";

const buildToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  });

export const register = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  const totalUsers = await prisma.user.count();
  const requestedRole = data.role ?? Role.VIEWER;
  const assignedRole =
    totalUsers === 0 && requestedRole === Role.ADMIN ? Role.ADMIN : Role.VIEWER;

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name.trim(),
      password: hashedPassword,
      role: assignedRole,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user || user.status === UserStatus.INACTIVE) {
    throw new AppError("Invalid credentials", 401);
  }

  const validPassword = await bcrypt.compare(data.password, user.password);

  if (!validPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  return {
    token: buildToken(user.id, user.role),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};
