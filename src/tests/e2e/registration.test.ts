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
    if ('ok' in res) {
      expect(res.ok).toStrictEqual(initialUserProfile);
    } else {
      throw new Error(res.err);
    }
  });

  it('Alice is already registered.', async () => {
    expect(await actorOfAlice.isRegistered()).toBe(true);
  });

  it('Now Alice has her own profile with initial values.', async () => {
    const res = await actorOfAlice.getMyProfile();
    if ('ok' in res) {
      expect(res.ok).toStrictEqual(initialUserProfile);
    } else {
      throw new Error(res.err);
    }
  });
});
