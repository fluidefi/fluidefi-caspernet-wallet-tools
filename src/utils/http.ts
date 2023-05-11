import { Response } from "express";
type IResponse<T> = {
  data: T;
  msg: string;
};
function sendOkResponse<T>(res: Response, payload: IResponse<T>) {
  return res.status(200).send(payload);
}
function sendForbiddenResponse(res: Response) {
  return res.status(403).send({ msg: "You're not allowed to access this resource", code: "Forbidden" });
}
function sendCreatedResponse<T>(res: Response, payload: IResponse<T>) {
  return res.status(201).send(payload);
}
function sendBadRequestResponse<T>(res: Response, payload: T) {
  return res.status(400).send({ msg: "Bad request", data: payload });
}
function sendUnprocessableEntityResponse<T>(res: Response, payload: { msg: T }) {
  res.status(422).send(payload);
}
function sendErrorResponse(res: Response, error: Error) {
  res.status(500).send({ msg: "Internal server error", error: (error as Error).message });
}
function sendUnauthorizedResponse(res: Response, msg: string) {
  res.status(401).send({ code: "Unauthorized", msg });
}
export {
  sendErrorResponse,
  sendOkResponse,
  sendForbiddenResponse,
  sendCreatedResponse,
  sendBadRequestResponse,
  sendUnprocessableEntityResponse,
  sendUnauthorizedResponse,
};
