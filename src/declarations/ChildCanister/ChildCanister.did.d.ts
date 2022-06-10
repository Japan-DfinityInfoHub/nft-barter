import type { Principal } from '@dfinity/principal';
export type CanisterIDText = string;
export type CanisterIDText__1 = string;
export interface CanisterIdList { 'myExtStandardNft' : CanisterIDText }
export interface ChildCanister {
  'acceptBidOffer' : (
      arg_0: { 'bidToken' : TokenIndex, 'exhibitToken' : TokenIndex },
    ) => Promise<Result_1>,
  'exhibitMyNft' : (arg_0: TokenIndex) => Promise<Result_1>,
  'getAssetOwnerByTokenIndex' : (arg_0: TokenIndex) => Promise<Result_3>,
  'getAssetOwners' : () => Promise<Array<[TokenIndex, UserId]>>,
  'getAssets' : () => Promise<Array<[TokenIndex, NftStatus]>>,
  'getAuctions' : () => Promise<
      Array<[TokenIndex, Array<[UserId, TokenIndex]>]>
    >,
  'importMyNft' : (arg_0: Nft) => Promise<Result_2>,
  'offerBidMyNft' : (
      arg_0: {
        'exhibitCanisterId' : CanisterIDText__1,
        'bidToken' : TokenIndex,
        'exhibitToken' : TokenIndex,
      },
    ) => Promise<Result_1>,
  'sendToMe' : (arg_0: TokenIndex) => Promise<Result>,
}
export type Error = { 'other' : string } |
  { 'alreadyRegistered' : string } |
  { 'unauthorized' : string } |
  { 'notYetRegistered' : string };
export type Nft = { 'MyExtStandardNft' : TokenIdentifier };
export type NftStatus = {
    'BidOffered' : {
      'nft' : Nft__1,
      'from' : CanisterIDText,
      'exhibitNftIndex' : TokenIndex__1,
    }
  } |
  { 'Stay' : Nft__1 } |
  { 'Exhibit' : Nft__1 } |
  {
    'BidOffering' : {
      'to' : CanisterIDText,
      'nft' : Nft__1,
      'exhibitNftIndex' : TokenIndex__1,
    }
  } |
  { 'Pending' : { 'nft' : Nft__1, 'recipient' : CanisterIDText } };
export type Nft__1 = { 'MyExtStandardNft' : TokenIdentifier };
export type Result = { 'ok' : Nft } |
  { 'err' : Error };
export type Result_1 = { 'ok' : null } |
  { 'err' : Error };
export type Result_2 = { 'ok' : TokenIndex } |
  { 'err' : Error };
export type Result_3 = { 'ok' : UserId } |
  { 'err' : Error };
export type TokenIdentifier = string;
export type TokenIndex = bigint;
export type TokenIndex__1 = bigint;
export type UserId = Principal;
export interface _SERVICE extends ChildCanister {}
