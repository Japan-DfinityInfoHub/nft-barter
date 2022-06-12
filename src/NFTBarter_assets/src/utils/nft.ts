import { Identity } from '@dfinity/agent';
import { NftStatus, ExhibitToken, Nft } from '../models/NftModel';
import { createChildCanisterActorByCanisterId } from './createChildCanisterActor';
import { decodeTokenId } from './ext';
import { createNFTBarterActor } from './createNFTBarterActor';

import { TokenIdentifier } from '../../../declarations/GenerativeArtNFT/GenerativeArtNFT.did.js';
import { CanisterID } from '../../../declarations/NFTBarter/NFTBarter.did';
import { NftStatus as NftStatusCandid } from '../../../declarations/ChildCanister/ChildCanister.did';

export const fetchAllNftsOnChildCanister = async (
  childCanisterId: CanisterID,
  identity?: Identity
): Promise<Nft[]> => {
  const actor = createChildCanisterActorByCanisterId(childCanisterId)({
    agentOptions: { identity },
  });
  const assets = await actor.getAssets();
  const nfts: Nft[] = assets.map((asset) => {
    return getTokenIdAndNftStatusFromAsset(asset);
  });
  return nfts;
};

export const fetchAllExhibitedNft = async (): Promise<ExhibitToken[]> => {
  const actor = createNFTBarterActor({});
  const allChildCanisters = await actor.getAllChildCanisters();
  const allExhibitNfts = await Promise.all(
    allChildCanisters.map(async (childCanister): Promise<ExhibitToken[]> => {
      const [exhibitCanisterId, _] = childCanister;
      const allNfts = await fetchAllNftsOnChildCanister(exhibitCanisterId);
      return allNfts
        .filter((nft) => nft.status === 'exhibit')
        .map((nft) => {
          return {
            exhibitTokenIndex: nft.tokenIndex,
            exhibitCanisterId: exhibitCanisterId.toText(),
            nft,
          };
        });
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
  } else if ('ExhibitEnd' in stat) {
    tokenId = stat.ExhibitEnd.nft.MyExtStandardNft;
    nftStatus = 'exhibitEnd';
  } else if ('BidOffering' in stat) {
    tokenId = stat.BidOffering.nft.MyExtStandardNft;
    nftStatus = 'bidOffering';
  } else if ('BidOffered' in stat) {
    tokenId = stat.BidOffered.nft.MyExtStandardNft;
    nftStatus = 'bidOffered';
  } else if ('Pending' in stat) {
    tokenId = stat.Pending.nft.MyExtStandardNft;
    nftStatus = 'pending';
  } else if ('Selected' in stat) {
    tokenId = stat.Selected.MyExtStandardNft;
    nftStatus = 'selected';
  } else if ('NotSelected' in stat) {
    tokenId = stat.NotSelected.MyExtStandardNft;
    nftStatus = 'notSelected';
  } else if ('Winning' in stat) {
    tokenId = stat.Winning.nft.MyExtStandardNft;
    nftStatus = 'winning';
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
