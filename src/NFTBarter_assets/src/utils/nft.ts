import { Identity } from '@dfinity/agent';
import { GenerativeArtNFT, NftStatus } from '../models/NftModel';
import { createChildCanisterActorByCanisterId } from './createChildCanisterActor';
import { decodeTokenId } from './ext';
import { createNFTBarterActor } from './createNFTBarterActor';

import { TokenIdentifier } from '../../../declarations/GenerativeArtNFT/GenerativeArtNFT.did.js';
import { CanisterID } from '../../../declarations/NFTBarter/NFTBarter.did';
import { NftStatus as NftStatusCandid } from '../../../declarations/ChildCanister/ChildCanister.did';

export const fetchAllNftsOnChildCanister = async (
  childCanisterId: CanisterID,
  identity?: Identity
) => {
  const actor = createChildCanisterActorByCanisterId(childCanisterId)({
    agentOptions: { identity },
  });
  const assets = await actor.getAssets();
  const nfts: GenerativeArtNFT[] = assets.map((asset) => {
    return getTokenIdAndNftStatusFromAsset(asset);
  });
  return nfts;
};

export const fetchAllExhibitedNft = async (): Promise<GenerativeArtNFT[]> => {
  const actor = createNFTBarterActor({});
  const allChildCanisters = await actor.getAllChildCanisters();
  const allExhibitNfts = await Promise.all(
    allChildCanisters.map(async (allChildCanister) => {
      const [childCanisterId, _] = allChildCanister;
      const allNfts = await fetchAllNftsOnChildCanister(childCanisterId);
      return allNfts.filter((nft) => nft.status === 'exhibit');
    })
  );
  return allExhibitNfts.flat();
};

export const getTokenIdAndNftStatusFromAsset = (
  asset: [bigint, NftStatusCandid]
) => {
  const [tokenIndexOnChildCanister, stat] = asset;
  let tokenId: TokenIdentifier;
  let nftStatus: NftStatus;
  if ('Stay' in stat) {
    tokenId = stat.Stay.MyExtStandardNft;
    nftStatus = 'stay';
  } else if ('Exhibit' in stat) {
    tokenId = stat.Exhibit.MyExtStandardNft;
    nftStatus = 'exhibit';
  } else if ('BidOffering' in stat) {
    tokenId = stat.BidOffering.nft.MyExtStandardNft;
    nftStatus = 'bidOffering';
  } else if ('BidOffered' in stat) {
    tokenId = stat.BidOffered.nft.MyExtStandardNft;
    nftStatus = 'bidOffered';
  } else if ('Pending' in stat) {
    tokenId = stat.Pending.nft.MyExtStandardNft;
    nftStatus = 'pending';
  } else {
    throw new Error('Invalid token');
  }
  const { index } = decodeTokenId(tokenId);
  return {
    tokenId,
    tokenIndex: index,
    tokenIndexOnChildCanister,
    status: nftStatus,
  };
};
