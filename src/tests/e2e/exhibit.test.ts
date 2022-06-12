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

// beforeAll has long-running calls
jest.setTimeout(120000);

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
