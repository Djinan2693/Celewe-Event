import { Router } from "express";
import { createManualOrder, createReservation } from "../controllers/orders";

export const ordersRouter = Router();

ordersRouter.post("/orders/manual", createManualOrder);
ordersRouter.post("/orders/reserve", createReservation);