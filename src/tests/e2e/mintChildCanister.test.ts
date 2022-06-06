import { Secp256k1KeyIdentity } from '@dfinity/identity';
import fetch from 'isomorphic-fetch';
import { IDL } from '@dfinity/candid';

declare module '../../declarations/NFTBarter/NFTBarter.did.js' {
  function idlFactory(): IDL.ServiceClass;
}
import {
  CanisterID,
  UserId,
  _SERVICE as INFTBarter,
  idlFactory,
} from '../../declarations/NFTBarter/NFTBarter.did.js';
import { curriedCreateActor } from '../../NFTBarter_assets/src/utils/createActor';
import localCanisterIds from '../../../.dfx/local/canister_ids.json';

const canisterId = localCanisterIds.NFTBarter.local;

// We don't import `createNFTBarterActor` from `createNFTBarterActor.ts`
// because it gives an error in jest running on GitHub Actions.
const createNFTBarterActor =
  curriedCreateActor<INFTBarter>(idlFactory)(canisterId);

const identityOptionOfAlice = {
  agentOptions: {
    identity: Secp256k1KeyIdentity.generate(),
    fetch,
    host: 'http://localhost:8000',
  },
};
const actorOfAlice = createNFTBarterActor(identityOptionOfAlice);

const identityOptionOfAnonymous = {
  agentOptions: {
    fetch,
    host: 'http://localhost:8000',
  },
};
const actorOfAnonymous = createNFTBarterActor(identityOptionOfAnonymous);

describe('Mint child canister test', () => {
  let childCanisterId: CanisterID;

  beforeAll(async () => {
    await actorOfAlice.register();
  });

  it('Alice can mint a child canister', async () => {
    const res = await actorOfAlice.mintChildCanister();
    expect(res).toStrictEqual({
      ok: expect.anything(),
    });
    if ('ok' in res) {
      childCanisterId = res.ok;
    }
    expect(childCanisterId._isPrincipal).toBe(true);
  });

  it('Alice can get her child caniser', async () => {
    let res = await actorOfAlice.getMyChildCanisters();
    expect(res).toStrictEqual({
      ok: [childCanisterId],
    });
  });

  it('The child canister of Alice is in the list of all child canister', async () => {
    let principal = identityOptionOfAlice.agentOptions.identity.getPrincipal();
    let allChildCanisters: [CanisterID, UserId][] =
      await actorOfAlice.getAllChildCanisters();
    expect(allChildCanisters).toContainEqual([childCanisterId, principal]);
  });
});

describe('Anonymous tests', () => {
  it('Anomymous identity can not mint any child canister.', async () => {
    const res = await actorOfAnonymous.mintChildCanister();
    expect(res).toEqual({
      err: {
        unauthorized: expect.anything(),
      },
    });
  });

  it('Anonymous identity never has its own child canister.', async () => {
    const res = await actorOfAnonymous.getMyChildCanisters();
    expect(res).toEqual({
      err: {
        unauthorized: expect.anything(),
      },
    });
  });
});
