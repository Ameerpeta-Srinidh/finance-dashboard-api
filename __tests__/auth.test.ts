import request from "supertest";
import app from "../src/app";

describe("Auth Endpoints", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("test@example.com");
    expect(res.body.data.role).toBe("VIEWER");
    expect(res.body.data).not.toHaveProperty("password");
  });

  it("should not allow duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Another User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
  });

  it("should allow the first registered user to bootstrap as admin", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bootstrap Admin",
      email: "admin@example.com",
      password: "password123",
      role: "ADMIN",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe("ADMIN");
  });

  it("should downgrade later admin registration requests to viewer", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Bootstrap Admin",
      email: "admin@example.com",
      password: "password123",
      role: "ADMIN",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email: "second@example.com",
      password: "password123",
      role: "ADMIN",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe("VIEWER");
  });

  it("should login successfully and return token", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe("test@example.com");
  });
});
