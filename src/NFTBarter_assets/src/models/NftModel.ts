const NftStatus = {
  WALLET: 'wallet',
  STAY: 'stay',
  EXHIBIT: 'exhibit',
  EXHIBITEND: 'exhibitEnd',
  BIDOFFERING: 'bidOffering',
  BIDOFFERED: 'bidOffered',
  PENDING: 'pending',
  SELECTED: 'selected',
  NOTSELECTED: 'notSelected',
  WINNING: 'winning',
} as const;

// type NftStatus = "wallet" | "stay" | "exhibit" | "exhibitEnd" | "bidOffering" |
// "bidOffered" | "pending" | "selected" | "notSelected" | "winning"
export type NftStatus = typeof NftStatus[keyof typeof NftStatus];

export const compareNft = (a: GenerativeArtNFT, b: GenerativeArtNFT) =>
  a.tokenIndex - b.tokenIndex;

export interface GenerativeArtNFT {
  tokenId: string;
  tokenIndex: number;
  status: NftStatus;
}

export type Nft = GenerativeArtNFT;

export interface ExhibitToken {
  exhibitTokenIndex: number;
  exhibitCanisterId: string;
  nft: Nft;
}
