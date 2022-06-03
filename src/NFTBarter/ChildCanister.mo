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
  let parentCanister = actor(Principal.toText(installer)) : actor {
  isFamliy : Text -> async Bool;
  };

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
            case (#BidOffered(v)) v.nft;
            case (#BidOffering(v)) v.nft;
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

    // Check it is Famliy
    if ((await parentCanister.isFamliy(famliyId)) == false) return #err(#unauthorized(""));

    // Change NftStatus to #Pending
    changeNftStatus(bidToken, returnPending);

    // Call AcceptOffer Function
    switch (await (actor(famliyId) : Types.ChildCanisterIF).acceptOffer()) {
      case (#err(_)) { // fail sendToMe
        changeNftStatus(bidToken, returnStay);
        return #err(#other("Error In x.acceptOffer()"))
      };
      case (#ok(_)) {};
    };

    // Change NftStatus to #BidOffering // WIP bid先のcanisterIdとかを記憶しておく必要がある．
    changeNftStatus(bidToken, returnBidOffering(famliyId, exhibitToken));

    return #ok;
  };

  public shared ({caller}) func acceptBidOffer({bidToken : Nat; exhibitToken : Nat;}) : async Result<(), Error> {
    if (Principal.isAnonymous(caller)) return #err(#unauthorized(""));

    // Check Caller is Famliy
    if ((await parentCanister.isFamliy(Principal.toText(caller))) == false) return #err(#unauthorized(""));

    // Change NftStatus to #Pending // ここではいらないはず

    // sendToMe
    let (nft, owner) = switch (await (actor(Principal.toText(caller)) : Types.ChildCanisterIF).sendToMe(bidToken)) {
      case (#err(_)) return #err(#other("Error In x.sendToMe()"));
      case (#ok(nft, owner)) (nft, owner);
    };

    // Register BidOffered Nft;
    switch (nft) {
      case (#MyExtStandartNft(extTokenIdentifier)) {
        tokenIndex += 1;
        _assets.put(tokenIndex, #BidOffered({
          nft = #MyExtStandartNft(extTokenIdentifier);
          from = Principal.toText(caller);
          exhibitNftIndex = exhibitToken;
        }));
        _assetOwners.put(tokenIndex, owner);
      }
    };

    // add bid to _auction // WIP 

    return #ok;
  };

  public shared ({caller}) func sendToMe(token : Nat) : async Result<(Nft, UserId), Error> {
    if (Principal.isAnonymous(caller)) return #err(#unauthorized(""));

    // penddingにcanister idを追加して，ここでチェックする

    // nft情報を取り出す
    let nft = switch (_assets.get(token)) {
      case (null) return #err(#other("assert(false)"));
      case (?nftStatus) switch (nftStatus) {
        case (#Pending(v)) v;
        case (_) return #err(#other("assert(false)"));
      }
    };

    // trasfer Nft to caller

    // if it is ok, return ok

    return #ok(nft, caller);
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
  func returnPending(nft : Nft) : NftStatus {#Pending(nft)};
  func returnBidOffered(from : Text, exhibitNftIndex : Nat) : Nft -> NftStatus {
    return func (nft : Nft) : NftStatus { // Currying
      #BidOffered({
        nft;
        from;
        exhibitNftIndex;
      })
    }
  };
  func returnBidOffering(to : Text, exhibitNftIndex : Nat) : Nft -> NftStatus {
    return func (nft : Nft) : NftStatus { // Currying
      #BidOffering({
        nft;
        to;
        exhibitNftIndex;
      })
    }
  };


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