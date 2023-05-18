import { SwapMode, SwapPrams } from "../../../src/routes/swap/types";
import { postSwapValidator } from "../../../src/routes/swap/validator";

describe("postSwapValidator", () => {
  it("should return null when all required parameters are present", () => {
    const swapParams = {
      mode: "swap",
      tokenA: "tokenA",
      tokenB: "tokenB",
      amount_in: 100,
      amount_out: 200,
      deadline: 1234567890,
      gasPrice: 100,
      slippage: 0.5,
    };

    const result = postSwapValidator(swapParams);

    expect(result).toBe(null);
  });

  it("should return 'error' when 'mode' is missing", () => {
    const swapParams = {
      tokenA: "tokenA",
      tokenB: "tokenB",
      amount_in: 100,
      amount_out: 200,
      deadline: 1234567890,
      gasPrice: 100,
      slippage: 0.5,
    };

    const result = postSwapValidator(swapParams);

    expect(result).toBe("error");
  });

  it("should return 'error' when both 'amount_in' and 'amount_out' are missing", () => {
    const swapParams = {
      mode: "swap",
      tokenA: "tokenA",
      tokenB: "tokenB",
      deadline: 1234567890,
      gasPrice: 100,
      slippage: 0.5,
    };

    const result = postSwapValidator(swapParams);

    expect(result).toBe("error");
  });
});
