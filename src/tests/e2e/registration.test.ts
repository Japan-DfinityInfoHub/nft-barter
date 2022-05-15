import { Secp256k1KeyIdentity } from '@dfinity/identity';
import fetch from 'isomorphic-fetch';
import { IDL } from '@dfinity/candid';

declare module '../../declarations/NFTBarter/NFTBarter.did.js' {
  function idlFactory(): IDL.ServiceClass;
}
import {
  UserProfile,
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

const initialUserProfile: UserProfile = { none: null };

describe('User registration tests', () => {
  it('Alice is not registered yet.', async () => {
    expect(await actorOfAlice.isRegistered()).toBe(false);
  });

  it('Alice has no profile yet.', async () => {
    const res = await actorOfAlice.getMyProfile();
    if (!('err' in res)) {
      throw new Error('getMyProfile should return err berofe registration.');
    }
  });

  it('Alice can be registered.', async () => {
    const res = await actorOfAlice.register();
    expect(res).toStrictEqual({
      ok: initialUserProfile,
    });
  });

  it('Alice is already registered.', async () => {
    expect(await actorOfAlice.isRegistered()).toBe(true);
  });

  it('Now Alice has her own profile with initial values.', async () => {
    const res = await actorOfAlice.getMyProfile();
    expect(res).toStrictEqual({
      ok: initialUserProfile,
    });
  });
});

describe('Anonymous registration tests', () => {
  it('Anomymous identity can not register.', async () => {
    const res = await actorOfAnonymous.register();
    expect(res).toStrictEqual({
      err: 'You need to be authenticated.',
    });
  });

  it('Anonymous identity never has its own profile.', async () => {
    const res = await actorOfAnonymous.getMyProfile();
    expect(res).toStrictEqual({
      err: 'You are not registered.',
    });
  });

  it('Anonymous identity never be registered.', async () => {
    expect(await actorOfAnonymous.isRegistered()).toBe(false);
  });
});
