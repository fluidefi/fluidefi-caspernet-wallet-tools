import {
  CLByteArray,
  CLKey,
  CLPublicKey,
  CLValueBuilder,
  CasperClient,
  CasperServiceByJsonRPC,
  GetDeployResult,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";

import BigNumber from "bignumber.js";
import { CASPERNET_PROVIDER_URL, PRIVATE_KEY, PUBLIC_KEY } from "../../config";
import {
  CsprTokenSymbol,
  WCsprTokenSymbol,
  convertToNotes,
  getPairContractAddress,
  getTokenPackageHash,
  signAndDeployContractCall,
} from "../../utils";
import { AllowanceParams } from "./types";
import { UserError } from "../../exceptions";
import {
  getLatestPairContractHashByPackageHash,
  getLatestTokenContractHashByPackageHash,
} from "../../utils/blockChainUtils";

const config = {
  network_name: "casper-test",
  auction_manager_contract_hash: "f00895f7a4ed30e9a5f8171b6fec0a697b6126eb3eafb8b312915a1cec7b2d08",
  router_package_hash: "b6c26649540c59decbc53274a67336d0588f6ad2ae0863a8a636dddcc75689f0",
};

const faucetKey = Keys.getKeysFromHexPrivKey(PRIVATE_KEY, Keys.SignatureAlgorithm.Ed25519);

const getContractHash = async (casperService: CasperServiceByJsonRPC, tokenSymbol: string): Promise<string> => {
  const tokenPackageHash = await getTokenPackageHash(tokenSymbol);
  const latesetContractHash = await getLatestTokenContractHashByPackageHash(casperService, tokenPackageHash);

  return latesetContractHash.replace("contract-", "");
};

const getContractHashForPair = async (
  casperService: CasperServiceByJsonRPC,
  tokenA: string,
  tokenB: string,
): Promise<string> => {
  tokenA = tokenA == CsprTokenSymbol ? WCsprTokenSymbol : tokenA;
  tokenB = tokenB == CsprTokenSymbol ? WCsprTokenSymbol : tokenB;
  const [tokenAPackageHash, tokenBPackageHash] = await Promise.all([
    getTokenPackageHash(tokenA),
    getTokenPackageHash(tokenB),
  ]);

  const [pairPackageContractHash, pairPackageContractHashBis] = await Promise.all([
    getPairContractAddress(tokenAPackageHash, tokenBPackageHash),
    getPairContractAddress(tokenBPackageHash, tokenAPackageHash),
  ]);

  if (!pairPackageContractHash && !pairPackageContractHashBis) {
    throw { userError: true, msg: `Uknown pairs ${tokenA} - ${tokenB} || ${tokenB} - ${tokenA}` } as UserError;
  } else if (pairPackageContractHash) {
    const pairLastContractHash = await getLatestPairContractHashByPackageHash(casperService, pairPackageContractHash);

    return pairLastContractHash.replace("contract-", "");
  } else {
    const pairLastContractHash = await getLatestPairContractHashByPackageHash(
      casperService,
      pairPackageContractHashBis,
    );

    return pairLastContractHash.replace("contract-", "");
  }
};

export const signAndDeployAllowance = async (params: AllowanceParams): Promise<[string, GetDeployResult]> => {
  try {
    const senderPublicKey = CLPublicKey.fromHex(PUBLIC_KEY);
    const casperService = new CasperServiceByJsonRPC(CASPERNET_PROVIDER_URL);
    const casperClient = new CasperClient(CASPERNET_PROVIDER_URL);

    const entryPoint = "increase_allowance";
    let tokenContractHash = "";
    if (!params.tokenB) {
      tokenContractHash = await getContractHash(casperService, params.token);
    } else {
      tokenContractHash = await getContractHashForPair(casperService, params.token, params.tokenB);
    }
    const spender = config.router_package_hash;
    const spenderByteArray = new CLByteArray(Uint8Array.from(Buffer.from(spender, "hex")));
    const args = RuntimeArgs.fromMap({
      spender: new CLKey(spenderByteArray),
      amount: CLValueBuilder.u256(new BigNumber(convertToNotes(params.amount).toString()).toFixed(0)),
    });

    const [deployHash, deployResult] = await signAndDeployContractCall(
      casperClient,
      casperService,
      senderPublicKey,
      faucetKey,
      tokenContractHash,
      entryPoint,
      args,
      new BigNumber(convertToNotes(params.gasPrice).toString() || 5000000000),
      "casper-test",
    );

    return [deployHash, deployResult];
  } catch (err) {
    console.error(`signAndDeployAllowance error: ${err}`);
    throw err;
  }
};
