import type { Principal } from '@dfinity/principal';
export interface NFTBarter {
  'getMyProfile' : () => Promise<Result_1>,
  'isRegistered' : () => Promise<boolean>,
  'register' : () => Promise<Result>,
}
export type Result = { 'ok' : UserId } |
  { 'err' : string };
export type Result_1 = { 'ok' : UserProfile } |
  { 'err' : string };
export type UserId = Principal;
export type UserProfile = { 'none' : null };
export interface _SERVICE extends NFTBarter {}
