import type { Principal } from '@dfinity/principal';
export interface NFTBarter {
  'getMyProfile' : () => Promise<Result>,
  'isRegistered' : () => Promise<boolean>,
  'register' : () => Promise<Result>,
}
export type Result = { 'ok' : UserProfile } |
  { 'err' : string };
export type UserProfile = { 'none' : null };
export interface _SERVICE extends NFTBarter {}
