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
} from "casper-js-sdk";
import fs from "fs";
import { join } from "path";
import { PUBLIC_KEY, PRIVATE_KEY } from "../../config";

const config = {
  network_name: "casper-test",
  auction_manager_contract_hash: "f00895f7a4ed30e9a5f8171b6fec0a697b6126eb3eafb8b312915a1cec7b2d08",
  delegate_cost: "2500000000", // in motes
  undelegate_cost: "10000", // in motes
  redelegate_cost: "10000", // in motes
  transfer_cost: "100000000", // in motes
  router_package_hash: "b6c26649540c59decbc53274a67336d0588f6ad2ae0863a8a636dddcc75689f0",
};

const faucetKey = Keys.getKeysFromHexPrivKey(PRIVATE_KEY, Keys.SignatureAlgorithm.Ed25519);
const MAIN_PURSE = "uref-04edf1af554b36e7d734cca4181c70038ec979d70c56b96771520d82de1b8a6e-007";

export const swapTokensForCspr = async () => {
  const senderPublicKey = CLPublicKey.fromHex(PUBLIC_KEY);
  const entryPoint = "swap_exact_tokens_for_cspr";
  const response = {
    message: "",
    path: [
      "hash-28eed3da2b123334c7913d84c4aea0ed426fd268d29410cb12c6bc8a453183f6",
      "hash-0885c63f5f25ec5b6f3b57338fae5849aea5f1a2c96fc61411f2bfc5e432de5a",
    ],
    pathwithcontractHash: [
      "hash-28eed3da2b123334c7913d84c4aea0ed426fd268d29410cb12c6bc8a453183f6",
      "hash-0885c63f5f25ec5b6f3b57338fae5849aea5f1a2c96fc61411f2bfc5e432de5a",
    ],
    success: true,
  };
  const path = response.pathwithcontractHash.map((x) => new CLString(x));

  const args = RuntimeArgs.fromMap({
    amount_in: CLValueBuilder.u256(10012),
    amount_out_min: CLValueBuilder.u256(2500000000),
    path: new CLList(path),
    to: CLValueBuilder.uref(Uint8Array.from(Buffer.from(MAIN_PURSE.slice(5, 69), "hex")), AccessRights.READ_ADD_WRITE),
    deadline: CLValueBuilder.u256(1739598100811),

    // Deploy wasm params
    entrypoint: CLValueBuilder.string(entryPoint),
    package_hash: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(config.router_package_hash, "hex")))),
  });

  const contractHashAsByteArray = Uint8Array.from(Buffer.from(config.auction_manager_contract_hash, "hex"));
  const deployItem = DeployUtil.ExecutableDeployItem.newStoredContractByHash(contractHashAsByteArray, entryPoint, args);

  const deployParams = new DeployUtil.DeployParams(senderPublicKey, config.network_name);

  const deployCost = DeployUtil.standardPayment(35000000000);
  const deploy = DeployUtil.makeDeploy(deployParams, deployItem, deployCost);

  const signedDeeploy = DeployUtil.signDeploy(deploy, faucetKey);

  const client = new CasperServiceByJsonRPC("http://85.114.132.133:7777/rpc");

  console.log(`######## Sending deploy ... ${signedDeeploy}`);
  console.log({ ...signedDeeploy });
  const { deploy_hash } = await client.deploy(signedDeeploy);
  console.log(`######## Deploy Hash ${deploy_hash}`);
  const result = await client.waitForDeploy(deploy);

  console.log(`######### all good `, result.deploy.hash);
};

export const swapCsprForTokens = async () => {
  const senderPublicKey = CLPublicKey.fromHex(PUBLIC_KEY);
  const entryPoint = "swap_exact_cspr_for_tokens";
  const response = {
    message: "",
    path: [
      "hash-0885c63f5f25ec5b6f3b57338fae5849aea5f1a2c96fc61411f2bfc5e432de5a",
      "hash-28eed3da2b123334c7913d84c4aea0ed426fd268d29410cb12c6bc8a453183f6",
    ],
    pathwithcontractHash: [
      "hash-0885c63f5f25ec5b6f3b57338fae5849aea5f1a2c96fc61411f2bfc5e432de5a",
      "hash-28eed3da2b123334c7913d84c4aea0ed426fd268d29410cb12c6bc8a453183f6",
    ],
    success: true,
  };
  const path = response.pathwithcontractHash.map((x) => new CLString(x));

  const args = RuntimeArgs.fromMap({
    amount_in: CLValueBuilder.u256(2000000000),
    amount_out_min: CLValueBuilder.u256(10012),
    path: new CLList(path),
    to: new CLKey(new CLAccountHash((senderPublicKey as CLPublicKey).toAccountHash())),
    deadline: CLValueBuilder.u256(1739598100811),

    // Deploy wasm params
    amount: CLValueBuilder.u512(2000000000),
    entrypoint: CLValueBuilder.string(entryPoint),
    package_hash: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(config.router_package_hash, "hex")))),
  });

  const filePath = join(__dirname, "session-code-router.wasm");
  console.log(`### ${filePath}`);

  const wasmBuffer = fs.readFileSync(filePath);
  const wasmArray = new Uint8Array(wasmBuffer);

  const deployItem1 = DeployUtil.ExecutableDeployItem.newModuleBytes(wasmArray, args);

  const deployParams = new DeployUtil.DeployParams(senderPublicKey, config.network_name);

  const deployCost = DeployUtil.standardPayment(35000000000);
  const deploy = DeployUtil.makeDeploy(deployParams, deployItem1, deployCost);

  const signedDeeploy = DeployUtil.signDeploy(deploy, faucetKey);

  const client = new CasperServiceByJsonRPC("http://85.114.132.133:7777/rpc");

  console.log(`######## Sending deploy ... ${signedDeeploy}`);
  console.log({ ...signedDeeploy });
  const { deploy_hash } = await client.deploy(signedDeeploy);
  console.log(`######## Deploy Hash ${deploy_hash}`);
  const result = await client.waitForDeploy(deploy, 100000);

  console.log(`######### all good `, result.deploy.hash);
};
