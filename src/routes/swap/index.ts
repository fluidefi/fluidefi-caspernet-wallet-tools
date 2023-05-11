import { Router } from "express";
import { swapToknes } from "./controller";
const router = Router();

router.post("/", swapToknes);

export { router as swapRouter };
