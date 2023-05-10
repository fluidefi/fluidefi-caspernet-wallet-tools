// Common Params for all endpoints

export interface CommonOperationsPrams {
  tokenA: string;
  tokenB: string;
  recipient?: string;
  deadline?: number;
  slippage?: number;
  gasPrice?: number;
  network?: string;
  plateform?: string;
}
