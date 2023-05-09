import {
  AccessRights,
  CLAccountHash,
  CLByteArray,
  CLKey,
  CLList,
  CLPublicKey,
  CLString,
  CLValueBuilder,
  CasperServiceByJsonRPC,
  DeployUtil,
  Keys,
  RuntimeArgs,
  CasperClient,
  GetDeployResult,
} from "casper-js-sdk";
import fs from "fs";
import { join } from "path";
import { PUBLIC_KEY, PRIVATE_KEY, CASPERNET_PROVIDER_URL } from "../../config";
import { PathResponse, SwapEntryPoint, SwapPrams } from "./types";
import { getPath, signAndDeployContractCall, signAndDeployWasm } from "../../utils";
import { AppDataSource } from "../../db";
import { LiquidityPool, Token } from "../../entities";
import BigNumber from "bignumber.js";

const config = {
  network_name: "casper-test",
  auction_manager_contract_hash: "f00895f7a4ed30e9a5f8171b6fec0a697b6126eb3eafb8b312915a1cec7b2d08",
  transfer_cost: "100000000", // in motes
  router_package_hash: "b6c26649540c59decbc53274a67336d0588f6ad2ae0863a8a636dddcc75689f0",
};

const faucetKey = Keys.getKeysFromHexPrivKey(PRIVATE_KEY, Keys.SignatureAlgorithm.Ed25519);
const MAIN_PURSE = "uref-04edf1af554b36e7d734cca4181c70038ec979d70c56b96771520d82de1b8a6e-007";

/**
 * Determine which swap endpoint should be used
 *
 * @param tokenASymbol tokenA symbol
 * @param tokenBSymbol tokenB symbol
 *
 * @returns which swap endpoint should be used
 */
const selectSwapEntryPoint = (tokenASymbol: string, tokenBSymbol: string): SwapEntryPoint => {
  if (tokenASymbol === "CSPR" && tokenBSymbol !== "CSPR") {
    return SwapEntryPoint.SWAP_EXACT_CSPR_FOR_TOKENS;
  } else if (tokenASymbol !== "CSPR" && tokenBSymbol === "CSPR") {
    return SwapEntryPoint.SWAP_EXACT_TOKENS_FOR_CSPR;
  } else if (tokenASymbol !== "CSPR" && tokenBSymbol !== "CSPR") {
    return SwapEntryPoint.SWAP_EXACT_TOKENS_FOR_TOKENS;
  }
};

/**
 * Get the liquidity pair path for swapping
 * @param tokenASymbol first token
 * @param tokenBSymbol second token
 *
 * @returns the path for swapping
 */
const getPathForSwap = async (tokenASymbol: string, tokenBSymbol: string): Promise<PathResponse> => {
  const token0 = tokenASymbol === "CSPR" ? "WCSPR" : tokenASymbol;
  const token1 = tokenBSymbol === "CSPR" ? "WCSPR" : tokenBSymbol;

  const dbInstance = AppDataSource.getInstance();
  const tokens = await dbInstance.manager.find(Token);
  const pairs = await dbInstance.manager.find(LiquidityPool);

  const path = getPath(token0, token1, tokens, pairs);

  const path2 = path.map((x) => "hash-" + (tokens.find((token) => token.tokenSymbol == x.id) as Token).tokenAddress);

  return {
    message: "",
    path: path2,
    pathwithcontractHash: path2,
    success: true,
  };
};

const swapTokensForExactCspr = async (
  params: SwapPrams,
  path: CLString[],
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  senderPublicKey: CLPublicKey,
): Promise<[string, GetDeployResult]> => {
  const args = RuntimeArgs.fromMap({
    amount_out: CLValueBuilder.u256(params.amount_in || 1),
    amount_in_max: CLValueBuilder.u256(params.amount_out || 2),
    path: new CLList(path),
    to: CLValueBuilder.uref(Uint8Array.from(Buffer.from(MAIN_PURSE.slice(5, 69), "hex")), AccessRights.READ_ADD_WRITE),
    deadline: CLValueBuilder.u256(params.deadline || 2),

    // Deploy wasm params
    entrypoint: CLValueBuilder.string(SwapEntryPoint.SWAP_TOKENS_FOR_EXACT_CSPR),
    package_hash: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(config.router_package_hash, "hex")))),
  });
  return await signAndDeployWasm(
    client,
    casperService,
    senderPublicKey,
    faucetKey,
    new Uint8Array(fs.readFileSync(join(__dirname, "session-code-router.wasm"))),
    args,
    new BigNumber(params.gasPrice || 3.14),
    params.network || "casper-test",
  );
};

