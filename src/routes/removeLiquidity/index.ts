import { Router, Request, Response } from "express";
import { RemoveLiquidityParams } from "./types";
const router = Router();

router.post("/", (req: Request, res: Response) => {
  const removeParams = req.body as RemoveLiquidityParams;
});
export { router as removeLiquidityRouter };
