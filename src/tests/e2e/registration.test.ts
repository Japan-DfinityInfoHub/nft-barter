import { Secp256k1KeyIdentity } from '@dfinity/identity';
import fetch from 'isomorphic-fetch';
import { IDL } from '@dfinity/candid';

declare module '../../declarations/NFTBarter/NFTBarter.did.js' {
  function idlFactory(): IDL.ServiceClass;
}
import {
  _SERVICE as INFTBarter,
  idlFactory,
} from '../../declarations/NFTBarter/NFTBarter.did.js';
import { curriedCreateActor } from '../../NFTBarter_assets/src/utils/createActor';
import localCanisterIds from '../../../.dfx/local/canister_ids.json';

const canisterId = localCanisterIds.NFTBarter.local;

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

describe('User registration tests', () => {
  it('Alice is not registered yet.', async () => {
    expect(await actorOfAlice.isRegistered()).toBe(false);
  });

  it('Alice can be registered.', async () => {
    const res = await actorOfAlice.register();
    if ('ok' in res) {
      expect(res.ok._isPrincipal).toBe(true);
    } else {
      throw new Error(res.err);
    }
  });

  it('Alice is already registered.', async () => {
    expect(await actorOfAlice.isRegistered()).toBe(true);
  });
});
