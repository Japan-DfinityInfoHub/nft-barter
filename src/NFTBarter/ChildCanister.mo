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
            case (#Bid(v)) v;
            case (#Exhibit(v)) v;
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
    switch (_assetOwners.get(token)) {
      case (null) return #err(#notYetRegistered(""));
      case (?owner) {
        if (owner != _canisterOwner) return #err(#unauthorized(""));
      }
    };

    // Change Nft Status
    switch (_assets.get(token)) {
      case (null) assert(false);
      case (?nftStatus) switch (nftStatus) {
        case (#Stay(nft)) _assets.put(token, #Exhibit(nft));
        case (_) return #err(#alreadyRegistered(""));
      }
    };

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


  /* Helper Methods */
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