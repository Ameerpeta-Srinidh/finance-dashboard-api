import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import transactionRoutes from "./routes/transaction.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { sendSuccess } from "./utils/http";
import { swaggerSpec } from "./utils/swagger";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  sendSuccess(res, 200, {
    status: "ok",
    service: "finance-dashboard-api",
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Finance Dashboard API listening on port ${port}`);
  });
}

export default app;
