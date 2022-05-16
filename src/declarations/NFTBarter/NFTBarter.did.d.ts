import type { Principal } from '@dfinity/principal';
export type Error = { 'other' : string } |
  { 'alreadyRegistered' : string } |
  { 'unauthorized' : string } |
  { 'notYetRegistered' : string };
export interface NFTBarter {
  'getMyProfile' : () => Promise<Result>,
  'isRegistered' : () => Promise<boolean>,
  'mintChildCanister' : () => Promise<Principal>,
  'register' : () => Promise<Result>,
}
export type Result = { 'ok' : UserProfile } |
  { 'err' : Error };
export type UserProfile = { 'none' : null };
export interface _SERVICE extends NFTBarter {}
