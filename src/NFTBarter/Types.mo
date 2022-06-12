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
  public type TokenIndex = Nat;
  public type CanisterIDText = Text;
  public type TokenIdentifier = ExtTypes.TokenIdentifier;

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
    myExtStandardNft : CanisterIDText;
  };

  // All Nft Type
  public type Nft = {
    // #SampleNft;
    #MyExtStandardNft : TokenIdentifier;
  };
  
  public type NftStatus = {
    #Stay : Nft;
    #BidOffered : {
      nft : Nft;
      from : CanisterIDText;
      exhibitNftIndex : TokenIndex;
      tokenIndexOnBidCanister : TokenIndex;
    };
    #BidOffering : {
      nft : Nft;
      to : CanisterIDText;
      exhibitNftIndex : TokenIndex;
      tokenIndexOnExhibitCanister : TokenIndex;
    };
    #Exhibit : Nft;
    #ExhibitEnd : {
      recipient : CanisterIDText;
      nft : Nft;
    };
    #Pending : {
      recipient : CanisterIDText;
      nft : Nft;
    };
    #Selected : Nft;
    #NotSelected : Nft;
    #Winning : {
      nft : Nft;
      canisterId : CanisterIDText;
      winningTokenIndex : TokenIndex;
      winningNft : Nft;
    };
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
  };

}