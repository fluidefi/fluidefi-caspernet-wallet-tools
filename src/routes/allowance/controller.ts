import { Request, Response } from "express";
import { signAndDeployAllowance } from "./service";
import { AllowanceParams } from "./types";
import { increaseAllowanceValidator } from "./validator";
import { sendBadRequestResponse, sendErrorResponse, sendOkResponse } from "../../utils";
import { UserError } from "../../exceptions";

export const allowance = async (req: Request, res: Response) => {
  const errors = increaseAllowanceValidator(req.body);
  if (errors) {
    return sendBadRequestResponse(res, errors);
  }

  const params = req.body as AllowanceParams;
  try {
    const deployHash = await signAndDeployAllowance(params);
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
