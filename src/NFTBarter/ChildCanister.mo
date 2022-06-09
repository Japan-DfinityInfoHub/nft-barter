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
  // type MyExtStandardNft = Types.MyExtStandardNft;
  type MyExtStandardNftCanisterIF = Types.MyExtStandardNftCanisterIF;

  /* Variables */
  // this canister is never upgraded
  stable var totalTokenIndex : Nat = 0;
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
    isFamily : Text -> async Bool;
  };

  /* Exhibit Methods */
  public shared ({caller}) func importMyNft(nft : Nft) : async Result<Nat, Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) {
      return #err(#unauthorized("You are not authorized."));
    };
    
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
    ) return #err(#alreadyRegistered("This NFT is already registered."));
    
    // Import Nft
    switch (nft) {
      case (#MyExtStandardNft(tokenIdentifier)) 
        switch (
          // Confirm posession of NFT by transfering NFT to myself
          await (actor(_canisterIdList.myExtStandardNft): MyExtStandardNftCanisterIF)
            .transfer({
              from = #principal(Principal.fromActor(this));
              to = #principal(Principal.fromActor(this));
              token = tokenIdentifier;
              amount = 1;
              memo = Blob.fromArray([]:[Nat8]);
              notify = false;
              subaccount = null;
            })
        ) {
          case (#err(_)) return #err(#unauthorized("You are not the owner of this NFT"));
          case (#ok(_)) {
            totalTokenIndex += 1;
            _assets.put(totalTokenIndex, #Stay(#MyExtStandardNft(tokenIdentifier)));
            _assetOwners.put(totalTokenIndex, _canisterOwner);
          };
        };
      // new nft is added here
    };
    return #ok totalTokenIndex;
  };

  public shared ({caller}) func exhibitMyNft(tokenIndex : Nat) : async Result<(), Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) {
      return #err(#unauthorized("You are not authorized."))
    };
    
    // Check Owner
    if (isOwner(tokenIndex) == false) return #err(#unauthorized("You are not the owner of this NFT"));

    // Change `NftStatus` to `#Exhibit`
    changeNftStatus(tokenIndex, returnExhibit);

    // Start Bater Auction
    switch (_auctions.get(tokenIndex)) {
      // _
      case (?_) assert(false);
      case (null) _auctions.put(tokenIndex, 
        HashMap.HashMap<UserId, Nat>(0, Principal.equal, Principal.hash)
      )
    };

    return #ok;
  };

  /* Bid Methods */
  public shared ({caller}) func offerBidMyNft({bidToken : Nat; exhibitToken : Nat; exhibitCanisterId : Text}) : async Result<(), Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) 
      { return #err(#unauthorized(Principal.toText(caller))) };

    // Check Owner
    if (isOwner(bidToken) == false) return #err(#unauthorized("You are not owner of " # Nat.toText(bidToken)));

    // Check if `exhibitCanisterId` is famliy
    if ((await parentCanister.isFamily(exhibitCanisterId)) == false) return #err(#unauthorized(exhibitCanisterId # " is not our family."));

    // Change NftStatus to #Pending
    changeNftStatus(bidToken, returnPending);

    // Call `acceptBitOffer` function in `exhibitCanisterId`
    switch (await (actor(exhibitCanisterId) : Types.ChildCanisterIF).acceptBidOffer()) {
      // In case `acceptBidOffer` fails, change `NftStatus` back to `#Stay`
      case (#err(_)) {
        changeNftStatus(bidToken, returnStay);
        return #err(#other("An error occurred during call to acceptBitOffer function."))
      };
      case (#ok(_)) {
        // do nothing
      };
    };

    // Change `NftStatus` to `#BidOffering`
    changeNftStatus(bidToken, returnBidOffering(exhibitCanisterId, exhibitToken));

    return #ok;
  };

  public shared ({caller}) func acceptBidOffer({bidToken : Nat; exhibitToken : Nat;}) : async Result<(), Error> {
    if (Principal.isAnonymous(caller)) return #err(#unauthorized("You are not authorized."));

    // Check if `caller` is Family
    if ((await parentCanister.isFamily(Principal.toText(caller))) == false) return #err(#unauthorized(Principal.toText(caller) # "is not our family."));

    // Change NftStatus to #Pending // ここではいらないはず

    // sendToMe
    let nft = switch (await (actor(Principal.toText(caller)) : Types.ChildCanisterIF).sendToMe(bidToken)) {
      case (#err _) return #err(#other("An error occurred during call to sendToMe function."));
      case (#ok nft) { nft };
    };

    // Register BidOffered Nft;
    switch (nft) {
      case (#MyExtStandardNft(extTokenIdentifier)) {
        totalTokenIndex += 1;
        _assets.put(totalTokenIndex, #BidOffered({
          nft = #MyExtStandardNft(extTokenIdentifier);
          from = Principal.toText(caller);
          exhibitNftIndex = exhibitToken;
        }));
        _assetOwners.put(totalTokenIndex, caller);
      };
    };

    // add bid to _auction // WIP 

    return #ok;
  };

  public shared ({caller}) func sendToMe(tokenIndex : Nat) : async Result<Nft, Error> {
    if (Principal.isAnonymous(caller)) return #err(#unauthorized(""));

    // penddingにcanister idを追加して，ここでチェックする

    // nft情報を取り出す
    let nft = switch (_assets.get(tokenIndex)) {
      case (null) return #err(#other("assert(false)"));
      case (?nftStatus) switch (nftStatus) {
        case (#Pending(v)) v;
        case (_) return #err(#other("assert(false)"));
      }
    };

    // trasfer Nft to caller

    // if it is ok, return ok

    return #ok nft;
  };


  /* Helper Functions */
  // Check the owner of NFT
  func isOwner(tokenIndex : Nat) : Bool {
    switch (_assetOwners.get(tokenIndex)) {
      case (null) return false;
      case (?owner) {
        if (owner != _canisterOwner) return false;
      }
    };
    return true;
  };

  // Change `NftStatus`
  func changeNftStatus(tokenIndex : Nat, returnStatus : Nft -> NftStatus) {
    switch (_assets.get(tokenIndex)) {
      case (null) assert(false);
      case (?nftStatus) switch (nftStatus) {
        case (#Stay(nft)) _assets.put(tokenIndex, returnStatus(nft));
        case (_) assert(false);
      }
    }
  };

  func returnStay(nft : Nft)    : NftStatus {#Stay(nft)};

  func returnExhibit(nft : Nft) : NftStatus {#Exhibit(nft)};

  func returnPending(nft : Nft) : NftStatus {#Pending(nft)};

  func returnBidOffered(from : Text, exhibitNftIndex : Nat) : Nft -> NftStatus {
    // Returns function which takes nft as parameter and returns `NftStatus` with `#BidOffered`
    return func (nft : Nft) : NftStatus {
      #BidOffered({
        nft;
        from;
        exhibitNftIndex;
      })
    }
  };

  func returnBidOffering(to : Text, exhibitNftIndex : Nat) : Nft -> NftStatus {
    // Returns function which takes nft as parameter and returns `NftStatus` with `#BidOffering`
    return func (nft : Nft) : NftStatus {
      #BidOffering({
        nft;
        to;
        exhibitNftIndex;
      })
    }
  };

  // query methods
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