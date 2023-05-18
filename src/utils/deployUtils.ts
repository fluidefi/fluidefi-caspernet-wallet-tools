import BigNumber from "bignumber.js";
import {
  CLPublicKey,
  CasperClient,
  CasperServiceByJsonRPC,
  DeployUtil,
  GetDeployResult,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";
import { sleep } from ".";
import { readFileSync } from "fs";
import { join } from "path";
import { ERROR_BLOCKCHAIN } from "../exceptions/blockChainErrors";
import { UserError } from "../exceptions";

export const signAndDeployContractCall = async (
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  publicKey: CLPublicKey,
  faucetKey: Keys.AsymmetricKey,
  contractHash: string,
  entryPoint: string,
  args: RuntimeArgs,
  gas: BigNumber,
  network: string,
): Promise<[string, GetDeployResult]> => {
  try {
    // Convert contract hash to bytes
    const contractHashAsByteArray = Uint8Array.from(Buffer.from(contractHash, "hex"));

    // Create the deploy item using contractHash + entryPoint + args
    const deployItem = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      contractHashAsByteArray,
      entryPoint,
      args,
    );

    // Convert the signed deploy json to a deploy
    const signedDeploy = await makeAndSignDeploy(publicKey, deployItem, gas, faucetKey, network);

    // Put and confirm deploy
    return putAndConfirmDeploy(client, casperService, signedDeploy);
  } catch (err) {
    console.error(`Casper Client - signAndDeployContractCall error: ${err}`);

    // rethrow error
    throw err;
  }
};

export const signAndDeployWasm = async (
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  publicKey: CLPublicKey,
  faucetKey: Keys.AsymmetricKey,
  args: RuntimeArgs,
  gas: BigNumber,
  network: string,
): Promise<[string, GetDeployResult]> => {
  try {
    const wasm = new Uint8Array(readFileSync(join(__dirname, "session-code-router.wasm")));

    // Create the deploy item using wasm + args
    const deployItem = DeployUtil.ExecutableDeployItem.newModuleBytes(new Uint8Array(wasm), args);
    // Convert the signed deploy json to a deploy
    const signedDeploy = await makeAndSignDeploy(publicKey, deployItem, gas, faucetKey, network);
    // Put and confirm deploy
    return putAndConfirmDeploy(client, casperService, signedDeploy);
  } catch (err) {
    console.error(`Casper Client - signAndDeployWasm error: ${err}`);

    // rethrow error
    throw err;
  }
};

export const makeAndSignDeploy = async (
  publicKey: CLPublicKey,
  deployItem: DeployUtil.ExecutableDeployItem,
  gas: BigNumber,
  faucetKey: Keys.AsymmetricKey,
  network: string,
): Promise<DeployUtil.Deploy> => {
  try {
    // Create the Deploy using wasm + args
    const deploy = DeployUtil.makeDeploy(
      new DeployUtil.DeployParams(publicKey as CLPublicKey, network),
      deployItem,
      DeployUtil.standardPayment(gas.toNumber()),
    );

    return DeployUtil.signDeploy(deploy, faucetKey);
  } catch (err) {
    console.error(`Casper Client - putAndConfirmDeploy error: ${err}`);

    // rethrow error
    throw err;
  }
};

export const putAndConfirmDeploy = async (
  client: CasperClient,
  casperService: CasperServiceByJsonRPC,
  signedDeploy: DeployUtil.Deploy,
): Promise<[string, GetDeployResult]> => {
  try {
    const { deploy_hash: deployHash } = await casperService.deploy(signedDeploy);

    const [_, deployResult] = await getDeploy(client, deployHash);

    return [deployHash, deployResult];
  } catch (err) {
    console.error(`Casper Client - putAndConfirmDeploy error: ${err}`);

    // rethrow error
    throw err;
  }
};

export const getDeploy = async (
  client: CasperClient,
  deployHash: string,
  ticks = 5,
): Promise<[DeployUtil.Deploy, GetDeployResult]> => {
  try {
    let deployCheck = 0;
    // Get the deploy hash from the network

    while (deployCheck < ticks) {
      try {
        return await client.getDeploy(deployHash);
      } catch (e) {
        deployCheck++;
        await sleep(1000);
      }
    }
    throw new Error("Could not confirm deploy.");
  } catch (err) {
    console.error(`Casper Client - getDeploy error: ${err}`);

    // rethrow error
    throw err;
  }
};

/**
 * Async attempt to retrieve deploy but wits until the deploy execution is completed
 *
 * @param deployHash string deploy hash
 * @param ticks number of times before giving up
 *
 * @returns the an array with deploy and deploy result or throw error
 */
export const waitForDeployExecution = async (
  casperClient: CasperClient,
  deployHash: string,
  ticks = 90,
): Promise<[DeployUtil.Deploy, GetDeployResult]> => {
  let i = 0;
  while (i !== ticks) {
    try {
      const [deploy, raw] = await casperClient.getDeploy(deployHash);
      if (raw.execution_results.length !== 0) {
        if (raw.execution_results[0].result.Success) {
          return [deploy, raw];
        } else {
          throw Error("Contract execution: " + raw.execution_results[0].result.Failure?.error_message);
        }
      } else {
        i++;
        await sleep(1000);
      }
    } catch (e: any) {
      if (ERROR_BLOCKCHAIN[`${e}`] != null) {
        throw { userError: true, msg: ERROR_BLOCKCHAIN[`${e}`].message, deployHash } as UserError;
      }
      i++;
      await sleep(1000);
    }
  }
  throw { timeout: true, msg: "Timeout after " + i + "s.", deployHash };
};
