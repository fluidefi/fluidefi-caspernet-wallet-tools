import { SwapMode, SwapPrams } from "../../../src/routes/swap/types";
import { postSwapValidator } from "../../../src/routes/swap/validator";

describe("postSwapValidator", () => {
  const validSwapParams: SwapPrams = {
    mode: SwapMode.exactInput,
    tokenA: "ETH",
    tokenB: "USDT",
    amount_in: 1,
  };

  it("should return null for valid swap params", () => {
    expect(postSwapValidator(validSwapParams)).toBeNull();
  });

  it("should return 'error' if any of the required params are missing", () => {
    const invalidSwapParams1 = {
      mode: SwapMode.exactInput,
      tokenA: "ETH",
    };

    const invalidSwapParams2: SwapPrams = {
      mode: SwapMode.exactInput,
      tokenA: "ETH",
      tokenB: "USDT",
    };

    expect(postSwapValidator(invalidSwapParams1)).toBe("error");
    expect(postSwapValidator(invalidSwapParams2)).toBe("error");
  });

  it("should return null if 'amount_in' or 'amount_out' are present in swap params", () => {
    const validSwapParamsWithAmountIn: SwapPrams = {
      mode: SwapMode.exactInput,
      tokenA: "ETH",
      tokenB: "USDT",
      amount_in: 1,
    };

    const validSwapParamsWithAmountOut: SwapPrams = {
      mode: SwapMode.exactInput,
      tokenA: "ETH",
      tokenB: "USDT",
      amount_out: 1,
    };

    expect(postSwapValidator(validSwapParamsWithAmountIn)).toBeNull();
    expect(postSwapValidator(validSwapParamsWithAmountOut)).toBeNull();
  });

  it("should return 'error' if 'amount_in' and 'amount_out' are missing in swap params", () => {
    const invalidSwapParams: SwapPrams = {
      mode: SwapMode.exactInput,
      tokenA: "ETH",
      tokenB: "USDT",
    };

    expect(postSwapValidator(invalidSwapParams)).toBe("error");
  });
});
