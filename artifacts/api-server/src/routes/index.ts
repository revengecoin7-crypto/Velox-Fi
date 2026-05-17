import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { authLimit, writeLimit, readLimit } from "../middlewares/rateLimit";
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
import veloxfiDailyRouter from "./veloxfi-daily";
import veloxfiPetRouter from "./veloxfi-pet";
import tokenStatsRouter from "./token-stats";

const router: IRouter = Router();

// Pick the right rate-limit bucket per request. Auth-sensitive routes get
// the strictest cap; read-only public endpoints get the most generous one.
const AUTH_PATHS = new Set<string>([
  "/veloxfi/register",
  "/veloxfi/login",
  "/veloxfi/forgot-password",
  "/veloxfi/reset-password",
  "/veloxfi/resend-verification",
  "/veloxfi/verify-email",
  "/veloxfi/admin/verify",
]);
const READ_PATH_PREFIXES = [
  "/veloxfi/leaderboard",
  "/veloxfi/stats",
  "/veloxfi/activity-feed",
  "/veloxfi/token-stats",
  "/veloxfi/supply-status",
  "/healthz",
];

router.use((req: Request, res: Response, next: NextFunction) => {
  const p = req.path;
  if (AUTH_PATHS.has(p))                                                  return authLimit(req, res, next);
  if (req.method === "GET" && READ_PATH_PREFIXES.some(x => p.startsWith(x))) return readLimit(req, res, next);
  return writeLimit(req, res, next);
});

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
router.use(veloxfiDailyRouter);
router.use(veloxfiPetRouter);
router.use(tokenStatsRouter);

export default router;
