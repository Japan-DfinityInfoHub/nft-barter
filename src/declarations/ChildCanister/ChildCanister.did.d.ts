import type { Principal } from '@dfinity/principal';
export interface CanisterIdList { 'myExtStandardNft' : string }
export interface ChildCanister {
  'exhibitMyNft' : (arg_0: bigint) => Promise<Result_1>,
  'getAssetOwners' : () => Promise<Array<[bigint, UserId]>>,
  'getAssets' : () => Promise<Array<[bigint, NftStatus]>>,
  'getAuctions' : () => Promise<Array<[bigint, Array<[UserId, bigint]>]>>,
  'importMyNft' : (arg_0: Nft) => Promise<Result>,
}
export type Error = { 'other' : string } |
  { 'alreadyRegistered' : string } |
  { 'unauthorized' : string } |
  { 'notYetRegistered' : string };
export type Nft = { 'MyExtStandardNft' : TokenIdentifier };
export type NftStatus = { 'Bid' : Nft__1 } |
  { 'Stay' : Nft__1 } |
  { 'Exhibit' : Nft__1 };
export type Nft__1 = { 'MyExtStandardNft' : TokenIdentifier };
export type Result = { 'ok' : bigint } |
  { 'err' : Error };
export type Result_1 = { 'ok' : null } |
  { 'err' : Error };
export type TokenIdentifier = string;
export type UserId = Principal;
export interface _SERVICE extends ChildCanister {}
