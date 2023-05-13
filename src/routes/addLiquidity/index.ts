import { Router } from "express";
import { addLiquidity } from "./controller";
const router = Router();

router.post("/", addLiquidity);
export { router as addLiquidityRouter };
