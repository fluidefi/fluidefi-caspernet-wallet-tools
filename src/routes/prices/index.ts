import { Router } from "express";
import { getPricesController } from "./controller";
const router = Router();

router.get("/", getPricesController);
export { router as pricesRouter };
