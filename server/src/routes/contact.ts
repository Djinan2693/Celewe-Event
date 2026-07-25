import { Router } from "express";
import { submitContact } from "../controllers/contact";

export const contactRouter = Router();

contactRouter.post("/contact", submitContact);
