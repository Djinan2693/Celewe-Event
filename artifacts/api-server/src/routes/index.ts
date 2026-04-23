import { Router, type IRouter } from "express";
import healthRouter from "./health";
import webhooksRouter from "./webhooks";
import ticketsRouter from "./tickets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(webhooksRouter);
router.use(ticketsRouter);

export default router;
