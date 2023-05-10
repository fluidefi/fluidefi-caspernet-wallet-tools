import { AddLiquidityParams } from "./types";

const PostAddLiquidityRequiredParams: Array<keyof AddLiquidityParams> = [
  "tokenA",
  "tokenB",
  "amount_a",
  "amount_b",
  "deadline",
  "gasPrice",
  "slippage",
];

export const postAddLiquidityValidator = (addLiquidityParams: any): string | null => {
  const hasRequiredProperties = PostAddLiquidityRequiredParams.every((prop) =>
    Object.prototype.hasOwnProperty.call(addLiquidityParams, prop),
  );

  if (!hasRequiredProperties) {
    // will be refactored
    return "error";
  }

  return null;
};