const swapExactTokensForCspr = async (
  params: SwapPrams,
  path: CLString[],
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  senderPublicKey: CLPublicKey,
): Promise<[string, GetDeployResult]> => {
  const args = RuntimeArgs.fromMap({
    amount_in: CLValueBuilder.u256(params.amount_in || 1),
    amount_out_min: CLValueBuilder.u256(params.amount_out || 1),
    path: new CLList(path),
    to: CLValueBuilder.uref(Uint8Array.from(Buffer.from(MAIN_PURSE.slice(5, 69), "hex")), AccessRights.READ_ADD_WRITE),
    deadline: CLValueBuilder.u256(params.deadline || 2),

    // Deploy wasm params
    entrypoint: CLValueBuilder.string(SwapEntryPoint.SWAP_EXACT_TOKENS_FOR_CSPR),
    package_hash: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(config.router_package_hash, "hex")))),
  });
  return await signAndDeployWasm(
    client,
    casperService,
    senderPublicKey,
    faucetKey,
    new Uint8Array(fs.readFileSync(join(__dirname, "session-code-router.wasm"))),
    args,
    new BigNumber(params.gasPrice || 3.14),
    params.network || "casper-test",
  );
};

const swapExactCsprForTokens = async (
  params: SwapPrams,
  path: CLString[],
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  senderPublicKey: CLPublicKey,
): Promise<[string, GetDeployResult]> => {
  const args = RuntimeArgs.fromMap({
    amount_in: CLValueBuilder.u256(params.amount_in || 1),
    amount_out_min: CLValueBuilder.u256(params.amount_out || 1),
    path: new CLList(path),
    to: new CLKey(new CLAccountHash((senderPublicKey as CLPublicKey).toAccountHash())),
    deadline: CLValueBuilder.u256(params.deadline || 1),

    // Deploy wasm params
    amount: CLValueBuilder.u512(params.amount_in || 1),
    entrypoint: CLValueBuilder.string(SwapEntryPoint.SWAP_EXACT_CSPR_FOR_TOKENS),
    package_hash: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(config.router_package_hash, "hex")))),
  });
  return await signAndDeployWasm(
    client,
    casperService,
    senderPublicKey,
    faucetKey,
    new Uint8Array(fs.readFileSync(join(__dirname, "session-code-router.wasm"))),
    args,
    new BigNumber(params.gasPrice || 3.14),
    params.network || "casper-test",
  );
};

const swapExactTokensForTokens = async (
  params: SwapPrams,
  path: CLString[],
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  senderPublicKey: CLPublicKey,
): Promise<[string, GetDeployResult]> => {
  const entryPoint = SwapEntryPoint.SWAP_EXACT_TOKENS_FOR_TOKENS;

  const args = RuntimeArgs.fromMap({
    amount_in: CLValueBuilder.u256(params.amount_in || 1),
    amount_out_min: CLValueBuilder.u256(params.amount_out || 2),
    path: new CLList(path),
    to: new CLKey(new CLAccountHash((senderPublicKey as CLPublicKey).toAccountHash())),
    deadline: CLValueBuilder.u256(params.deadline || 2),

    // Deploy wasm params
    entrypoint: CLValueBuilder.string(entryPoint),
    package_hash: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(config.router_package_hash, "hex")))),
  });

  return await signAndDeployContractCall(
    client,
    casperService,
    senderPublicKey,
    faucetKey,
    config.auction_manager_contract_hash,
    entryPoint,
    args,
    new BigNumber(params.gasPrice || 3.14),
    params.network || "casper-test",
  );
};

export const swap = async (params: SwapPrams): Promise<any> => {
  const senderPublicKey = CLPublicKey.fromHex(PUBLIC_KEY);

  const casperService = new CasperServiceByJsonRPC(CASPERNET_PROVIDER_URL);
  const client = new CasperClient(CASPERNET_PROVIDER_URL);

  const entryPoint = selectSwapEntryPoint(params.tokenA, params.tokenB);

  const shortPath = await getPathForSwap(params.tokenA, params.tokenB);
  if (!shortPath.success || shortPath.pathwithcontractHash.length == 0) {
    console.log(`No path could be found for your swap`);
    return ["null", undefined];
  }
  const path = shortPath.pathwithcontractHash.map((x) => new CLString(x));
  let deployHash: string;
  let deployResult: GetDeployResult;

  switch (entryPoint) {
    case SwapEntryPoint.SWAP_EXACT_CSPR_FOR_TOKENS:
      [deployHash, deployResult] = await swapExactCsprForTokens(params, path, client, casperService, senderPublicKey);
      break;
    case SwapEntryPoint.SWAP_EXACT_TOKENS_FOR_CSPR:
      [deployHash, deployResult] = await swapExactTokensForCspr(params, path, client, casperService, senderPublicKey);
      break;
    case SwapEntryPoint.SWAP_TOKENS_FOR_EXACT_CSPR:
      [deployHash, deployResult] = await swapTokensForExactCspr(params, path, client, casperService, senderPublicKey);
      break;
    case SwapEntryPoint.SWAP_EXACT_TOKENS_FOR_TOKENS:
      [deployHash, deployResult] = await swapExactTokensForTokens(params, path, client, casperService, senderPublicKey);
      break;
  }

  if (deployResult.execution_results[0].result.Success) {
    console.log(`Deploy succeed ${deployHash}`);
  } else {
    console.error(`Deploy failed ${deployHash}`);
  }
};
