import { Request, Response } from "express";
import { AddLiquidityParams } from "./types";
import { postAddLiquidityValidator } from "./validator";
import { sendBadRequestResponse, sendErrorResponse, sendOkResponse } from "../../utils";
import { AddLiquidityService } from "./service";
import { UserError } from "../../exceptions";

export const addLiquidity = async (req: Request, res: Response) => {
  const errors = postAddLiquidityValidator(req.body);
  if (errors) {
    return sendBadRequestResponse(res, errors);
  }

  const addLiquidityParams = req.body as AddLiquidityParams;
  try {
    const deployHash = await AddLiquidityService(addLiquidityParams);
    return sendOkResponse(res, { msg: "", data: { deployHash } });
  } catch (err: any) {
    console.log(err);

    if ("timeout" in err && err.timeout) {
      return sendOkResponse(res, {
        msg: (err as UserError).msg,
        data: { deployHash: (err as UserError).deployHash, success: false },
      });
    } else if ("userError" in err && err.userError) {
      return sendBadRequestResponse(res, { msg: (err as UserError).msg, deployHash: (err as UserError).deployHash });
    } else {
      return sendErrorResponse(res, err);
    }
  }
};
