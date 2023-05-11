import { CommonOperationsParams } from "../../utils";

export interface RemoveLiquidityParams extends CommonOperationsParams {
  liquidity: number;
  amount_a: number;
  amount_b: number;
}
