import request from "supertest";
import app from "../src/app";

const registerAndLogin = async ({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role?: "VIEWER" | "ANALYST" | "ADMIN";
}) => {
  await request(app).post("/api/auth/register").send({
    name,
    email,
    password,
    ...(role ? { role } : {}),
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email,
    password,
  });

  return loginRes.body.data.token as string;
};

describe("User Endpoints", () => {
  it("should allow an admin to list users", async () => {
    const adminToken = await registerAndLogin({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "ADMIN",
    });

    await registerAndLogin({
      name: "Viewer User",
      email: "viewer@test.com",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it("should block a non-admin from listing users", async () => {
    await registerAndLogin({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "ADMIN",
    });

    const viewerToken = await registerAndLogin({
      name: "Viewer User",
      email: "viewer@test.com",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });

  it("should allow an admin to update another user's role", async () => {
    const adminToken = await registerAndLogin({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "ADMIN",
    });

    await registerAndLogin({
      name: "Viewer User",
      email: "viewer@test.com",
      password: "password123",
    });

    const usersRes = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    const viewer = usersRes.body.data.find((user: any) => user.email === "viewer@test.com");

    const res = await request(app)
      .patch(`/api/users/${viewer.id}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "ANALYST" });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe("ANALYST");
  });

  it("should allow an admin to update another user's status", async () => {
    const adminToken = await registerAndLogin({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "ADMIN",
    });

    await registerAndLogin({
      name: "Viewer User",
      email: "viewer@test.com",
      password: "password123",
    });

    const usersRes = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    const viewer = usersRes.body.data.find((user: any) => user.email === "viewer@test.com");

    const res = await request(app)
      .patch(`/api/users/${viewer.id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "INACTIVE" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("INACTIVE");
  });
});
