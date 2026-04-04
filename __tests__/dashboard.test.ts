import request from "supertest";
import app from "../src/app";

let token = "";

beforeEach(async () => {
  await request(app).post("/api/auth/register").send({
    name: "Dashboard Tester",
    email: "dash@test.com",
    password: "password123",
    role: "ADMIN"
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "dash@test.com",
    password: "password123",
  });

  token = loginRes.body.data.token;

  await request(app).post("/api/transactions").set("Authorization", `Bearer ${token}`).send({ amount: 1000, type: "INCOME", category: "Salary", date: new Date().toISOString() });
  await request(app).post("/api/transactions").set("Authorization", `Bearer ${token}`).send({ amount: 300, type: "EXPENSE", category: "Groceries", date: new Date().toISOString() });
});

describe("Dashboard Endpoints", () => {
  it("should calculate summary correctly", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalIncome).toBe(1000);
    expect(res.body.data.totalExpense).toBe(300);
    expect(res.body.data.netBalance).toBe(700);
  });

  it("should calculate category breakdown correctly", async () => {
    const res = await request(app)
      .get("/api/dashboard/category-breakdown")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    
    const groceryCategory = res.body.data.find((c: any) => c.category === "Groceries");
    expect(groceryCategory.totalAmount).toBe(300);
  });

  it("should block viewers from accessing dashboard data", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Viewer Tester",
      email: "viewer@test.com",
      password: "password123",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "viewer@test.com",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${loginRes.body.data.token}`);

    expect(res.status).toBe(403);
  });
});
