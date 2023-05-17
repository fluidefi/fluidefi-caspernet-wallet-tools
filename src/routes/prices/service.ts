import { CasperServiceByJsonRPC } from "casper-js-sdk";
import { getAllPairs, getTokenByAddress } from "../../utils";
import { GetPricesResult, PairPrices } from "./types";
import { CASPERNET_PROVIDER_URL } from "../../config";
import BigNumber from "bignumber.js";
import { AllPairs } from "../../entities";
import { getLatestPairContractHashByPackageHash } from "../../utils/blockChainUtils";

export const getPairPrices = async (
  casperService: CasperServiceByJsonRPC,
  stateHash: string,
  pair: AllPairs,
): Promise<PairPrices> => {
  const token0Address = pair.token0Address;
  const token1Address = pair.token1Address;
  const latestContractHash = await getLatestPairContractHashByPackageHash(casperService, pair.contractAddress);

  const reserve0 = await casperService.getBlockState(stateHash, latestContractHash?.replace("contract-", "hash-"), [
    "reserve0",
  ]);
  const reserve1 = await casperService.getBlockState(stateHash, latestContractHash?.replace("contract-", "hash-"), [
    "reserve1",
  ]);

  const token0 = await getTokenByAddress(token0Address);
  const token1 = await getTokenByAddress(token1Address);

  const reserve0Float = new BigNumber(reserve0?.CLValue?.isCLValue ? reserve0?.CLValue?.value().toString() : "0").div(
    10 ** Number(pair.token0Decimals),
  );
  const reserve1Float = new BigNumber(reserve1?.CLValue?.isCLValue ? reserve1?.CLValue?.value().toString() : "0").div(
    10 ** Number(pair.token1Decimals),
  );

  const token0Symbol = token0 ? token0.tokenSymbol : "";
  const token1Symbol = token1 ? token1.tokenSymbol : "";

  return {
    token0Symbol,
    token1Symbol,
    token0Price: reserve0Float.div(reserve1Float),
    token1Price: reserve1Float.div(reserve0Float),
  };
};

export const getPricesService = async (): Promise<GetPricesResult | undefined> => {
  const casperService = new CasperServiceByJsonRPC(CASPERNET_PROVIDER_URL);
  const currentHash = await casperService.getLatestBlockInfo();
  const stateHash = await casperService.getStateRootHash();
  const state2hash = await casperService.getStateRootHash(currentHash.block?.hash);

  console.log(stateHash == state2hash);

  const allPairs = await getAllPairs();

  const infos = allPairs.map((pair) => getPairPrices(casperService, stateHash, pair));
  const data = Promise.all(infos);

  return data;
};
