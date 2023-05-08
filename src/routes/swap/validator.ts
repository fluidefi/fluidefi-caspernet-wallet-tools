import { SwapPrams } from "./types";

const PostSwapRequiredParams: Array<keyof SwapPrams> = ["mode", "tokenA", "tokenB"];

export const postSwapValidator = (swapParams: any): string | null => {
  // Check if 'mode' and either 'amount_in' or 'amount_out' are present in the request body
  const hasRequiredProperties = PostSwapRequiredParams.every((prop) =>
    Object.prototype.hasOwnProperty.call(swapParams, prop),
  );
  const hasAmountInOrOut = "amount_in" in swapParams || "amount_out" in swapParams;
  if (!hasRequiredProperties || !hasAmountInOrOut) {
    // will be refactored
    return "error";
  }

  return null;
};
