import { prisma } from "../utils/prisma";

export const getSummary = async () => {
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "INCOME", isDeleted: false },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE", isDeleted: false },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalIncome = Number(income._sum.amount ?? 0);
  const totalExpense = Number(expense._sum.amount ?? 0);

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    incomeCount: income._count,
    expenseCount: expense._count,
  };
};

export const getCategoryBreakdown = async () => {
  const rows = await prisma.transaction.groupBy({
    by: ["category", "type"],
    where: { isDeleted: false },
    _sum: { amount: true },
    _count: true,
    orderBy: {
      category: "asc",
    },
  });

  return rows.map((row) => ({
    category: row.category,
    type: row.type,
    totalAmount: Number(row._sum.amount ?? 0),
    count: row._count,
  }));
};

export const getMonthlyTrends = async (year: number) => {
  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year}-12-31T23:59:59.999Z`);

  const rows = await prisma.transaction.findMany({
    where: {
      isDeleted: false,
      date: {
        gte: start,
        lte: end,
      },
    },
    select: {
      amount: true,
      type: true,
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const monthly = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    income: 0,
    expense: 0,
    net: 0,
  }));

  rows.forEach((row) => {
    const monthIndex = row.date.getUTCMonth();

    if (row.type === "INCOME") {
      monthly[monthIndex].income += Number(row.amount);
    } else {
      monthly[monthIndex].expense += Number(row.amount);
    }
  });

  return monthly.map((item) => ({
    ...item,
    net: item.income - item.expense,
  }));
};

export const getRecentActivity = async (limit = 10) =>
  prisma.transaction.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      date: true,
      description: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
