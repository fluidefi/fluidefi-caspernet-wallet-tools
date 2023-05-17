export * from "./pathFinder";
export * from "./http";
export * from "./deployUtils";
export * from "./types";
export * from "./constants";
export * from "./dbUtils";

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const convertToNotes = (value: number): number => {
  return value * 10 ** 9;
};
