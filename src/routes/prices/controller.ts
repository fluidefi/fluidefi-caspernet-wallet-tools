import { Request, Response } from "express";
import { getPricesService } from "./service";
import { sendBadRequestResponse, sendErrorResponse, sendOkResponse } from "../../utils";
import { UserError } from "../../exceptions";

export const getPricesController = async (req: Request, res: Response) => {
  try {
    const tokenPrices = await getPricesService();
    return sendOkResponse(res, { data: tokenPrices, msg: "" });
  } catch (err: any) {
    if ("userError" in err && err.userError) {
      return sendBadRequestResponse(res, { msg: (err as UserError).msg });
    } else {
      return sendErrorResponse(res, err);
    }
  }
};
