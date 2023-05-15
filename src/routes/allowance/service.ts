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
import { signAndDeployContractCall } from "../../utils";
import { AllowanceParams } from "./types";

const config = {
  network_name: "casper-test",
  auction_manager_contract_hash: "f00895f7a4ed30e9a5f8171b6fec0a697b6126eb3eafb8b312915a1cec7b2d08",
  router_package_hash: "b6c26649540c59decbc53274a67336d0588f6ad2ae0863a8a636dddcc75689f0",
};

const faucetKey = Keys.getKeysFromHexPrivKey(PRIVATE_KEY, Keys.SignatureAlgorithm.Ed25519);

// this will be refactored once we update the DB
const getContractHash = (tokenSymbol: string): string => {
  const contracts = [
    {
      tokenSymbol: "WCSPR",
      contractHash: "8b93e4847ad2628a57675141d206e93241475a9b814a4cf5a3ec0f20845fa6ec",
    },
    {
      tokenSymbol: "USDC",
      contractHash: "4abd547ff0bb3283005e216b6c0c043f877fba56c6565369c8ab36897507407e",
    },
    {
      tokenSymbol: "DAI",
      contractHash: "cddb79e2ae2ba3dcaa358fedc86a8d7bbdb5ba42748e698a6bd35b3c73ed3f3a",
    },
    {
      tokenSymbol: "USDT",
      contractHash: "f6b5b9ae6648b02b32b75baf945bce8b3dd1ae3604ebd80a05d7f9f1cfd725eb",
    },
    {
      tokenSymbol: "WETH",
      contractHash: "285b94254bbbfde92d2ec5c39ce2a67041ea9195f25ab16ba2664eb65cbd104d",
    },
    {
      tokenSymbol: "CSX",
      contractHash: "8bda755eb1aff73580e11f8fcb0c530a8486334d389cb98e55c541ef397672bd",
    },
    {
      tokenSymbol: "CST",
      contractHash: "40702409a78543f66dfcc34606db669faaa041b821b9319f460217ebf9885ac0",
    },
    {
      tokenSymbol: "WBTC",
      contractHash: "4fa60af6264f8eacaa4ee0f46dab671894f18cb3da069ea7663853ab1702e9d5",
    },
    {
      tokenSymbol: "DWBTC",
      contractHash: "27dcb2efc403047a3f9fdad8acf879e3630706c9a38d28b8ef44201b1581fb3e",
    },
  ];

  const el = contracts.find((el) => el.tokenSymbol == tokenSymbol);
  return el ? el.contractHash : "";
};

export const signAndDeployAllowance = async (params: AllowanceParams): Promise<[string, GetDeployResult]> => {
  try {
    const senderPublicKey = CLPublicKey.fromHex(PUBLIC_KEY);
    const tokenContractHash = getContractHash(params.token);
    const casperService = new CasperServiceByJsonRPC(CASPERNET_PROVIDER_URL);
    const casperClient = new CasperClient(CASPERNET_PROVIDER_URL);

    const entryPoint = "increase_allowance";

    const spender = config.router_package_hash;
    const spenderByteArray = new CLByteArray(Uint8Array.from(Buffer.from(spender, "hex")));
    const args = RuntimeArgs.fromMap({
      spender: new CLKey(spenderByteArray),
      amount: CLValueBuilder.u256(new BigNumber(params.amount * 10 ** 9).toFixed(0)),
    });

    const [deployHash, deployResult] = await signAndDeployContractCall(
      casperClient,
      casperService,
      senderPublicKey,
      faucetKey,
      tokenContractHash,
      entryPoint,
      args,
      new BigNumber(params.gasPrice * 10 ** 9 || 5000000000),
      "casper-test",
    );

    return [deployHash, deployResult];
  } catch (err) {
    console.error(`signAndDeployAllowance error: ${err}`);
    throw err;
  }
};
