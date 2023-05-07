import { Request, Response } from "express";
import { swap } from "./service";
import { SwapMode, SwapPrams } from "./types";

export const swapToknes = async (req: Request, res: Response) => {
  //await swapExactTokensForCspr();
  //await swapTokensForExactCspr();
  const swapParams = req.body as SwapPrams;
  await swap(swapParams);
  await swap({
    mode: SwapMode.exactInput,
    tokenA: "CSPR",
    tokenB: "CSX",
    amount_in: 12,
    amount_out: 12,
    recipient: "me",
    deadline: 1,
    slippage: 1,
    gasPrice: 1,
    network: "net",
    plateform: "pla",
  });
  return res.send({ ok: "allgood" });
};
