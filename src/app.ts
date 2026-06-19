import express from "express";
import { healthRouter } from "./routes/health.routes";
import { usageRouter } from "./routes/usage.routes";

export const app = express();

app.use(express.json());
app.use(healthRouter);
app.use(usageRouter);
