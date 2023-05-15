/* eslint-disable no-case-declarations */
import {
  AccessRights,
  CLAccountHash,
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
import { CsprTokenSymbol, WCsprTokenSymbol, signAndDeployContractCall, signAndDeployWasm } from "../../utils";
import { RemoveLiquidityEntryPoint, RemoveLiquidityParams } from "./types";
import { CASPERNET_PROVIDER_URL, PRIVATE_KEY, PUBLIC_KEY } from "../../config";
import { UserError } from "../../exceptions";
import BigNumber from "bignumber.js";
import { AppDataSource } from "../../db";
import { Token } from "../../entities";
import { signAndDeployAllowance } from "../../utils/allowance";

const config = {
  network_name: "casper-test",
  auction_manager_contract_hash: "f00895f7a4ed30e9a5f8171b6fec0a697b6126eb3eafb8b312915a1cec7b2d08",
  router_package_hash: "b6c26649540c59decbc53274a67336d0588f6ad2ae0863a8a636dddcc75689f0",
};

const faucetKey = Keys.getKeysFromHexPrivKey(PRIVATE_KEY, Keys.SignatureAlgorithm.Ed25519);
const MAIN_PURSE = "uref-04edf1af554b36e7d734cca4181c70038ec979d70c56b96771520d82de1b8a6e-007";

export const selectRemoveLiquidityEntryPoint = (
  tokenASymbol: string,
  tokenBSymbol: string,
  refundCSPR: boolean,
): RemoveLiquidityEntryPoint | undefined => {
  if (
    refundCSPR &&
    (tokenASymbol === CsprTokenSymbol ||
      tokenBSymbol === CsprTokenSymbol ||
      tokenASymbol === WCsprTokenSymbol ||
      tokenBSymbol === WCsprTokenSymbol)
  ) {
    return RemoveLiquidityEntryPoint.REMOVE_LIQUIDITY_CSPR;
  } else if (!refundCSPR || (tokenASymbol !== CsprTokenSymbol && tokenBSymbol !== CsprTokenSymbol)) {
    return RemoveLiquidityEntryPoint.REMOVE_LIQUIDITY;
  }
};

const getTokenPackageHash = async (tokenSymbol: string): Promise<string> => {
  const dbInstance = AppDataSource.getInstance();
  const tokensRepository = dbInstance.getRepository(Token);
  if (tokenSymbol === CsprTokenSymbol) tokenSymbol = WCsprTokenSymbol;
  const token = await tokensRepository.find({ where: { tokenSymbol } });

  if (!token || token.length !== 1) {
    return "";
  }
  return token[0].tokenAddress;
};

const removeLiquidity = async (
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  params: RemoveLiquidityParams,
  tokenAPackageHash: string,
  tokenBPackageHash: string,
  senderPublicKey: CLPublicKey,
  entryPoint: RemoveLiquidityEntryPoint,
): Promise<[string, GetDeployResult]> => {
  const tokenAContract = new CLByteArray(Uint8Array.from(Buffer.from(tokenAPackageHash, "hex")));
  const tokenBContract = new CLByteArray(Uint8Array.from(Buffer.from(tokenBPackageHash, "hex")));
  await Promise.all([
    signAndDeployAllowance(client, casperService, params.tokenA, new BigNumber(params.liquidity * 10 ** 9)),
    signAndDeployAllowance(client, casperService, params.tokenB, new BigNumber(params.liquidity * 10 ** 9)),
  ]);
  const args = RuntimeArgs.fromMap({
    token_a: new CLKey(tokenAContract),
    token_b: new CLKey(tokenBContract),
    liquidity: CLValueBuilder.u256(new BigNumber(params.liquidity * 10 ** 9).toFixed(0, BigNumber.ROUND_UP)),
    amount_a_min: CLValueBuilder.u256(
      new BigNumber(params.amount_a * 10 ** 9).times(1 - params.slippage).toFixed(0, BigNumber.ROUND_DOWN),
    ),
    amount_b_min: CLValueBuilder.u256(
      new BigNumber(params.amount_b * 10 ** 9).times(1 - params.slippage).toFixed(0, BigNumber.ROUND_DOWN),
    ),
    to: new CLKey(new CLAccountHash((senderPublicKey as CLPublicKey).toAccountHash())),
    deadline: CLValueBuilder.u256(new BigNumber(params.deadline).toFixed(0)),

    // Deploy params
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
    new BigNumber(params.gasPrice || 1),
    params.network || "casper-test",
  );
};

const removeLiquidityCspr = async (
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  params: RemoveLiquidityParams,
  tokenAPackageHash: string,
  tokenBPackageHash: string,
  senderPublicKey: CLPublicKey,
  entryPoint: RemoveLiquidityEntryPoint,
): Promise<[string, GetDeployResult]> => {
  const allowaneToken = params.tokenA === CsprTokenSymbol ? params.tokenB : params.tokenA;
  await signAndDeployAllowance(client, casperService, allowaneToken, new BigNumber(params.liquidity));
  const token =
    params.tokenA === CsprTokenSymbol || params.tokenA === WCsprTokenSymbol
      ? new CLByteArray(Uint8Array.from(Buffer.from(tokenBPackageHash, "hex")))
      : new CLByteArray(Uint8Array.from(Buffer.from(tokenAPackageHash, "hex")));

  const amountCSPRDesired = params.tokenA === CsprTokenSymbol ? params.amount_a : params.amount_b;
  const amountTokenDesired = params.tokenA !== CsprTokenSymbol ? params.amount_a : params.amount_b;

  const args = RuntimeArgs.fromMap({
    token: new CLKey(token),
    liquidity: CLValueBuilder.u256(new BigNumber(params.liquidity).toFixed(0, BigNumber.ROUND_UP)),
    amount_cspr_min: CLValueBuilder.u256(
      new BigNumber(amountCSPRDesired * 10 ** 9).times(1 - params.slippage).toFixed(0, BigNumber.ROUND_DOWN),
    ),
    amount_token_min: CLValueBuilder.u256(
      new BigNumber(amountTokenDesired * 10 ** 9).times(1 - params.slippage).toFixed(0, BigNumber.ROUND_DOWN),
    ),
    to: new CLKey(new CLAccountHash((senderPublicKey as CLPublicKey).toAccountHash())),
    deadline: CLValueBuilder.u256(new BigNumber(params.deadline).toFixed(0)),
    to_purse: CLValueBuilder.uref(
      Uint8Array.from(Buffer.from(MAIN_PURSE.slice(5, 69), "hex")),
      AccessRights.READ_ADD_WRITE,
    ),

    // Deploy wasm params
    //amount: CLValueBuilder.u256(new BigNumber(amountCSPRDesired).toFixed(0)),
    entrypoint: CLValueBuilder.string(entryPoint),
    package_hash: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(config.router_package_hash, "hex")))),
  });

  return await signAndDeployWasm(
    client,
    casperService,
    senderPublicKey,
    faucetKey,
    args,
    new BigNumber(params.gasPrice * 10 ** 9),
    params.network || "casper-test",
  );
};

