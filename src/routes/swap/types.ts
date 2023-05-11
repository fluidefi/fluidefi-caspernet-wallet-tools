// Swap Mode
export enum SwapMode {
  exactInput = "exactInput",
  exactOutput = "exactOutput",
}

// Post params for swap
export interface SwapPrams {
  mode: SwapMode;
  tokenA: string;
  tokenB: string;
  amount_in?: number;
  amount_out?: number;
  recipient?: string;
  deadline?: number;
  slippage?: number;
  gasPrice?: number;
  network?: string;
  plateform?: string;
}

// swap entry point
export enum SwapEntryPoint {
  SWAP_EXACT_CSPR_FOR_TOKENS = "swap_exact_cspr_for_tokens",
  SWAP_EXACT_TOKENS_FOR_TOKENS = "swap_exact_tokens_for_tokens",
  SWAP_TOKENS_FOR_EXACT_CSPR = "swap_tokens_for_exact_cspr",
  SWAP_EXACT_TOKENS_FOR_CSPR = "swap_exact_tokens_for_cspr",
}

/**
 * Path Response
 */
export interface PathResponse {
  message: string;
  path: string[];
  pathwithcontractHash: string[];
  success: boolean;
}
