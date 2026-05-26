import express from "express";
import { healthRouter } from "./routes/health";
import { ordersRouter } from "./routes/orders";
import { ticketsRouter } from "./routes/tickets";
import { paypalRouter } from "./routes/paypal";
import { errorHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  app.use(express.json());

  // cPanel Node.js apps can forward requests with or without the app URL
  // prefix depending on proxy setup. We mount both to keep /api stable.
  app.use(healthRouter);
  app.use(ordersRouter);
  app.use(ticketsRouter);
  app.use(paypalRouter);

  app.use("/api", healthRouter);
  app.use("/api", ordersRouter);
  app.use("/api", ticketsRouter);
  app.use("/api", paypalRouter);

  app.use((_req, res) => {
    res.status(404).json({
      ok: false,
      error: "Not found",
    });
  });

  app.use(errorHandler);

  return app;
}