export const removeLiquidityService = async (params: RemoveLiquidityParams): Promise<[string, GetDeployResult]> => {
  const senderPublicKey = CLPublicKey.fromHex(PUBLIC_KEY);

  const casperService = new CasperServiceByJsonRPC(CASPERNET_PROVIDER_URL);
  const client = new CasperClient(CASPERNET_PROVIDER_URL);

  const entryPoint = selectRemoveLiquidityEntryPoint(params.tokenA, params.tokenB, true);
  const [tokenAPackageHash, tokenBPackageHash] = await Promise.all([
    getTokenPackageHash(params.tokenA),
    getTokenPackageHash(params.tokenB),
  ]);
  if (tokenAPackageHash == "" || tokenBPackageHash == "") {
    throw { userError: true, msg: "token not found" } as UserError;
  }

  switch (entryPoint) {
    case RemoveLiquidityEntryPoint.REMOVE_LIQUIDITY:
      const [deployHash, deployResult] = await removeLiquidity(
        client,
        casperService,
        params,
        tokenAPackageHash,
        tokenBPackageHash,
        senderPublicKey,
        entryPoint,
      );

      return [deployHash, deployResult];
      break;
    case RemoveLiquidityEntryPoint.REMOVE_LIQUIDITY_CSPR:
      const [deployHashCspr, deployResultCspr] = await removeLiquidityCspr(
        client,
        casperService,
        params,
        tokenAPackageHash,
        tokenBPackageHash,
        senderPublicKey,
        entryPoint,
      );

      return [deployHashCspr, deployResultCspr];
      break;
    default:
      throw { userError: true, msg: "unknown remove liquidity entrypoint" } as UserError;
      break;
  }
};
