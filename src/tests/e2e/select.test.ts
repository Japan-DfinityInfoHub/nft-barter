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
  UserId,
  TokenIndex,
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
const aliceAccountId = principalToAccountIdentifier(
  userAlice.principal.toText(),
  0
);

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
jest.setTimeout(120000);

describe('Select NFT test', () => {
  let numberOfBids = 4;

  let bidTokenIds: TokenIdentifier[];
  let exhibitTokenId: TokenIdentifier;

  let bidNfts: Nft[];
  let exhibitNft: Nft;

  let bidTokenIndexInChildCanisterOfBob: TokenIndex[];

  let exhibitTokenIndex: TokenIndex;
  let bidTokenIndexInChildCanisterOfAlice: number[];

  let childCanisterIdOfAlice: CanisterID;
  let childCanisterIdOfBob: CanisterID;

  let childCanisterAccountIdOfAlice: string;
  let childCanisterAccountIdOfBob: string;

  let childCanisterActorOfAlice: ActorSubclass<IChildCanister>;
  let childCanisterActorOfAliceCalledByBob: ActorSubclass<IChildCanister>;
  let childCanisterActorOfBob: ActorSubclass<IChildCanister>;

  let auction: [TokenIndex, UserId][];

  let selectedTokenIndex: TokenIndex;

  beforeAll(async () => {
    // Alice exhibits NFT
    {
      // Mint an NFT
      const mintRequest: MintRequest = {
        to: userAlice,
        metadata: [],
      };
      const tokenIndex = await generativeNFTActorOfAlice.mintNFT(mintRequest);
      exhibitTokenId = generateTokenIdentifier(
        generativeNFTCanisterId,
        tokenIndex
      );
      exhibitNft = { MyExtStandardNft: exhibitTokenId };

      // Mint a child canister
      await actorOfAlice.register();
      const res = await actorOfAlice.mintChildCanister();
      if ('ok' in res) {
        childCanisterIdOfAlice = res.ok;
      }
      childCanisterAccountIdOfAlice = principalToAccountIdentifier(
        childCanisterIdOfAlice.toText(),
        0
      );
      childCanisterActorOfAlice = createChildCanisterActorByCanisterId(
        childCanisterIdOfAlice
      )(identityOptionOfAlice);

      // Transfer the NFT to the child canister
      const childCanisterOfAlice: User = {
        principal: childCanisterIdOfAlice,
      };
      const transferRequest: TransferRequest = {
        from: userAlice,
        to: childCanisterOfAlice,
        token: exhibitTokenId,
        notify: false,
        memo: [],
        subaccount: [],
        amount: BigInt(1),
      };
      await generativeNFTActorOfAlice.transfer(transferRequest);

      const tokenIndexOnChildCanister = BigInt(1);
      await childCanisterActorOfAlice.importMyNft(exhibitNft);
      await childCanisterActorOfAlice.exhibitMyNft(tokenIndexOnChildCanister);
    }
    // Bob
    {
      // Mint an NFT
      const mintRequest: MintRequest = {
        to: userBob,
        metadata: [],
      };

      bidTokenIds = await Promise.all(
        new Array(numberOfBids).fill(0).map(async (_) => {
          const tokenIndexExt = await generativeNFTActorOfBob.mintNFT(
            mintRequest
          );
          return generateTokenIdentifier(
            generativeNFTCanisterId,
            tokenIndexExt
          );
        })
      );

      bidNfts = bidTokenIds.map((tokenId) => {
        return { MyExtStandardNft: tokenId };
      });

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
      await Promise.all(
        bidTokenIds.map(async (bidTokenId) => {
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
        })
      );
      // Import NFT
      bidTokenIndexInChildCanisterOfBob = await Promise.all(
        bidNfts.map(async (bidNft) => {
          const res = await childCanisterActorOfBob.importMyNft(bidNft);
          return 'ok' in res ? res.ok : BigInt(0);
        })
      );

      childCanisterActorOfAliceCalledByBob =
        createChildCanisterActorByCanisterId(childCanisterIdOfAlice)(
          identityOptionOfBob
        );

      childCanisterAccountIdOfBob = principalToAccountIdentifier(
        childCanisterIdOfBob.toText(),
        0
      );

      // Get auction
      const auctions = await childCanisterActorOfAliceCalledByBob.getAuctions();
      exhibitTokenIndex = auctions[0][0];
    }
  });

  it('Bob can offer multiple bids', async () => {
    bidTokenIndexInChildCanisterOfAlice = await Promise.all(
      bidTokenIndexInChildCanisterOfBob.map(async (bidTokenIndex) => {
        const res = await childCanisterActorOfBob.offerBidMyNft({
          exhibitCanisterId: childCanisterIdOfAlice.toText(),
          bidToken: bidTokenIndex,
          exhibitToken: exhibitTokenIndex,
        });
        return 'ok' in res ? Number(res.ok) : 0;
      })
    );
    expect(bidTokenIndexInChildCanisterOfAlice).not.toContain(0);
  });

  it('Multiple bids can be found', async () => {
    const res =
      await childCanisterActorOfAliceCalledByBob.getAuctionByTokenIndex(
        exhibitTokenIndex
      );
    auction = 'ok' in res ? res.ok : [];
    expect(auction.length).toBeGreaterThanOrEqual(numberOfBids);
  });

  it('Alice can select a NFT', async () => {
    selectedTokenIndex = BigInt(bidTokenIndexInChildCanisterOfAlice[0]);
    const res = await childCanisterActorOfAlice.selectTokenInAuction({
      selectedTokenIndex,
      exhibitTokenIndex,
    });
    expect(res).toStrictEqual({
      ok: null,
    });
  });

  it("Now the owner of selected token is Alice's child canister", async () => {
    const res =
      await childCanisterActorOfAliceCalledByBob.getAssetOwnerByTokenIndex(
        selectedTokenIndex
      );
    expect(res).toStrictEqual({
      ok: childCanisterIdOfAlice,
    });
  });

  it("Now the owner of exhibited token is Bob's child canister", async () => {
    const res =
      await childCanisterActorOfAliceCalledByBob.getAssetOwnerByTokenIndex(
        exhibitTokenIndex
      );
    expect(res).toStrictEqual({
      ok: childCanisterIdOfBob,
    });
  });

  it('Check if the new status of selected nft is #Selected', async () => {
    const res = await childCanisterActorOfAliceCalledByBob.getAssetByTokenIndex(
      selectedTokenIndex
    );
    expect(res).toStrictEqual({
      ok: {
        Selected: expect.anything(),
      },
    });
  });

  it('Check if Alice can withdraw NFT that she has selected', async () => {
    let tokenIdentifier: string;
    {
      const res = await childCanisterActorOfAlice.withdrawNft(
        selectedTokenIndex
      );
      expect(res).toStrictEqual({
        ok: {
          MyExtStandardNft: expect.anything(),
        },
      });
      tokenIdentifier = 'ok' in res ? res.ok.MyExtStandardNft : '';
    }
    {
      const res = await generativeNFTActorOfAlice.bearer(tokenIdentifier);
      expect(res).toStrictEqual({
        ok: aliceAccountId,
      });
    }
  });

  it('Check if the new status of exhibit nft is #ExhibitEnd', async () => {
    const res = await childCanisterActorOfAliceCalledByBob.getAssetByTokenIndex(
      exhibitTokenIndex
    );
    expect(res).toStrictEqual({
      ok: {
        ExhibitEnd: {
          MyExtStandardNft: expect.anything(),
        },
      },
    });
  });

  it('Check if the status of non-selected nfts are #NotSelected', async () => {
    const nonSelectedTokenIndices = bidTokenIndexInChildCanisterOfAlice.filter(
      (t) => {
        return t !== Number(selectedTokenIndex);
      }
    );
    nonSelectedTokenIndices.forEach(async (t) => {
      const res =
        await childCanisterActorOfAliceCalledByBob.getAssetByTokenIndex(
          BigInt(t)
        );
      expect(res).toStrictEqual({
        ok: {
          NotSelected: {
            MyExtStandardNft: expect.anything(),
          },
        },
      });
    });
  });
});
