import { Router } from "express";
import {
	bulkCreateTickets,
	exportTicketsCsv,
	getTicketQr,
	verifyTicket,
} from "../controllers/tickets";

export const ticketsRouter = Router();

ticketsRouter.get("/tickets/verify", verifyTicket);
ticketsRouter.get("/tickets/qr", getTicketQr);
ticketsRouter.post("/tickets/bulk-create", bulkCreateTickets);
ticketsRouter.get("/tickets/export-csv", exportTicketsCsv);