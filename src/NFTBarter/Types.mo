// Motoko base
// import HashMap "mo:base/HashMap";
// import Hash "mo:base/Hash";
// import Nat "mo:base/Nat";
import Result "mo:base/Result";
// import Principal "mo:base/Principal";


// import Ext-Standart Types
import ExtTypes "./NftTypes/ExtTypes";


module {

  public type UserId = Principal;
  public type CanisterID = Principal;

  public type UserProfile = {
    #none;
  };

  public type Error = {
    #unauthorized : Text;
    #notYetRegistered : Text;
    #alreadyRegistered : Text;
    #other : Text;
  };



  /* For Child Canister */
  // Parent Types
  public type ParentIF = actor {
    // isBrother : CanisterID -> async Bool;
  };

  public type CanisterIdList = {
    myExtStandartNft : Text;
  };

  // All Nft Type
  public type Nft = {
    // #SampleNft;
    #MyExtStandartNft : ExtTypes.TokenIdentifier;
  };
  
  public type NftStatus = {
    #Stay : Nft;
    #BidOffered : {
      nft : Nft;
      from : Text;
      exhibitNftIndex : Nat;
    };
    #BidOffering : {
      nft : Nft;
      to : Text;
      exhibitNftIndex : Nat;
    };
    #Exhibit : Nft;
    #Pending : Nft;
  };

  // Import Request
  // public type NftImportRequest = {
  //   // #SampleNft : {
  //   //   canisterId : CanisterID;
  //   // };
  //   #MyExtStandartNft : {
  //     canisterId : CanisterID;
  //     token : ExtTypes.TokenIdentifier;
  //   }
  // };

  /* Actor Interfaces */
  // public type SampleNftCanisterIF = actor {
  //   transfer : Principal -> async Result.Result<(), ()>;
  // };
  public type MyExtStandartNftCanisterIF = actor {
    transfer : ExtTypes.TransferRequest -> async ExtTypes.TransferResponse;
  };

  public type ChildCanisterIF = actor {
    acceptOffer : () -> async Result.Result<(), Error>;
    sendToMe : Nat -> async Result.Result<(Nft, UserId), Error>;
  }


}