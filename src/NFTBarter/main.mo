import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

import Types "./Types";

shared (install) actor class NFTBarter() {

  type UserProfile = Types.UserProfile;
  type UserId = Types.UserId;
  type Result<T, E> = Result.Result<T, E>;

  let installer : Principal = install.caller;

  // Stable variables
  stable var _stableUsers : [(UserId, UserProfile)] = [];

  let _userProfiles = HashMap.fromIter<UserId, UserProfile>(
    _stableUsers.vals(), 10, Principal.equal, Principal.hash
  );

  // Register `caller` as a new user.
  // Returns `caller` if the registration process successfully finishes.
  // Traps if:
  //   - `caller` is not a registered user.
  //   - `caller` is the anonymous identity.
  public shared ({ caller }) func register(): async Result<UserId,Text>{
    if (Principal.isAnonymous(caller)) { return #err "You need to be authenticated." };
    switch (_userProfiles.get(caller)) {
      case (?_) {
        #err "This principal id is already in use."
      };
      case null {
        let userProfile : UserProfile = #none;
        _userProfiles.put(caller, userProfile);
        #ok caller
      };
    }
  };

  // Returns `userProfile` associated with `caller`
  // Traps if `caller` is not a registered user.
  public query ({ caller }) func getMyProfile(): async Result<UserProfile,Text> {
    switch (_userProfiles.get(caller)) {
      case (?userProfile) { #ok userProfile };
      case null { #err "You are not registered." };
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

  // The work required before a canister upgrade begins.
  system func preupgrade() {
    Debug.print("Starting pre-upgrade hook...");
    _stableUsers := Iter.toArray(_userProfiles.entries());
    Debug.print("pre-upgrade finished.");
  };

}