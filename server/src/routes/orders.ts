import { Router } from "express";
import { createManualOrder } from "../controllers/orders";

export const ordersRouter = Router();

ordersRouter.post("/orders/manual", createManualOrder);