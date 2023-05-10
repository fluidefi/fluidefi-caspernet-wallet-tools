import { Request, Response } from "express";
import { AddLiquidityParams } from "./types";
import { postAddLiquidityValidator } from "./validator";
import { sendBadRequestResponse, sendOkResponse } from "../../utils";
import { AddLiquidityService } from "./service";

export const addLiquidity = async (req: Request, res: Response) => {
  const addLiquidityParams = req.body as AddLiquidityParams;
  const errors = postAddLiquidityValidator(addLiquidityParams);
  if (errors) {
    return sendBadRequestResponse(res, errors);
  }

  await AddLiquidityService(addLiquidityParams);

  return sendOkResponse(res, { msg: "allGood", data: {} });
};
