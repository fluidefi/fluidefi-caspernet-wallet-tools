import BigNumber from "bignumber.js";

export type GetPricesResult = Array<PairPrices>;
export interface PairPrices {
  token0Symbol: string;
  token1Symbol: string;
  token0Price: BigNumber;
  token1Price: BigNumber;
}
