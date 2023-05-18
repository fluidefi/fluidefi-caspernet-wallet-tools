import { Request, Response } from "express";
import { postRemoveLiquidityValidator } from "./validator";
import { sendBadRequestResponse, sendErrorResponse, sendOkResponse } from "../../utils";
import { RemoveLiquidityParams } from "./types";
import { removeLiquidityService } from "./service";
import { UserError } from "../../exceptions";

export const removeLiquidity = async (req: Request, res: Response) => {
  const errors = postRemoveLiquidityValidator(req.body);
  if (errors) {
    return sendBadRequestResponse(res, errors);
  }

  const removeLiquidityParams: RemoveLiquidityParams = req.body;
  try {
    const deployHash = await removeLiquidityService(removeLiquidityParams);
    return sendOkResponse(res, { msg: "", data: { deployHash, success: true } });
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
