const NftStatus = {
  WALLET: 'wallet',
  STAY: 'stay',
  EXHIBIT: 'exhibit',
  BID: 'bid',
} as const;

// type NftStatus = "wallet" | "stay" | "exhibit" | "bid"
export type NftStatus = typeof NftStatus[keyof typeof NftStatus];

export const compareNft = (a: GenerativeArtNFT, b: GenerativeArtNFT) =>
  a.tokenIndex - b.tokenIndex;

export interface GenerativeArtNFT {
  tokenId: string;
  tokenIndex: number;
  status: NftStatus;
}
