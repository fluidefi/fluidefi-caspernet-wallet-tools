/**
 * Token
 */
export interface Token {
  amount?: string;
  allowance?: string;
  symbolPair?: string;
  chainId: number;
  contractHash: string;
  decimals: number;
  logoURI: string;
  name: string;
  packageHash: string;
  symbol: string;
  priceUSD?: string;
}

export type PairData = {
  checked: boolean;
  name: string;
  orderedName?: string;
  contractHash: string;
  packageHash: string;
  balance: string;
  reserve0: string;
  reserve1: string;
  totalReserve0: string;
  totalReserve1: string;
  allowance: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Icon?: string;
  token1Icon?: string;
  liquidity?: string;
  volume7d?: string;
  volume1d?: string;
  totalSupply?: string;
  token0Price?: string;
  token1Price?: string;
  liquidityUSD?: string;
  totalLiquidityUSD?: string;
  contract0?: string;
  contract1?: string;
  token0Name?: string;
  token1Name?: string;
  decimals: number;
};
