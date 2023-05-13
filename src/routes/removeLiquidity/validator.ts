import { RemoveLiquidityParams } from "./types";

const PostSwapRequiredParams: Array<keyof RemoveLiquidityParams> = [
  "tokenA",
  "tokenB",
  "liquidity",
  "amount_a",
  "amount_b",
  "deadline",
  "gasPrice",
  "slippage",
];

export const postRemoveLiquidityValidator = (removeLiquidityParams: any): string | null => {
  const hasRequiredProperties = PostSwapRequiredParams.every((prop) =>
    Object.prototype.hasOwnProperty.call(removeLiquidityParams, prop),
  );

  if (!hasRequiredProperties) {
    // will be refactored
    return "error";
  }
  return null;
};
