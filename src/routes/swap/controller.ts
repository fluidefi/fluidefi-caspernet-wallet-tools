import { Request, Response } from "express";
import { swapExactTokensForTokens, swapTokensForExactCspr } from "./service";

export const swapToknes = async (req: Request, res: Response) => {
  //await swapExactTokensForCspr();
  await swapTokensForExactCspr();
  return res.send({ ok: "allgood" });
};
