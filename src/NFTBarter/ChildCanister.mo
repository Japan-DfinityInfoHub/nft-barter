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
  type TokenIndex = Types.TokenIndex;
  type CanisterIDText = Types.CanisterIDText;

  /* Nfts Types */
  // Sample Nft
  type MyExtStandardNftCanisterIF = Types.MyExtStandardNftCanisterIF;

  /* Variables */
  // Note that this canister is never upgraded
  stable var totalTokenIndex : TokenIndex = 0;
  let _assets = HashMap.HashMap<TokenIndex, NftStatus>(
    0, Nat.equal, Hash.hash
  );
  let _assetOwners = HashMap.HashMap<TokenIndex, UserId>(
    0, Nat.equal, Hash.hash
  );
  let _auctions = HashMap.HashMap<TokenIndex, HashMap.HashMap<UserId, TokenIndex>>(
    0, Nat.equal, Hash.hash
  );
  let parentCanister = actor(Principal.toText(installer)) : actor {
    isFamily : CanisterIDText -> async Bool;
  };

  /* Exhibit Methods */
  public shared ({caller}) func importMyNft(nft : Nft) : async Result<TokenIndex, Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) {
      return #err(#unauthorized("You are not authorized."));
    };
    
    // Check Double Import
    if(
      Iter.filter<(TokenIndex, NftStatus)>(
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

  public shared ({caller}) func exhibitMyNft(tokenIndex : TokenIndex) : async Result<(), Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) {
      return #err(#unauthorized("You are not authorized."))
    };
    
    // Check Owner
    if (isOwner(tokenIndex) == false) return #err(#unauthorized("You are not the owner of this NFT"));

    // Start Bater Auction
    switch (_auctions.get(tokenIndex)) {
      case (?_) {
        return #err(#other("The auction has already started"))
      };
      case (null) {
        let bids = HashMap.HashMap<UserId, TokenIndex>(0, Principal.equal, Principal.hash);
        _auctions.put(tokenIndex, bids);

        // Change `NftStatus` to `#Exhibit`
        changeNftStatus(tokenIndex, returnExhibit);
      }
    };

    return #ok;
  };

  /* Bid Methods */
  public shared ({caller}) func offerBidMyNft({bidToken : TokenIndex; exhibitToken : TokenIndex; exhibitCanisterId : CanisterIDText}) : async Result<(), Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) {
      return #err(#unauthorized("You are not authorized."));
    };

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

  public shared ({caller}) func acceptBidOffer({bidToken : TokenIndex; exhibitToken : TokenIndex;}) : async Result<(), Error> {
    if (Principal.isAnonymous(caller)) return #err(#unauthorized("You are not authorized."));

    // Check if `caller` is Family
    if ((await parentCanister.isFamily(Principal.toText(caller))) == false) return #err(#unauthorized(Principal.toText(caller) # "is not our family."));

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

  public shared ({caller}) func sendToMe(tokenIndex : TokenIndex) : async Result<Nft, Error> {
    if (Principal.isAnonymous(caller)) return #err(#unauthorized("You are not authorized."));

    // penddingにcanister idを追加して，ここでチェックする

    // nft情報を取り出す
    let nft = switch (_assets.get(tokenIndex)) {
      case (null) return #err(#other("NFT does not exist."));
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
  func isOwner(tokenIndex : TokenIndex) : Bool {
    switch (_assetOwners.get(tokenIndex)) {
      case (null) return false;
      case (?owner) {
        if (owner != _canisterOwner) return false;
      }
    };
    return true;
  };

  // Change `NftStatus` by applying `returnStatus` function
  func changeNftStatus(tokenIndex : TokenIndex, returnStatus : Nft -> NftStatus) {
    switch (_assets.get(tokenIndex)) {
      case (null) assert(false);
      case (?nftStatus) switch (nftStatus) {
        case (#Stay(nft)) _assets.put(tokenIndex, returnStatus(nft));
        case (_) assert(false);
      }
    }
  };

  /* `returnStatus` functions */
  func returnStay(nft : Nft)    : NftStatus {#Stay(nft)};

  func returnExhibit(nft : Nft) : NftStatus {#Exhibit(nft)};

  func returnPending(nft : Nft) : NftStatus {#Pending(nft)};

  // Returns function which takes nft as parameter and returns `NftStatus` with `#BidOffered`
  func returnBidOffered(from : CanisterIDText, exhibitNftIndex : TokenIndex) : Nft -> NftStatus {
    return func (nft : Nft) : NftStatus {
      #BidOffered({
        nft;
        from;
        exhibitNftIndex;
      })
    }
  };

  // Returns function which takes nft as parameter and returns `NftStatus` with `#BidOffering`
  func returnBidOffering(to : CanisterIDText, exhibitNftIndex : TokenIndex) : Nft -> NftStatus {
    return func (nft : Nft) : NftStatus {
      #BidOffering({
        nft;
        to;
        exhibitNftIndex;
      })
    }
  };

  // query methods
  public query func getAssets() : async [(TokenIndex, NftStatus)] {
    Iter.toArray(_assets.entries())
  };

  public query func getAssetOwners() : async [(TokenIndex, UserId)] {
    Iter.toArray(_assetOwners.entries())
  };

  public query func getAuctions() : async [(TokenIndex, [(UserId, TokenIndex)])] {
    Iter.toArray(
      Iter.map<(Nat, HashMap.HashMap<UserId, TokenIndex>), (TokenIndex, [(UserId, TokenIndex)])>(
        _auctions.entries(), func(nat, hashmap) {
          (nat, Iter.toArray(hashmap.entries()))
        }
      )
    )
  };
}