import { Request, Response } from "express";
import { swap } from "./service";
import { SwapPrams } from "./types";
import { postSwapValidator } from "./validator";
import { sendBadRequestResponse, sendErrorResponse, sendOkResponse } from "../../utils";
import { UserError } from "../../exceptions";

export const swapToknes = async (req: Request, res: Response) => {
  const swapParams = req.body as SwapPrams;
  const errors = postSwapValidator(swapParams);
  if (errors) {
    return sendBadRequestResponse(res, errors);
  }

  try {
    const [deployHash, deployResult] = await swap(swapParams);
    return sendOkResponse(res, { msg: "", data: { deployHash } });
  } catch (err: any) {
    if ("userError" in err && err.userError) {
      return sendBadRequestResponse(res, { msg: (err as UserError).msg });
    } else {
      return sendErrorResponse(res, err);
    }
  }
};
