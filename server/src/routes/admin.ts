import { Router } from "express";
import { confirmPayment, listReservations, resendTicket } from "../controllers/admin";

export const adminRouter = Router();

adminRouter.get("/admin/reservations", listReservations);
adminRouter.post("/admin/orders/:id/confirm", confirmPayment);
adminRouter.post("/admin/orders/:id/resend", resendTicket);
