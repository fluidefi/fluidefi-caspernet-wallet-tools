export * from "./pathFinder";
export * from "./http";
export * from "./deployUtils";
export * from "./types";

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
