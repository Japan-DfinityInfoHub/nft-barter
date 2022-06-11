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
import ExtTypes "./NftTypes/ExtTypes";

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
  type TokenIdentifier = Types.TokenIdentifier;

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
  let _auctions = HashMap.HashMap<TokenIndex, HashMap.HashMap<TokenIndex, UserId>>(
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
        _assets.entries(), func(_, nftStatus) {
          nft == getNftFromNftStatus(nftStatus)
        }
      ).next() != null
    ) return #err(#alreadyRegistered("This NFT is already registered."));
    
    // Import Nft
    switch (nft) {
      case (#MyExtStandardNft(tokenIdentifier)) 
        if (await hasNft(tokenIdentifier)) {
          totalTokenIndex += 1;
          _assets.put(totalTokenIndex, #Stay(#MyExtStandardNft(tokenIdentifier)));
          _assetOwners.put(totalTokenIndex, _canisterOwner);
        } else {
          return #err(#unauthorized("You are not the owner of this NFT"));
        };
      // New nft will be added here.
      // case(#NewNft(id)) {};
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

    // Prevents the NFT owner from initiating an exhibit at the time of the invalid status of NFT.
    if (isStay(tokenIndex) == false) return #err(#other("You cannot start an auction because NFT is invalid status"));

    // Start Bater Auction
    switch (_auctions.get(tokenIndex)) {
      case (?_) {
        return #err(#other("The auction has already started"))
      };
      case (null) {
        let bids = HashMap.HashMap<TokenIndex, UserId>(0, Nat.equal, Hash.hash);
        _auctions.put(tokenIndex, bids);

        // Change `NftStatus` to `#Exhibit`
        changeNftStatus(tokenIndex, returnExhibit);
      };
    };

    return #ok;
  };

  /* Bid Methods */

  // Note that `caller` of this method is a bidding user.
  // Returns `tokenIndex` of bidded NFT at exhibiting canister.
  public shared ({caller}) func offerBidMyNft({bidToken : TokenIndex; exhibitToken : TokenIndex; exhibitCanisterId : CanisterIDText}) : async Result<TokenIndex, Error> {
    // Check Auth
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) {
      return #err(#unauthorized("You are not authorized."));
    };

    // Check Owner
    if (isOwner(bidToken) == false) return #err(#unauthorized("You are not owner of " # Nat.toText(bidToken)));

    // Check if `exhibitCanisterId` is famliy
    if ((await parentCanister.isFamily(exhibitCanisterId)) == false) return #err(#unauthorized(exhibitCanisterId # " is not our family."));

    // Specify recipient (`exhibitCanisterId`) as a parameter of `returnPending` while changing `NftStatus` to `#Pending`
    changeNftStatus(bidToken, returnPending(exhibitCanisterId));

    // Call `acceptBitOffer` function in `exhibitCanisterId`
    switch (await (actor(exhibitCanisterId) : ChildCanister).acceptBidOffer({
      bidToken = bidToken;
      exhibitToken = exhibitToken;
    })) {
      // In case `acceptBidOffer` fails, change `NftStatus` back to `#Stay`
      case (#err(_)) {
        changeNftStatus(bidToken, returnStay);
        return #err(#other("An error occurred during call to acceptBitOffer function."))
      };
      // In case of success, change `NftStatus` to `#BidOffering`
      case (#ok(tokenIndex)) {
        changeNftStatus(bidToken, returnBidOffering(exhibitCanisterId, exhibitToken));
        return #ok tokenIndex;
      };
    };
  };

  // Note that `caller` of this method is a child canister of the bidding user.
  // Returns `tokenIndex` of bidded NFT at exhibiting canister.
  public shared ({caller}) func acceptBidOffer({bidToken : TokenIndex; exhibitToken : TokenIndex;}) : async Result<TokenIndex, Error> {
    if (Principal.isAnonymous(caller)) return #err(#unauthorized("You are not authorized."));

    // Check if `caller` is family
    let callerText = Principal.toText(caller);
    if ((await parentCanister.isFamily(callerText)) == false) return #err(#unauthorized(callerText # "is not our family."));

    // Check if auction is open here, before transferring NFTs
    if (isAuctionOpen(exhibitToken) == false) return #err(#other("Auction does not exist."));

    // sendToMe
    let nft = switch (await (actor(callerText) : ChildCanister).sendToMe(bidToken)) {
      case (#err _) return #err(#other("An error occurred during call to sendToMe function."));
      case (#ok nft) { nft };
    };

    // Register BidOffered Nft;
    switch (nft) {
      case (#MyExtStandardNft(extTokenIdentifier)) {
        totalTokenIndex += 1;
        _assets.put(totalTokenIndex, #BidOffered({
          nft = #MyExtStandardNft(extTokenIdentifier);
          from = callerText;
          exhibitNftIndex = exhibitToken;
        }));
        _assetOwners.put(totalTokenIndex, caller);
      };
      // New nft will be added here.
      // case(#NewNft(id)) {};
    };

    // Add bid to `_auctions`
    switch (_auctions.get(exhibitToken)){
      case (null) assert(false); // Must not be called
      case (?auction) {
        auction.put(totalTokenIndex, caller);
      }
    };

    return #ok totalTokenIndex;
  };

  public shared ({caller}) func sendToMe(tokenIndex : TokenIndex) : async Result<Nft, Error> {
    if (Principal.isAnonymous(caller)) return #err(#unauthorized("You are not authorized."));

    let (nft, recipient) = switch (_assets.get(tokenIndex)) {
      case (null) return #err(#other("NFT does not exist."));
      case (?nftStatus) switch (nftStatus) {
        case (#Pending(v)){ 
          // Check recipient of NFT
          if (v.recipient != Principal.toText(caller)) {
            return #err(#unauthorized("You are not authorized."))
          };
          (v.nft, v.recipient)
        };
        case (_) return #err(#other("Invalid NFT status (which must be #Pending)"));
      }
    };

    // Transfer the NFT to `recipient`
    switch (nft) {
      case (#MyExtStandardNft(tokenIdentifier)) {
        switch (await (actor(_canisterIdList.myExtStandardNft): MyExtStandardNftCanisterIF)
          .transfer({
            from = #principal(Principal.fromActor(this));
            to = #principal(Principal.fromText(recipient));
            token = tokenIdentifier;
            amount = 1;
            memo = Blob.fromArray([]:[Nat8]);
            notify = false;
            subaccount = null;
          })){
          case (#err(_)){
            return #err(#other("An error occurred while transferring NFT"));
          };
          case (#ok(_)){
            return #ok nft;
          };
        };
      };
      // New nft will be added here.
      // case(#NewNft(id)) {};
    };
  };

  // Note that `caller` of this method is the exhibiting user.
  public shared ({caller}) func selectTokenInAuction({selectedToken: TokenIndex; exhibitToken: TokenIndex}) : async Result<(), Error> {
    
    // Check authentication
    if (Principal.isAnonymous(caller) or (caller != _canisterOwner)) {
      return #err(#unauthorized("You are not authorized."));
    };

    // Get auction
    let auction = switch (_auctions.get(exhibitToken)){
      case (null) return #err(#other("Auction does not exist."));
      case (?auction) auction;
    };

    // Find bid from auction 
    let selectedBid : ?(TokenIndex, UserId) = Iter.filter<(TokenIndex, UserId)>(
      auction.entries(), func(index, _) {
      index == selectedToken
    }).next();

    let notSelectedBids : Iter.Iter<(TokenIndex, UserId)> = Iter.filter<(TokenIndex, UserId)>(
      auction.entries(), func(index, _) {
      index != selectedToken
    });

    let bidder = switch (selectedBid) {
      case (null) return #err(#other("Bid is not found."));
      case (?bid) bid.1;
    };

    // Swap owner
    _assetOwners.put(exhibitToken, bidder);
    _assetOwners.put(selectedToken, Principal.fromActor(this));

    // Change status
    changeNftStatus(exhibitToken, returnExhibitEnd);
    changeNftStatus(selectedToken, returnSelected);
    for (notSelectedBid in notSelectedBids){
      changeNftStatus(notSelectedBid.0, returnNotSelected);
    };

    // Close the auction
    _auctions.delete(exhibitToken);

    return #ok;
  };


  /* Helper Functions */
  // Check the owner of NFT
  func isOwner(tokenIndex : TokenIndex) : Bool {
    switch (_assetOwners.get(tokenIndex)) {
      case (null) return false;
      case (?owner) { return owner == _canisterOwner };
    };
  };

  // Change `NftStatus` by applying `returnStatus` function
  func changeNftStatus(tokenIndex : TokenIndex, returnStatus : Nft -> NftStatus) {

    let oldNftStatus : NftStatus = switch (_assets.get(tokenIndex)) {
      case (null) return assert(false);
      case (?ns) { ns };
    };

    let newNftStatus = switch (oldNftStatus) {
      case (#Stay(nft)) returnStatus(nft);
      case (#Pending(v)) returnStatus(v.nft);
      case (#Exhibit(nft)) {
        switch(returnStatus(nft)){
          case (#ExhibitEnd(nft)) #ExhibitEnd(nft);
          case (#Stay(nft)) #Stay(nft);
          case (_) return assert(false);
        }
      };
      case (#BidOffered(v)) {
        switch(returnStatus(v.nft)){
          case (#Selected(nft)) #Selected(nft);
          case (#NotSelected(nft)) #NotSelected(nft);
          case (_) return assert(false);
        }
      };
      case (_) return assert(false);
    };

    // Apply new status
    _assets.put(tokenIndex, newNftStatus);
    
  };

  // Check if the auction is open
  func isAuctionOpen(tokenIndex: TokenIndex) : Bool {
    switch (_auctions.get(tokenIndex)) {
      case (null) return false;
      case (?auction) return true;
    };
  };

  // Check if the token is status of `#Stay`
  func isStay(tokenIndex : TokenIndex) : Bool {
    switch (_assets.get(tokenIndex)) {
      case (null) return false;
      case (?s) switch (s) {
        case (#Stay(_)) return true;
        case (_) return false;
      };
    };
  };

  // Get `Nft` from `NftStatus`
  func getNftFromNftStatus(nftStatus: NftStatus) : Nft {
    switch (nftStatus) {
      case (#Stay(nft)) nft;
      case (#BidOffered(v)) v.nft;
      case (#BidOffering(v)) v.nft;
      case (#Exhibit(nft)) nft;
      case (#ExhibitEnd(nft)) nft;
      case (#Pending(v)) v.nft;
      case (#Selected(nft)) nft;
      case (#NotSelected(nft)) nft;
    }
  };

  // Check posession of NFT by transfering NFT to myself
  func hasNft(tokenIdentifier : TokenIdentifier) : async Bool {
    switch (await (actor(_canisterIdList.myExtStandardNft): MyExtStandardNftCanisterIF)
      .transfer({
        from = #principal(Principal.fromActor(this));
        to = #principal(Principal.fromActor(this));
        token = tokenIdentifier;
        amount = 1;
        memo = Blob.fromArray([]:[Nat8]);
        notify = false;
        subaccount = null;
      })){
      case (#err(_)) return false;
      case (#ok(_)) return true;
    };
  };

  /* `returnStatus` functions */
  func returnStay(nft : Nft)    : NftStatus {#Stay(nft)};

  func returnExhibit(nft : Nft) : NftStatus {#Exhibit(nft)};

  func returnExhibitEnd(nft: Nft) : NftStatus {#ExhibitEnd(nft)};

  func returnSelected(nft: Nft) : NftStatus {#Selected(nft)};

  func returnNotSelected(nft: Nft) : NftStatus {#NotSelected(nft)};
  
  // Return function which takes nft as parameter and returns `NftStatus` of `#Pending`
  func returnPending(recipient: CanisterIDText) : Nft -> NftStatus {
    return func (nft: Nft) : NftStatus {
      #Pending({
        recipient;
        nft;
      })
    }
  };

  // Returns function which takes nft as parameter and returns `NftStatus` of `#BidOffered`
  func returnBidOffered(from : CanisterIDText, exhibitNftIndex : TokenIndex) : Nft -> NftStatus {
    return func (nft : Nft) : NftStatus {
      #BidOffered({
        nft;
        from;
        exhibitNftIndex;
      })
    }
  };

  // Returns function which takes nft as parameter and returns `NftStatus` of `#BidOffering`
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

  public query func getAssetByTokenIndex(tokenIndex: TokenIndex) : async Result<NftStatus, Error> {
    switch (_assets.get(tokenIndex)){
      case (null) return #err(#other("Asset is not found."));
      case (?asset) return #ok(asset);
    }
  };

  public query func getAssetOwners() : async [(TokenIndex, UserId)] {
    Iter.toArray(_assetOwners.entries())
  };

  public query func getAssetOwnerByTokenIndex(tokenIndex: TokenIndex) : async Result<UserId, Error> {
    switch (_assetOwners.get(tokenIndex)){
      case (null) return #err(#other("Asset owner is not found."));
      case (?owner) return #ok(owner);
    }
  };

  public query func getAuctions() : async [(TokenIndex, [(TokenIndex, UserId)])] {
    Iter.toArray(
      Iter.map<(Nat, HashMap.HashMap<TokenIndex, UserId>), (TokenIndex, [(TokenIndex, UserId)])>(
        _auctions.entries(), func(nat, hashmap) {
          (nat, Iter.toArray(hashmap.entries()))
        }
      )
    )
  };

  public query func getAuctionByTokenIndex(tokenIndex: TokenIndex) : async Result<[(TokenIndex, UserId)], Error> {
    switch (_auctions.get(tokenIndex)){
      case (null) return #err(#other("Auction is not found."));
      case (?auction) return #ok(Iter.toArray(auction.entries()));
    }
  };
}