//Local
import Types "./Types";

// Motoko base
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";

shared ({caller=installer}) actor class ChildCanister(_canisterOwner : Principal, _canisterIdList : Types.CanisterIdList) = this {
  /* Local Types */
  type Error = Types.Error;
  type Result<T, E> = Result.Result<T, E>;

  type UserId = Types.UserId;
  type CanisterID = Types.CanisterID;
  type NftStatus = Types.NftStatus;
  type Nft = Types.Nft;
  // type NftImportRequest = Types.NftImportRequest;

  /* Nfts Types */
  // Sample Nft
  // My Ext-Standart Nft
  // type MyExtStandartNft = Types.MyExtStandartNft;
  type MyExtStandartNftCanisterIF = Types.MyExtStandartNftCanisterIF;

  /* Variables */
  // this canister is never upgraded
  stable var tokenIndex : Nat = 0;
  let _assets = HashMap.HashMap<Nat, NftStatus>(
    0, Nat.equal, Hash.hash
  );
  let _assetOwners = HashMap.HashMap<Nat, UserId>(
    0, Nat.equal, Hash.hash
  );
  let _auctions = HashMap.HashMap<Nat, HashMap.HashMap<UserId, Nat>>(
    0, Nat.equal, Hash.hash
  );

  /* Exhibit Methods */
  public shared ({caller}) func importMyNft(nft : Nft) : async Result<Nat, Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) 
      { return #err(#unauthorized(Principal.toText(caller))) };
    
    // Check Double Import
    if(
      Iter.filter<(Nat, NftStatus)>(
        _assets.entries(), func(index, nftStatus) {
          let _nft = switch (nftStatus) {
            case (#Stay(v)) v;
            case (#BidOffered(v)) v;
            case (#BidOffering(v)) v;
            case (#Exhibit(v)) v;
            case (#Pending(v)) v;
          };
          nft==_nft
        }
      ).next() != null
    ) return #err(#alreadyRegistered(""));
    
    // Import Nft
    switch (nft) {

      case (#MyExtStandartNft(token)) 
        switch (
          await (actor(_canisterIdList.myExtStandartNft): MyExtStandartNftCanisterIF)
            .transfer({
              from = #principal(Principal.fromActor(this));
              to = #principal(Principal.fromActor(this));
              token = token;
              amount = 1;
              memo = Blob.fromArray([]:[Nat8]);
              notify = false;
              subaccount = null;
            })
        ) {
          case (#err(_)) return #err(#other("err"));
          case (#ok(_)) {
            tokenIndex += 1;
            _assets.put(tokenIndex, #Stay(#MyExtStandartNft(token)));
            _assetOwners.put(tokenIndex, _canisterOwner);
          };
        };
      // new nft is added here
    };
    return #ok tokenIndex;
  };

  public shared ({caller}) func exhibitMyNft(token : Nat) : async Result<(), Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) 
      { return #err(#unauthorized(Principal.toText(caller))) };
    
    // Check Owner
    if (isOwner(token) == false) return #err(#unauthorized(""));

    // Change Nft Status
    changeNftStatus(token, returnExhibit);

    // Start Bater Auction
    switch (_auctions.get(token)) {
      case (?_) assert(false);
      case (null) _auctions.put(token, 
        HashMap.HashMap<UserId, Nat>(0, Principal.equal, Principal.hash)
      )
    };

    return #ok;
  };

  /* Bid Methods */
  public shared ({caller}) func offerBidMyNft({bidToken : Nat; exhibitToken : Nat; famliyId : Text}) : async Result<(), Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) 
      { return #err(#unauthorized(Principal.toText(caller))) };

    // Check Owner
    if (isOwner(bidToken) == false) return #err(#unauthorized(""));

    // Check it is famliy
    let parentCanister = actor(Principal.toText(installer)) : actor {
      isFamliy : Text -> async Bool;
    };
    if ((await parentCanister.isFamliy(famliyId)) == false) return #err(#unauthorized(""));

    // Change NftStatus to #Pending
    changeNftStatus(bidToken, returnPending);

    // Call AcceptOffer Function
    let famliyCanister = actor(famliyId) : actor {
      acceptOffer : () -> async Result<(), Error>;
    };
    switch (await famliyCanister.acceptOffer()) {
      case (#err(_)) { // fail sendToMe
        changeNftStatus(bidToken, returnStay);
        return #err(#other("Error In famliyCanister.acceptOffer"))
      };
      case (#ok(_)) {};
    };

    // Change NftStatus to #BidOffering
    changeNftStatus(bidToken, returnBidOffering);
    
    return #ok;

  };


  /* Helper Functions */
  // Check Owner
  func isOwner(token : Nat) : Bool {
    switch (_assetOwners.get(token)) {
      case (null) return false;
      case (?owner) {
        if (owner != _canisterOwner) return false;
      }
    };
    return true;
  };
  // Change Nft Status
  func changeNftStatus(token : Nat, returnStatus : Nft -> NftStatus) {
    switch (_assets.get(token)) {
      case (null) assert(false);
      case (?nftStatus) switch (nftStatus) {
        case (#Stay(nft)) _assets.put(token, returnStatus(nft));
        case (_) assert(false);
      }
    }
  };
  func returnStay(nft : Nft)    : NftStatus {#Stay(nft)};
  func returnExhibit(nft : Nft) : NftStatus {#Exhibit(nft)};
  func returnBidOffered(nft : Nft)  : NftStatus {#BidOffered(nft)};
  func returnBidOffering(nft : Nft) : NftStatus {#BidOffering(nft)};
  func returnPending(nft : Nft) : NftStatus {#Pending(nft)};


  // query
  public query func getAssets() : async [(Nat, NftStatus)] {
    Iter.toArray(_assets.entries())
  };
  public query func getAssetOwners() : async [(Nat, UserId)] {
    Iter.toArray(_assetOwners.entries())
  };
  public query func getAuctions() : async [(Nat, [(UserId, Nat)])] {
    Iter.toArray(
      Iter.map<(Nat, HashMap.HashMap<UserId, Nat>), (Nat, [(UserId, Nat)])>(
        _auctions.entries(), func(nat, hashmap) {
          (nat, Iter.toArray(hashmap.entries()))
        }
      )
    )
  };
}