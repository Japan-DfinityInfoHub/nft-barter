import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

import User "./User";

shared ({ caller }) actor class NFTBarter() {

  type User = User.User;
  type UserId = User.UserId;
  type DefiniteUser = User.DefiniteUser;
  type Result<T, E> = Result.Result<T, E>;

  // Bind the caller and owner
  let owner : Principal = caller;

  // Stable variables
  stable var _stableUsers : [(UserId, User)] = [];

  let _users = HashMap.fromIter<UserId, User>(
    _stableUsers.vals(), 10, Principal.equal, Principal.hash
  );

  // Register `caller` as a new user.
  // Returns `caller` if the registration process successfully finishes.
  // Traps if:
  //   - `caller` is not a registered user.
  //   - `caller` is the anonymous identity.
  public shared ({ caller }) func register(): async Result<UserId,Text>{
    if (Principal.isAnonymous(caller)) { return #err "You need to be authenticated." };
    switch (_users.get(caller)) {
      case (?_) {
        #err "This principal id is already in use."
      };
      case null {
        let user = {
          id = caller;
          var name = "anonymous";
        };
        _users.put(caller, user);
        #ok caller
      };
    }
  };

  // Returns `user`.
  // Traps if `caller` is not a registered user.
  public query ({ caller }) func getMyInfo(): async Result<DefiniteUser,Text> {
    switch (_users.get(caller)) {
      case (?user) { #ok (User.freeze(user)) };
      case null { #err "You are not registered." };
    }
  };

  // Returns `true` if `caller` is a registered user.
  public shared query ({ caller }) func isRegistered(): async Bool {
    _isUserRegistered(caller)
  };

  // Returns `true` if `principal` is a registered user.
  private func _isUserRegistered(principal: Principal): Bool {
    Option.isSome(_users.get(principal))
  };

  // The work required before a canister upgrade begins.
  system func preupgrade() {
    Debug.print("Starting pre-upgrade hook...");
    _stableUsers := Iter.toArray(_users.entries());
    Debug.print("pre-upgrade finished.");
  };

  // The work required after a canister upgrade ends.
  system func postupgrade() {
    Debug.print("Starting post-upgrade hook...");
    _stableUsers := [];
    Debug.print("post-upgrade finished.");
  };

}