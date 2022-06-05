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
    myExtStandardNft : Text;
  };

  // All Nft Type
  public type Nft = {
    // #SampleNft;
    #MyExtStandardNft : ExtTypes.TokenIdentifier;
  };
  
  public type NftStatus = {
    #Stay : Nft;
    #Bid : Nft;
    #Exhibit : Nft
  };

  // Import Request
  // public type NftImportRequest = {
  //   // #SampleNft : {
  //   //   canisterId : CanisterID;
  //   // };
  //   #MyExtStandardNft : {
  //     canisterId : CanisterID;
  //     token : ExtTypes.TokenIdentifier;
  //   }
  // };

  /* Actor Interfaces */
  // public type SampleNftCanisterIF = actor {
  //   transfer : Principal -> async Result.Result<(), ()>;
  // };
  public type MyExtStandardNftCanisterIF = actor {
    transfer : ExtTypes.TransferRequest -> async ExtTypes.TransferResponse;
  }

}