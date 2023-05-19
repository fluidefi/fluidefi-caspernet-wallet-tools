import { CasperServiceByJsonRPC } from "casper-js-sdk";

export const getLatestPairContractHashByPackageHash = async (
  casperService: CasperServiceByJsonRPC,
  pairPackageHash: string,
): Promise<string> => {
  const stateHash = await casperService.getStateRootHash();

  const pairPackageInfo = await casperService.getBlockState(stateHash, "hash-" + pairPackageHash, []);

  const latestVersion = pairPackageInfo.ContractPackage?.versions[pairPackageInfo.ContractPackage?.versions.length - 1];

  return latestVersion?.contractHash || "";
};

export const getLatestTokenContractHashByPackageHash = async (
  casperService: CasperServiceByJsonRPC,
  tokenPackageHash: string,
): Promise<string> => {
  const stateHash = await casperService.getStateRootHash();
  const tokenPackageInfo = await casperService.getBlockState(stateHash, "hash-" + tokenPackageHash, []);

  const latestVersion =
    tokenPackageInfo.ContractPackage?.versions[tokenPackageInfo.ContractPackage.versions.length - 1];

  return latestVersion?.contractHash || "";
};
