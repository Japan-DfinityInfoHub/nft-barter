import type { Principal } from '@dfinity/principal';
export interface DefiniteUser { 'id' : UserId__1, 'name' : string }
export interface NFTBarter {
  'getMyInfo' : () => Promise<Result_1>,
  'isRegistered' : () => Promise<boolean>,
  'register' : () => Promise<Result>,
}
export type Result = { 'ok' : UserId } |
  { 'err' : string };
export type Result_1 = { 'ok' : DefiniteUser } |
  { 'err' : string };
export type UserId = Principal;
export type UserId__1 = Principal;
export interface _SERVICE extends NFTBarter {}
