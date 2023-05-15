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
    const [deployHash, deployResult] = await signAndDeployAllowance(params);
    return sendOkResponse(res, { msg: "", data: { deployHash } });
  } catch (err: any) {
    if ("userError" in err && err.userError) {
      return sendBadRequestResponse(res, { msg: (err as UserError).msg });
    } else {
      return sendErrorResponse(res, err);
    }
  }
};
