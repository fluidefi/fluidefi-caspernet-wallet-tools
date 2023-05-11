import { Request, Response } from "express";
import { AddLiquidityParams } from "./types";
import { postAddLiquidityValidator } from "./validator";
import { sendBadRequestResponse, sendErrorResponse, sendOkResponse } from "../../utils";
import { AddLiquidityService } from "./service";
import { UserError } from "../../exceptions";

export const addLiquidity = async (req: Request, res: Response) => {
  const addLiquidityParams = req.body as AddLiquidityParams;
  const errors = postAddLiquidityValidator(addLiquidityParams);
  if (errors) {
    return sendBadRequestResponse(res, errors);
  }

  try {
    const [deployHash, deployResult] = await AddLiquidityService(addLiquidityParams);
    return sendOkResponse(res, { msg: "", data: { deployHash } });
  } catch (err: any) {
    if ("userError" in err && err.userError) {
      return sendBadRequestResponse(res, { msg: (err as UserError).msg });
    } else {
      return sendErrorResponse(res, err);
    }
  }
};
