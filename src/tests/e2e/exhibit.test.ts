import { Secp256k1KeyIdentity } from '@dfinity/identity';
import { ActorSubclass } from '@dfinity/agent';
import fetch from 'isomorphic-fetch';
import { IDL } from '@dfinity/candid';
import { jest } from '@jest/globals';

declare module '../../declarations/NFTBarter/NFTBarter.did.js' {
  function idlFactory(): IDL.ServiceClass;
}
import {
  CanisterID,
  _SERVICE as INFTBarter,
  idlFactory,
} from '../../declarations/NFTBarter/NFTBarter.did.js';
import {
  MintRequest,
  TokenIdentifier,
  TransferRequest,
  User,
  _SERVICE as IGenerativeArtNFT,
  idlFactory as nftIdlFactory,
} from '../../declarations/GenerativeArtNFT/GenerativeArtNFT.did.js';
declare module '../../declarations/ChildCanister/ChildCanister.did.js' {
  function idlFactory(): IDL.ServiceClass;
}
import {
  Nft,
  _SERVICE as IChildCanister,
  idlFactory as childIdlFactory,
} from '../../declarations/ChildCanister/ChildCanister.did.js';
import { curriedCreateActor } from '../../NFTBarter_assets/src/utils/createActor';
import { GENERATIVE_ART_NFT_CANISTER_ID as generativeNFTCanisterId } from '../../NFTBarter_assets/src/utils/canisterId';
import {
  generateTokenIdentifier,
  principalToAccountIdentifier,
} from '../../NFTBarter_assets/src/utils/ext';
import { getTokenIdAndNftStatusFromAsset } from '../../NFTBarter_assets/src/utils/nft';
import localCanisterIds from '../../../.dfx/local/canister_ids.json';

const canisterId = localCanisterIds.NFTBarter.local;

// We don't import `createNFTBarterActor` from `createNFTBarterActor.ts`
// because it gives an error in jest running on GitHub Actions.
const createNFTBarterActor =
  curriedCreateActor<INFTBarter>(idlFactory)(canisterId);

const createGenerativeNFTActor = curriedCreateActor<IGenerativeArtNFT>(
  nftIdlFactory
)(generativeNFTCanisterId);

const createChildCanisterActorByCanisterId =
  curriedCreateActor<IChildCanister>(childIdlFactory);

const identityOptionOfAlice = {
  agentOptions: {
    identity: Secp256k1KeyIdentity.generate(),
    fetch,
    host: 'http://localhost:8000',
  },
};
const userAlice: User = {
  principal: identityOptionOfAlice.agentOptions.identity.getPrincipal(),
};

const actorOfAlice = createNFTBarterActor(identityOptionOfAlice);
const generativeNFTActorOfAlice = createGenerativeNFTActor(
  identityOptionOfAlice
);

const identityOptionOfBob = {
  agentOptions: {
    identity: Secp256k1KeyIdentity.generate(),
    fetch,
    host: 'http://localhost:8000',
  },
};
const userBob: User = {
  principal: identityOptionOfBob.agentOptions.identity.getPrincipal(),
};

const actorOfBob = createNFTBarterActor(identityOptionOfBob);
const generativeNFTActorOfBob = createGenerativeNFTActor(identityOptionOfBob);

// beforeAll has long-running calls
jest.setTimeout(60000);

