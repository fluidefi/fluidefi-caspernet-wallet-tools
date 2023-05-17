import { AppDataSource } from "../db";
import { Token, AllPairs } from "../entities";
import { CsprTokenSymbol, WCsprTokenSymbol } from "./constants";

export const getTokenPackageHash = async (tokenSymbol: string): Promise<string> => {
  const dbInstance = AppDataSource.getInstance();
  const tokensRepository = dbInstance.getRepository(Token);
  if (tokenSymbol === CsprTokenSymbol) tokenSymbol = WCsprTokenSymbol;
  const token = await tokensRepository.find({ where: { tokenSymbol } });

  if (!token || token.length !== 1) {
    return "";
  }
  return token[0].tokenAddress;
};

export const getPairContractAddress = async (token0Address: string, token1Address: string): Promise<string> => {
  const dbInstance = AppDataSource.getInstance();
  const pairRepository = dbInstance.getRepository(AllPairs);

  const pair = await pairRepository.find({ where: { token0Address, token1Address } });

  if (!pair || pair.length !== 1) {
    return "";
  }
  return pair[0].contractAddress;
};

export const getAllPairs = async (): Promise<AllPairs[]> => {
  const dbInstance = AppDataSource.getInstance();
  const pairRepository = dbInstance.getRepository(AllPairs);

  const allPairs = await pairRepository.find();

  return allPairs;
};

export const getTokenByAddress = async (tokenAddress: string): Promise<Token | undefined> => {
  const dbInstance = AppDataSource.getInstance();
  const tokensRepository = dbInstance.getRepository(Token);

  const token = await tokensRepository.find({ where: { tokenAddress } });
  if (!token || token.length == 0) {
    return undefined;
  }
  return token[0];
};
