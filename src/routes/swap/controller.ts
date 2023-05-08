import { Request, Response } from "express";
import { swap } from "./service";
import { SwapMode, SwapPrams } from "./types";
import { postSwapValidator } from "./validator";
import { sendBadRequestResponse } from "../../utils";

export const swapToknes = async (req: Request, res: Response) => {
  //await swapExactTokensForCspr();
  //await swapTokensForExactCspr();
  const swapParams = req.body as SwapPrams;
  const errors = postSwapValidator(swapParams);
  if (errors) {
    return sendBadRequestResponse(res, errors);
  }
  await swap(swapParams);
  return res.send({ ok: "allgood" });
};
