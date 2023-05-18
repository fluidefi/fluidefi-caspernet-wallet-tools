/* eslint-disable no-case-declarations */
import {
  CLAccountHash,
  CLByteArray,
  CLKey,
  CLOption,
  CLPublicKey,
  CLValueBuilder,
  CasperClient,
  CasperServiceByJsonRPC,
  GetDeployResult,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";
import { AddLiquidityEntryPoint, AddLiquidityParams } from "./types";
import { CASPERNET_PROVIDER_URL, PRIVATE_KEY, PUBLIC_KEY } from "../../config";
import BigNumber from "bignumber.js";
import { Some } from "ts-results";
import {
  CsprTokenSymbol,
  convertToNotes,
  getTokenPackageHash,
  signAndDeployContractCall,
  signAndDeployWasm,
  waitForDeployExecution,
} from "../../utils";
import { UserError } from "../../exceptions";

const config = {
  network_name: "casper-test",
  auction_manager_contract_hash: "f00895f7a4ed30e9a5f8171b6fec0a697b6126eb3eafb8b312915a1cec7b2d08",
  router_package_hash: "b6c26649540c59decbc53274a67336d0588f6ad2ae0863a8a636dddcc75689f0",
};

const faucetKey = Keys.getKeysFromHexPrivKey(PRIVATE_KEY, Keys.SignatureAlgorithm.Ed25519);

/**
 * Determine which add liquidity endpoint should be used
 *
 * @param tokenASymbol tokenA symbol
 * @param tokenBSymbol tokenB symbol
 *
 * @returns which swap endpoint should be used
 */
const selectAddLiquidityEntryPoint = (tokenASymbol: string, tokenBSymbol: string): AddLiquidityEntryPoint | null => {
  if (tokenASymbol === CsprTokenSymbol || tokenBSymbol === CsprTokenSymbol) {
    return AddLiquidityEntryPoint.ADD_LIQUIDITY_CSPR;
  } else if (tokenASymbol !== CsprTokenSymbol && tokenBSymbol !== CsprTokenSymbol) {
    return AddLiquidityEntryPoint.ADD_LIQUIDITY;
  }
  return null;
};

const addLiquiidityCspr = async (
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  params: AddLiquidityParams,
  tokenAPackageHash: string,
  tokenBPackageHash: string,
  senderPublicKey: CLPublicKey,
  entryPoint: AddLiquidityEntryPoint,
): Promise<[string, GetDeployResult]> => {
  const token =
    params.tokenA === CsprTokenSymbol
      ? new CLByteArray(Uint8Array.from(Buffer.from(tokenBPackageHash, "hex")))
      : new CLByteArray(Uint8Array.from(Buffer.from(tokenAPackageHash, "hex")));

  const amountCSPRDesired =
    params.tokenA === CsprTokenSymbol
      ? new BigNumber(convertToNotes(params.amount_a).toString())
      : new BigNumber(convertToNotes(params.amount_b).toString());
  const amountTokenDesired =
    params.tokenA !== CsprTokenSymbol
      ? new BigNumber(convertToNotes(params.amount_a).toString())
      : new BigNumber(convertToNotes(params.amount_b).toString());
  const args = RuntimeArgs.fromMap({
    token: new CLKey(token),
    amount_cspr_desired: CLValueBuilder.u256(amountCSPRDesired.toFixed(0, BigNumber.ROUND_UP)),
    amount_token_desired: CLValueBuilder.u256(amountTokenDesired.toFixed(0, BigNumber.ROUND_UP)),
    amount_cspr_min: CLValueBuilder.u256(amountCSPRDesired.times(1 - params.slippage).toFixed(0, BigNumber.ROUND_DOWN)),
    amount_token_min: CLValueBuilder.u256(
      amountTokenDesired.times(1 - params.slippage).toFixed(0, BigNumber.ROUND_DOWN),
    ),
    pair: new CLOption(Some(new CLKey(token) as any) as any),
    to: new CLKey(new CLAccountHash((senderPublicKey as CLPublicKey).toAccountHash())),
    deadline: CLValueBuilder.u256(new BigNumber(params.deadline).toFixed(0)),

    // Deploy wasm params
    amount: CLValueBuilder.u512(amountCSPRDesired.toFixed(0)),
    entrypoint: CLValueBuilder.string(entryPoint),
    package_hash: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(config.router_package_hash, "hex")))),
  });

  return await signAndDeployWasm(
    client,
    casperService,
    senderPublicKey,
    faucetKey,
    args,
    new BigNumber(convertToNotes(params.gasPrice).toString()),
    params.network || "capser-test",
  );
};

