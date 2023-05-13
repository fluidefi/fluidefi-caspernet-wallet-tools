import { Router } from "express";
import { removeLiquidity } from "./controller";
const router = Router();

router.post("/", removeLiquidity);
export { router as removeLiquidityRouter };
