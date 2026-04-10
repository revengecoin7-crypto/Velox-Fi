import { Router, type IRouter } from "express";
import healthRouter from "./health";
import accountsRouter from "./accounts";
import transactionsRouter from "./transactions";
import budgetsRouter from "./budgets";
import goalsRouter from "./goals";
import dashboardRouter from "./dashboard";
import presaleRouter from "./presale";
import statsRouter from "./stats";
import pricesRouter from "./prices";
import memecoinsRouter from "./memecoins";
import veloxfiAuthRouter from "./veloxfi-auth";
import veloxfiBattlesRouter from "./veloxfi-battles";
import veloxfiAdminRouter from "./veloxfi-admin";
import veloxfiPasswordRouter from "./veloxfi-password";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accountsRouter);
router.use(transactionsRouter);
router.use(budgetsRouter);
router.use(goalsRouter);
router.use(dashboardRouter);
router.use(presaleRouter);
router.use(statsRouter);
router.use(pricesRouter);
router.use(memecoinsRouter);
router.use(veloxfiAuthRouter);
router.use(veloxfiBattlesRouter);
router.use(veloxfiAdminRouter);
router.use(veloxfiPasswordRouter);

export default router;
