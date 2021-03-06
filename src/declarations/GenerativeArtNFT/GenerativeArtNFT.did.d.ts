import type { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
export type AccountIdentifier = string;
export type AccountIdentifier__1 = string;
export interface AllowanceRequest {
  token: TokenIdentifier;
  owner: User;
  spender: Principal;
}
export interface ApproveRequest {
  token: TokenIdentifier;
  subaccount: [] | [SubAccount];
  allowance: Balance;
  spender: Principal;
}
export type Balance = bigint;
export interface BalanceRequest {
  token: TokenIdentifier;
  user: User;
}
export type BalanceResponse = { ok: Balance } | { err: CommonError__1 };
export type Balance__1 = bigint;
export type CommonError = { InvalidToken: TokenIdentifier } | { Other: string };
export type CommonError__1 =
  | { InvalidToken: TokenIdentifier }
  | { Other: string };
export type Extension = string;
export interface GenerativeArtNFT {
  acceptCycles: () => Promise<undefined>;
  allowance: (arg_0: AllowanceRequest) => Promise<Result_1>;
  approve: (arg_0: ApproveRequest) => Promise<undefined>;
  availableCycles: () => Promise<bigint>;
  balance: (arg_0: BalanceRequest) => Promise<BalanceResponse>;
  bearer: (arg_0: TokenIdentifier__1) => Promise<Result_3>;
  extensions: () => Promise<Array<Extension>>;
  getAllowances: () => Promise<Array<[TokenIndex, Principal]>>;
  getInstaller: () => Promise<string>;
  getRegistry: () => Promise<Array<[TokenIndex, AccountIdentifier__1]>>;
  getTokenImages: () => Promise<Array<[TokenIndex, Array<number>]>>;
  getTokens: () => Promise<Array<[TokenIndex, Metadata]>>;
  http_request: (arg_0: HttpRequest) => Promise<HttpResponse>;
  metadata: (arg_0: TokenIdentifier__1) => Promise<Result_2>;
  mintNFT: (arg_0: MintRequest) => Promise<TokenIndex>;
  setTokenImage: (arg_0: TokenIndex, arg_1: string) => Promise<Result>;
  supply: (arg_0: TokenIdentifier__1) => Promise<Result_1>;
  transfer: (arg_0: TransferRequest) => Promise<TransferResponse>;
  updateTokenImageSetter: (arg_0: Principal) => Promise<Result>;
  getTokenIndexOwnedByUser: (arg_0: User) => Promise<Array<TokenIndex>>;
}
export type HeaderField = [string, string];
export interface HttpRequest {
  url: string;
  method: string;
  body: Array<number>;
  headers: Array<HeaderField>;
}
export interface HttpResponse {
  body: Array<number>;
  headers: Array<HeaderField>;
  status_code: number;
}
export type Memo = Array<number>;
export type Metadata =
  | {
      fungible: {
        decimals: number;
        metadata: [] | [Array<number>];
        name: string;
        symbol: string;
      };
    }
  | { nonfungible: { metadata: [] | [Array<number>] } };
export interface MintRequest {
  to: User;
  metadata: [] | [Array<number>];
}
export type Result = { ok: null } | { err: CommonError };
export type Result_1 = { ok: Balance__1 } | { err: CommonError };
export type Result_2 = { ok: Metadata } | { err: CommonError };
export type Result_3 = { ok: AccountIdentifier__1 } | { err: CommonError };
export type SubAccount = Array<number>;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TokenIndex = number;
export interface TransferRequest {
  to: User;
  token: TokenIdentifier;
  notify: boolean;
  from: User;
  memo: Memo;
  subaccount: [] | [SubAccount];
  amount: Balance;
}
export type TransferResponse =
  | { ok: Balance }
  | {
      err:
        | { CannotNotify: AccountIdentifier }
        | { InsufficientBalance: null }
        | { InvalidToken: TokenIdentifier }
        | { Rejected: null }
        | { Unauthorized: AccountIdentifier }
        | { Other: string };
    };
export type User = { principal: Principal } | { address: AccountIdentifier };
export interface _SERVICE extends GenerativeArtNFT {}
export function idlFactory(): IDL.ServiceClass;
