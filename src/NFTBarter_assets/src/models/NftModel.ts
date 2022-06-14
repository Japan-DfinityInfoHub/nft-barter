export const nftStatus = [
  'wallet',
  'stay',
  'exhibit',
  'exhibitEnd',
  'bidOffering',
  'bidOffered',
  'pending',
  'selected',
  'notSelected',
  'winning',
] as const;

export const withdrawableNftStatus = [
  'stay',
  'exhibit',
  'bidOffering',
  'selected',
  'winning',
] as const;

// type NftStatus = "wallet" | "stay" | "exhibit" | "exhibitEnd" | "bidOffering" |
// "bidOffered" | "pending" | "selected" | "notSelected" | "winning"
export type NftStatus = typeof nftStatus[number];

export type WithdrawableNftStatus = typeof withdrawableNftStatus[number];

export type GenerativeArtNFT = {
  tokenId: string;
  tokenIndex: number;
  status: NftStatus;
};

export type Nft = GenerativeArtNFT;

export type NftOnChildCanisters = {
  tokenId: string;
  tokenIndex: number;
  status: NftStatus;
  childCanisterId: string;
  tokenIndexOnChildCanister: number;
};

export type ExhibitToken = {
  exhibitTokenIndex: number;
  exhibitCanisterId: string;
  nft: Nft;
};
