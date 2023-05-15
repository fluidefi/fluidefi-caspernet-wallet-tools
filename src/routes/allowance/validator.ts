import { AllowanceParams } from "./types";

const AllowanceRequiredParams: Array<keyof AllowanceParams> = ["amount", "token"];

export const increaseAllowanceValidator = (increaseAllowanceParams: any): string | null => {
  const hasRequiredProperties = AllowanceRequiredParams.every((prop) =>
    Object.prototype.hasOwnProperty.call(increaseAllowanceParams, prop),
  );

  if (!hasRequiredProperties) {
    // will be refactored
    return "error";
  }
  return null;
};
