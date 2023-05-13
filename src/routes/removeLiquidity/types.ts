import { CommonOperationsParams } from "../../utils";

export interface RemoveLiquidityParams extends CommonOperationsParams {
  liquidity: number;
  amount_a: number;
  amount_b: number;
}

export enum RemoveLiquidityEntryPoint {
  REMOVE_LIQUIDITY_CSPR = "remove_liquidity_cspr",
  REMOVE_LIQUIDITY = "remove_liquidity",
}
