import { Request, Response } from "express";
import { postRemoveLiquidityValidator } from "./validator";
import { sendBadRequestResponse, sendErrorResponse, sendOkResponse } from "../../utils";
import { RemoveLiquidityParams } from "./types";
import { removeLiquidityService } from "./service";
import { UserError } from "../../exceptions";

export const removeLiquidity = async (req: Request, res: Response) => {
  const errors = postRemoveLiquidityValidator(req.body);
  if (!errors) {
    return sendBadRequestResponse(res, errors);
  }
  const removeLiquidityParams: RemoveLiquidityParams = req.body;
  try {
    const [deployHash, deployResult] = await removeLiquidityService(removeLiquidityParams);
    return sendOkResponse(res, { msg: "", data: { deployHash } });
  } catch (err: any) {
    if ("userError" in err && err.userError) {
      return sendBadRequestResponse(res, { msg: (err as UserError).msg });
    } else {
      return sendErrorResponse(res, err);
    }
  }
};
