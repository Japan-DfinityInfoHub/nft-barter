import { IDL } from '@dfinity/candid';

declare module '../../../declarations/ChildCanister/ChildCanister.did.js' {
  function idlFactory(): IDL.ServiceClass;
}
import {
  _SERVICE as INFTBarter,
  idlFactory,
} from '../../../declarations/ChildCanister/ChildCanister.did.js';
import { curriedCreateActor } from '../../../NFTBarter_assets/src/utils/createActor';

export const createChildCanisterActorByCanisterId =
  curriedCreateActor<INFTBarter>(idlFactory);
