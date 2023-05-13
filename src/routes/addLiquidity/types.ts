import { CommonOperationsParams } from "../../utils";

export interface AddLiquidityParams extends CommonOperationsParams {
  amount_a: number;
  amount_b: number;
}

export enum AddLiquidityEntryPoint {
  ADD_LIQUIDITY_CSPR = "add_liquidity_cspr",
  ADD_LIQUIDITY = "add_liquidity",
}
