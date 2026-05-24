import { Router } from "express";
import {
  capturePaypalOrderHandler,
  createPaypalOrderHandler,
  paypalWebhookHandler,
} from "../controllers/paypal";

export const paypalRouter = Router();

paypalRouter.post("/paypal/create-order", createPaypalOrderHandler);
paypalRouter.post("/paypal/capture", capturePaypalOrderHandler);
paypalRouter.post("/paypal/webhook", paypalWebhookHandler);