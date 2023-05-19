import { Request, Response } from "express";
import { swap } from "./service";
import { SwapPrams } from "./types";
import { postSwapValidator } from "./validator";
import { sendBadRequestResponse, sendErrorResponse, sendOkResponse } from "../../utils";
import { UserError } from "../../exceptions";

export const swapToknes = async (req: Request, res: Response) => {
  const errors = postSwapValidator(req.body);
  if (errors) {
    return sendBadRequestResponse(res, errors);
  }

  const swapParams = req.body as SwapPrams;
  try {
    const deployHash = await swap(swapParams);
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