describe('Exhibit an NFT test', () => {
  let tokenId: TokenIdentifier;
  let nft: Nft;
  let childCanisterId: CanisterID;
  let childCanisterAccountId: string;
  let childCanisterActorOfAlice: ActorSubclass<IChildCanister>;

  beforeAll(async () => {
    // Mint an NFT
    const mintRequest: MintRequest = {
      to: userAlice,
      metadata: [],
    };
    const tokenIndex = await generativeNFTActorOfAlice.mintNFT(mintRequest);
    tokenId = generateTokenIdentifier(generativeNFTCanisterId, tokenIndex);
    nft = { MyExtStandardNft: tokenId };

    // Mint a child canister
    await actorOfAlice.register();
    const res = await actorOfAlice.mintChildCanister();
    if ('ok' in res) {
      childCanisterId = res.ok;
    }
    childCanisterAccountId = principalToAccountIdentifier(
      childCanisterId.toText(),
      0
    );
    childCanisterActorOfAlice = createChildCanisterActorByCanisterId(
      childCanisterId
    )(identityOptionOfAlice);

    // Transfer the NFT to the child canister
    const childCanister: User = {
      principal: childCanisterId,
    };
    const transferRequest: TransferRequest = {
      from: userAlice,
      to: childCanister,
      token: tokenId,
      notify: false,
      memo: [],
      subaccount: [],
      amount: BigInt(1),
    };
    await generativeNFTActorOfAlice.transfer(transferRequest);
  });

  it('Make sure the child canister is the bearer of the NFT', async () => {
    const res = await generativeNFTActorOfAlice.bearer(tokenId);
    expect(res).toStrictEqual({
      ok: childCanisterAccountId,
    });
  });

  it('Alice can import the NFT to the child canister', async () => {
    const tokenIndexOnChildCanister = BigInt(1);
    const res = await childCanisterActorOfAlice.importMyNft(nft);
    expect(res).toStrictEqual({
      ok: tokenIndexOnChildCanister,
    });
  });

  it('The imported NFT should be registerd as #Stay status', async () => {
    const tokenIndexOnChildCanister = BigInt(1);
    const res = await childCanisterActorOfAlice.getAssets();
    expect(res.length).toBe(1);
    expect(res[0][0]).toBe(tokenIndexOnChildCanister);
    expect(res[0][1]).toStrictEqual({
      Stay: nft,
    });
  });

  it('Alice can exhibit the NFT to the child canister', async () => {
    const tokenIndexOnChildCanister = BigInt(1);
    const res = await childCanisterActorOfAlice.exhibitMyNft(
      tokenIndexOnChildCanister
    );
    expect(res).toStrictEqual({
      ok: null,
    });
  });

  it('The exhibited NFT should be registerd as #Exhibit status', async () => {
    const tokenIndexOnChildCanister = BigInt(1);
    const res = await childCanisterActorOfAlice.getAssets();
    expect(res.length).toBe(1);
    expect(res[0][0]).toBe(tokenIndexOnChildCanister);
    expect(res[0][1]).toStrictEqual({
      Exhibit: nft,
    });
  });
});

