import Result "mo:base/Result";

module {
  public type AccountIdentifier = Text;
  public type TokenIdentifier  = Text;
  public type Balance = Nat;
  public type Memo = Blob;
  public type SubAccount = [Nat8];

  public type User = {
    #address : AccountIdentifier; //No notification
    #principal : Principal; //defaults to sub account 0
  };

  public type TransferRequest = {
    from : User;
    to : User;
    token : TokenIdentifier;
    amount : Balance;
    memo : Memo;
    notify : Bool;
    subaccount : ?SubAccount;
  };

  public type TransferResponse = Result.Result<Balance, {
    #Unauthorized: AccountIdentifier;
    #InsufficientBalance;
    #Rejected; //Rejected by canister
    #InvalidToken: TokenIdentifier;
    #CannotNotify: AccountIdentifier;
    #Other : Text;
  }>;


}