const addLiquidity = async (
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  params: AddLiquidityParams,
  tokenAPackageHash: string,
  tokenBPackageHash: string,
  senderPublicKey: CLPublicKey,
  entryPoint: AddLiquidityEntryPoint,
): Promise<[string, GetDeployResult]> => {
  const tokenAContract = new CLByteArray(Uint8Array.from(Buffer.from(tokenAPackageHash, "hex")));
  const tokenBContract = new CLByteArray(Uint8Array.from(Buffer.from(tokenBPackageHash, "hex")));

  const args = RuntimeArgs.fromMap({
    token_a: new CLKey(tokenAContract),
    token_b: new CLKey(tokenBContract),
    amount_a_desired: CLValueBuilder.u256(
      new BigNumber(convertToNotes(params.amount_a).toString()).toFixed(0, BigNumber.ROUND_CEIL),
    ),
    amount_b_desired: CLValueBuilder.u256(
      new BigNumber(convertToNotes(params.amount_b).toString()).toFixed(0, BigNumber.ROUND_CEIL),
    ),
    amount_a_min: CLValueBuilder.u256(
      new BigNumber(convertToNotes(params.amount_a).toString())
        .times(1 - params.slippage)
        .toFixed(0, BigNumber.ROUND_FLOOR),
    ),
    amount_b_min: CLValueBuilder.u256(
      new BigNumber(convertToNotes(params.amount_b).toString())
        .times(1 - params.slippage)
        .toFixed(0, BigNumber.ROUND_FLOOR),
    ),
    pair: new CLOption(Some(new CLKey(tokenBContract) as any) as any),
    to: new CLKey(new CLAccountHash((senderPublicKey as CLPublicKey).toAccountHash())),
    deadline: CLValueBuilder.u256(new BigNumber(params.deadline).toFixed(0)),

    // Deploy wasm params
    entrypoint: CLValueBuilder.string(entryPoint),
    package_hash: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(config.router_package_hash, "hex")))),
  });
  return await signAndDeployWasm(
    client,
    casperService,
    senderPublicKey,
    faucetKey,
    args,
    new BigNumber(convertToNotes(params.gasPrice).toString()),
    params.network || "capser-test",
  );
  /*
  return await signAndDeployContractCall(
    client,
    casperService,
    senderPublicKey,
    faucetKey,
    config.auction_manager_contract_hash,
    entryPoint,
    argss,
    new BigNumber(convertToNotes(params.gasPrice).toString()),
    params.network || "casper-test",
  );*/
};

export const AddLiquidityService = async (params: AddLiquidityParams): Promise<string> => {
  const senderPublicKey = CLPublicKey.fromHex(PUBLIC_KEY);

  const casperService = new CasperServiceByJsonRPC(CASPERNET_PROVIDER_URL);
  const client = new CasperClient(CASPERNET_PROVIDER_URL);

  const entryPoint = selectAddLiquidityEntryPoint(params.tokenA, params.tokenB);

  const [tokenAPackageHash, tokenBPackageHash] = await Promise.all([
    getTokenPackageHash(params.tokenA),
    getTokenPackageHash(params.tokenB),
  ]);
  if (tokenAPackageHash == "" || tokenBPackageHash == "") {
    throw { userError: true, msg: "token not found" } as UserError;
  }
  let deployHash: string;
  let deployResult: GetDeployResult;
  switch (entryPoint) {
    case AddLiquidityEntryPoint.ADD_LIQUIDITY_CSPR:
      [deployHash, deployResult] = await addLiquiidityCspr(
        client,
        casperService,
        params,
        tokenAPackageHash,
        tokenBPackageHash,
        senderPublicKey,
        entryPoint,
      );

      break;
    case AddLiquidityEntryPoint.ADD_LIQUIDITY:
      [deployHash, deployResult] = await addLiquidity(
        client,
        casperService,
        params,
        tokenAPackageHash,
        tokenBPackageHash,
        senderPublicKey,
        entryPoint,
      );

      break;
    default:
      throw { userError: true, msg: "unknown add liquidity entrypoint" } as UserError;
      break;
  }
  await waitForDeployExecution(client, deployHash);
  return deployHash;
};
