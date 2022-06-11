import type { Principal } from '@dfinity/principal';
export type CanisterID = Principal;
export type CanisterIDText = string;
export type Error = { 'other' : string } |
  { 'alreadyRegistered' : string } |
  { 'unauthorized' : string } |
  { 'notYetRegistered' : string };
export interface NFTBarter {
  'getAllChildCanisters' : () => Promise<Array<[CanisterID, UserId]>>,
  'getMyChildCanisters' : () => Promise<Result_2>,
  'getMyProfile' : () => Promise<Result_1>,
  'getTargetNftCanisterId' : () => Promise<CanisterID>,
  'isFamily' : (arg_0: CanisterIDText) => Promise<boolean>,
  'isRegistered' : () => Promise<boolean>,
  'mintChildCanister' : () => Promise<Result>,
  'register' : () => Promise<Result_1>,
  'updateTargetNftCanisterId' : (arg_0: CanisterID) => Promise<Result>,
}
export type Result = { 'ok' : CanisterID } |
  { 'err' : Error };
export type Result_1 = { 'ok' : UserProfile } |
  { 'err' : Error };
export type Result_2 = { 'ok' : Array<CanisterID> } |
  { 'err' : Error };
export type UserId = Principal;
export type UserProfile = { 'none' : null };
export interface _SERVICE extends NFTBarter {}
