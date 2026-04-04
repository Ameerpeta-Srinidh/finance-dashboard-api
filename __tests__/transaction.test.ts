import request from "supertest";
import app from "../src/app";

let adminToken = "";

beforeEach(async () => {
  await request(app).post("/api/auth/register").send({
    name: "Admin Tester",
    email: "admin@test.com",
    password: "password123",
    role: "ADMIN",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "password123",
  });

  adminToken = loginRes.body.data.token;
});

describe("Transaction Endpoints", () => {
  it("should block non-authenticated access", async () => {
    const res = await request(app).get("/api/transactions");
    expect(res.status).toBe(401);
  });

  it("should reject transaction creation for a viewer", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Viewer Tester",
      email: "viewer@test.com",
      password: "password123",
    });

    const viewerLoginRes = await request(app).post("/api/auth/login").send({
      email: "viewer@test.com",
      password: "password123",
    });

    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${viewerLoginRes.body.data.token}`)
      .send({
        amount: 500,
        type: "INCOME",
        category: "Freelance",
        date: new Date().toISOString(),
      });

    expect(res.status).toBe(403);
  });

  it("should create a new transaction if admin", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 500,
        type: "INCOME",
        category: "Freelance",
        date: new Date().toISOString(),
        description: "Test gig",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(500);
    expect(res.body.data.type).toBe("INCOME");
  });

  it("should fetch transactions correctly", async () => {
    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 250,
        type: "EXPENSE",
        category: "Groceries",
        date: new Date().toISOString(),
      });

    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].amount).toBe(250);
  });

  it("should update a transaction", async () => {
    const createRes = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 100,
        type: "EXPENSE",
        category: "Food",
        date: new Date().toISOString(),
      });

    const txId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/transactions/${txId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 200,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(200);
  });

  it("should soft delete a transaction", async () => {
    const createRes = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 175,
        type: "EXPENSE",
        category: "Bills",
        date: new Date().toISOString(),
      });

    const txId = createRes.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/transactions/${txId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.data.isDeleted).toBe(true);

    const listRes = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(0);
  });

  it("should filter transactions by category", async () => {
    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 100,
        type: "EXPENSE",
        category: "Groceries",
        date: new Date().toISOString(),
      });

    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 3000,
        type: "INCOME",
        category: "Salary",
        date: new Date().toISOString(),
      });

    const res = await request(app)
      .get("/api/transactions")
      .query({ category: "Groc" })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].category).toBe("Groceries");
  });
});
