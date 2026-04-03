import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Dashboard API",
      version: "1.0.0",
      description: "REST API for authentication, finance transactions, user management, and analytics.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", format: "email", example: "jane@example.com" },
            password: { type: "string", example: "securepass123" },
            role: {
              type: "string",
              enum: ["VIEWER", "ANALYST", "ADMIN"],
              example: "VIEWER",
            },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@test.com" },
            password: { type: "string", example: "admin12345" },
          },
        },
        TransactionInput: {
          type: "object",
          required: ["amount", "type", "category", "date"],
          properties: {
            amount: { type: "number", example: 1200.5 },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            category: { type: "string", example: "Salary" },
            date: { type: "string", format: "date-time", example: "2026-04-01T00:00:00.000Z" },
            description: { type: "string", example: "Monthly salary" },
          },
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), "src/routes/*.ts"),
    path.join(process.cwd(), "dist/routes/*.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
