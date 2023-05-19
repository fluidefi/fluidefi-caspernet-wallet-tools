import { Router } from "express";
import { allowance } from "./controller";
const router = Router();

router.post("/", allowance);
export { router as allowanceRouter };
