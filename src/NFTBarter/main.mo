import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

import Types "./Types";
import ChildCanister "./ChildCanister";

shared (install) actor class NFTBarter() = this {

  type UserProfile = Types.UserProfile;
  type UserId = Types.UserId;
  type CanisterID = Types.CanisterID;
  type Error = Types.Error;
  type Result<T, E> = Result.Result<T, E>;

  let installer : Principal = install.caller;

  // Stable variables
  stable var _stableUsers : [(UserId, UserProfile)] = [];
  stable var _stableCanisters : [(CanisterID, UserId)] = [];

  let _userProfiles = HashMap.fromIter<UserId, UserProfile>(
    _stableUsers.vals(), 10, Principal.equal, Principal.hash
  );
  let _childCanisters = HashMap.fromIter<CanisterID, UserId>(
    _stableCanisters.vals(), 10, Principal.equal, Principal.hash
  );

  // Register `caller` as a new user.
  // Returns `caller` if the registration process successfully finishes.
  // Traps if:
  //   - `caller` is not a registered user.
  //   - `caller` is the anonymous identity.
  public shared ({ caller }) func register(): async Result<UserProfile,Error>{
    if (Principal.isAnonymous(caller)) { return #err(#unauthorized(Principal.toText(caller))) };
    switch (_userProfiles.get(caller)) {
      case (?_) {
        #err(#alreadyRegistered "This principal id is already in use.")
      };
      case null {
        let userProfile : UserProfile = #none;
        _userProfiles.put(caller, userProfile);
        #ok userProfile
      };
    }
  };

  // Returns `userProfile` associated with `caller`
  // Traps if `caller` is not a registered user.
  public query ({ caller }) func getMyProfile(): async Result<UserProfile,Error> {
    switch (_userProfiles.get(caller)) {
      case (?userProfile) { #ok userProfile };
      case null { #err(#notYetRegistered "You are not registered.")};
    }
  };

  // Returns `true` if `caller` is a registered user.
  public shared query ({ caller }) func isRegistered(): async Bool {
    _isUserRegistered(caller)
  };

  // Returns `true` if `principal` is a registered user.
  private func _isUserRegistered(principal: Principal): Bool {
    Option.isSome(_userProfiles.get(principal))
  };

  /* child canister functions */
  public shared ({ caller }) func mintChildCanister(): async Result<CanisterID, Error> {
    if (Principal.isAnonymous(caller)) { return #err(#unauthorized(Principal.toText(caller))) };

    let child = await ChildCanister.ChildCanister(caller, {myExtStandardNft="r7inp-6aaaa-aaaaa-aaabq-cai"});
    _childCanisters.put(Principal.fromActor(child), caller);
    #ok (Principal.fromActor(child))
  };

  // Returns array of canister ids of `caller`.
  public query ({ caller }) func getMyChildCanisters(): async Result<[CanisterID], Error> {
    if (Principal.isAnonymous(caller)) { return #err(#unauthorized(Principal.toText(caller))) };

    let canisterIdsOfUser = Iter.filter<(CanisterID, UserId)>(_childCanisters.entries(), func (entry) {
      entry.1 == caller
    });
    #ok (Iter.toArray(Iter.map<(CanisterID, UserId), CanisterID>(canisterIdsOfUser, func (entry) {
      entry.0
    })))
  };

  /* system functions */
  // The work required before a canister upgrade begins.
  system func preupgrade() {
    Debug.print("Starting pre-upgrade hook...");
    _stableUsers := Iter.toArray(_userProfiles.entries());
    _stableCanisters := Iter.toArray(_childCanisters.entries());
    Debug.print("pre-upgrade finished.");
  };

}