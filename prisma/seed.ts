import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/utils/prisma";

async function main() {
  console.log("Resetting sample data...");
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();

  const [adminPassword, analystPassword, viewerPassword] = await Promise.all([
    bcrypt.hash("admin12345", 10),
    bcrypt.hash("analyst12345", 10),
    bcrypt.hash("viewer12345", 10),
  ]);

  console.log("Seeding users...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {
      name: "Finance Admin",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      email: "admin@test.com",
      password: adminPassword,
      name: "Finance Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@test.com" },
    update: {
      name: "Insights Analyst",
      password: analystPassword,
      role: "ANALYST",
      status: "ACTIVE",
    },
    create: {
      email: "analyst@test.com",
      password: analystPassword,
      name: "Insights Analyst",
      role: "ANALYST",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@test.com" },
    update: {
      name: "Read Only Viewer",
      password: viewerPassword,
      role: "VIEWER",
      status: "ACTIVE",
    },
    create: {
      email: "viewer@test.com",
      password: viewerPassword,
      name: "Read Only Viewer",
      role: "VIEWER",
      status: "ACTIVE",
    },
  });

  console.log("Seeding transactions...");
  await prisma.transaction.createMany({
    data: [
      {
        userId: admin.id,
        amount: 6400,
        type: "INCOME",
        category: "Salary",
        description: "January payroll",
        date: new Date("2026-01-03T09:00:00.000Z"),
      },
      {
        userId: admin.id,
        amount: 1850,
        type: "EXPENSE",
        category: "Rent",
        description: "Office lease payment",
        date: new Date("2026-01-05T09:00:00.000Z"),
      },
      {
        userId: admin.id,
        amount: 320,
        type: "EXPENSE",
        category: "Utilities",
        description: "Internet and electricity",
        date: new Date("2026-01-12T09:00:00.000Z"),
      },
      {
        userId: analyst.id,
        amount: 2400,
        type: "INCOME",
        category: "Consulting",
        description: "Monthly reporting retainer",
        date: new Date("2026-02-02T09:00:00.000Z"),
      },
      {
        userId: analyst.id,
        amount: 140,
        type: "EXPENSE",
        category: "Software",
        description: "Analytics subscriptions",
        date: new Date("2026-02-10T09:00:00.000Z"),
      },
      {
        userId: admin.id,
        amount: 430,
        type: "EXPENSE",
        category: "Travel",
        description: "Client meeting travel",
        date: new Date("2026-02-18T09:00:00.000Z"),
      },
      {
        userId: admin.id,
        amount: 6400,
        type: "INCOME",
        category: "Salary",
        description: "February payroll",
        date: new Date("2026-03-03T09:00:00.000Z"),
      },
      {
        userId: analyst.id,
        amount: 510,
        type: "EXPENSE",
        category: "Hardware",
        description: "Monitor replacement",
        date: new Date("2026-03-09T09:00:00.000Z"),
      },
      {
        userId: admin.id,
        amount: 275,
        type: "EXPENSE",
        category: "Groceries",
        description: "Team pantry restock",
        date: new Date("2026-03-14T09:00:00.000Z"),
      },
      {
        userId: analyst.id,
        amount: 3100,
        type: "INCOME",
        category: "Advisory",
        description: "Quarterly finance review",
        date: new Date("2026-04-01T09:00:00.000Z"),
      },
      {
        userId: admin.id,
        amount: 460,
        type: "EXPENSE",
        category: "Marketing",
        description: "Campaign reporting tools",
        date: new Date("2026-04-06T09:00:00.000Z"),
      },
      {
        userId: admin.id,
        amount: 6400,
        type: "INCOME",
        category: "Salary",
        description: "March payroll",
        date: new Date("2026-05-03T09:00:00.000Z"),
      },
      {
        userId: analyst.id,
        amount: 225,
        type: "EXPENSE",
        category: "Training",
        description: "Finance analytics workshop",
        date: new Date("2026-05-08T09:00:00.000Z"),
      },
      {
        userId: admin.id,
        amount: 1900,
        type: "EXPENSE",
        category: "Rent",
        description: "Office lease renewal",
        date: new Date("2026-05-12T09:00:00.000Z"),
      },
      {
        userId: analyst.id,
        amount: 2600,
        type: "INCOME",
        category: "Consulting",
        description: "Budget planning engagement",
        date: new Date("2026-06-04T09:00:00.000Z"),
      },
      {
        userId: admin.id,
        amount: 380,
        type: "EXPENSE",
        category: "Travel",
        description: "Regional planning session",
        date: new Date("2026-06-15T09:00:00.000Z"),
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@test.com / admin12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