describe('Bid an NFT test', () => {
  type TokenIndex = bigint; // TokenIndex in candid file is number, which is wrong.

  let bidTokenId: TokenIdentifier;

  let bidTokenIndex: TokenIndex = BigInt(1); // Assume Bob imports only one NFT
  let exhibitTokenIndex: TokenIndex;
  let bidTokenIndexInChildCanisterOfAlice: TokenIndex;

  let bidNft: Nft;

  let childCanisterIdOfAlice: CanisterID;
  let childCanisterIdOfBob: CanisterID;

  let childCanisterAccountIdOfAlice: string;
  let childCanisterAccountIdOfBob: string;

  let childCanisterActorOfAliceCalledByBob: ActorSubclass<IChildCanister>;
  let childCanisterActorOfBob: ActorSubclass<IChildCanister>;

  beforeAll(async () => {
    // Mint an NFT
    const mintRequest: MintRequest = {
      to: userBob,
      metadata: [],
    };
    const tokenIndex = await generativeNFTActorOfBob.mintNFT(mintRequest);
    bidTokenId = generateTokenIdentifier(generativeNFTCanisterId, tokenIndex);
    bidNft = { MyExtStandardNft: bidTokenId };

    // Mint a child canister
    await actorOfBob.register();
    const res = await actorOfBob.mintChildCanister();
    if ('ok' in res) {
      childCanisterIdOfBob = res.ok;
    }

    childCanisterActorOfBob =
      createChildCanisterActorByCanisterId(childCanisterIdOfBob)(
        identityOptionOfBob
      );

    // Transfer the NFT to the child canister
    const childCanister: User = {
      principal: childCanisterIdOfBob,
    };
    const transferRequest: TransferRequest = {
      from: userBob,
      to: childCanister,
      token: bidTokenId,
      notify: false,
      memo: [],
      subaccount: [],
      amount: BigInt(1),
    };
    await generativeNFTActorOfBob.transfer(transferRequest);

    // Get Alice's child canister ids
    const childCanisters = await actorOfBob.getAllChildCanisters();
    childCanisterIdOfAlice = childCanisters.filter(([_, userId]) => {
      return userId.toText() === userAlice.principal.toText();
    })[0][0];
    childCanisterActorOfAliceCalledByBob = createChildCanisterActorByCanisterId(
      childCanisterIdOfAlice
    )(identityOptionOfBob);

    // Get accound id of child canisters
    childCanisterAccountIdOfAlice = principalToAccountIdentifier(
      childCanisterIdOfAlice.toText(),
      0
    );
    childCanisterAccountIdOfBob = principalToAccountIdentifier(
      childCanisterIdOfBob.toText(),
      0
    );
  });

  it('Bob can see auctions opened by Alice', async () => {
    const res = await childCanisterActorOfAliceCalledByBob.getAuctions();

    // Note that this test does not care how many auctions are open
    // but at least one auction must be currently open.
    expect(res.length).toBeGreaterThanOrEqual(1);

    const [tokenIndex, bids] = res[0];
    exhibitTokenIndex = tokenIndex;

    expect(bids.length).toBe(0);
  });

  it("Bob's child canister can import an NFT", async () => {
    const res = await childCanisterActorOfBob.importMyNft(bidNft);
    expect(res).toStrictEqual({
      ok: bidTokenIndex,
    });
  });

  it('Make sure the child canister is the bearer of the NFT', async () => {
    const res = await generativeNFTActorOfBob.bearer(bidTokenId);
    expect(res).toStrictEqual({
      ok: childCanisterAccountIdOfBob,
    });
  });

  it('Bob can offer a bid', async () => {
    const res = await childCanisterActorOfBob.offerBidMyNft({
      exhibitCanisterId: childCanisterIdOfAlice.toText(),
      bidToken: bidTokenIndex,
      exhibitToken: exhibitTokenIndex,
    });
    expect(res).toStrictEqual({
      ok: null,
    });
  });

  it("Now auction includes a bid by Bob (technically, a bid by Bob's child canister)", async () => {
    const res = await childCanisterActorOfAliceCalledByBob.getAuctions();
    const [tokenIndex, bids] = res[0];
    const [bidder, tokenIndexOfBid] = bids[0];
    expect(tokenIndex).toBe(exhibitTokenIndex);
    expect(bids.length).toBe(1);
    expect(tokenIndexOfBid).toBe(bidTokenIndex);
    expect(bidder.toText()).toBe(childCanisterIdOfBob.toText());
  });

  it("Assets in Alice's child canister include a bid by Bob", async () => {
    const assets = await childCanisterActorOfAliceCalledByBob.getAssets();
    const nfts = assets
      .map((asset) => getTokenIdAndNftStatusFromAsset(asset))
      .filter((nft) => nft.tokenId === bidTokenId);
    expect(nfts.length).toBe(1);

    bidTokenIndexInChildCanisterOfAlice = nfts[0].tokenIndexOnChildCanister;
  });

  it("On Alice's child canister, asset owner of the bidded token is Bob's child canister", async () => {
    const res =
      await childCanisterActorOfAliceCalledByBob.getAssetOwnerByTokenIndex(
        bidTokenIndexInChildCanisterOfAlice
      );
    expect(res).toStrictEqual({
      ok: childCanisterIdOfBob,
    });
  });

  it("On the NFT canister, actual asset owner of the bidded token is Alice's child canister", async () => {
    const res = await generativeNFTActorOfBob.bearer(bidTokenId);
    expect(res).toStrictEqual({
      ok: childCanisterAccountIdOfAlice,
    });
  });
});
