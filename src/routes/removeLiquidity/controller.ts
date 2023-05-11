import { Request, Response } from "express";
import { postRemoveLiquidityValidator } from "./validator";
import { sendBadRequestResponse } from "../../utils";
import { RemoveLiquidityParams } from "./types";

export const removeLiquidity = async (req: Request, res: Response) => {
  const errors = postRemoveLiquidityValidator(req.body);
  if (!errors) {
    return sendBadRequestResponse(res, errors);
  }
  const removeLiquidityParams: RemoveLiquidityParams = req.body;
};
