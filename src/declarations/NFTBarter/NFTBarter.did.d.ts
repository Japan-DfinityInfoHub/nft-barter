import type { Principal } from '@dfinity/principal';
export type CanisterID = Principal;
export type Error = { 'other' : string } |
  { 'alreadyRegistered' : string } |
  { 'unauthorized' : string } |
  { 'notYetRegistered' : string };
export interface NFTBarter {
  'getMyChildCanisters' : () => Promise<Result_2>,
  'getMyProfile' : () => Promise<Result>,
  'isRegistered' : () => Promise<boolean>,
  'mintChildCanister' : () => Promise<Result_1>,
  'register' : () => Promise<Result>,
}
export type Result = { 'ok' : UserProfile } |
  { 'err' : Error };
export type Result_1 = { 'ok' : CanisterID } |
  { 'err' : Error };
export type Result_2 = { 'ok' : Array<CanisterID> } |
  { 'err' : Error };
export type UserProfile = { 'none' : null };
export interface _SERVICE extends NFTBarter {}
