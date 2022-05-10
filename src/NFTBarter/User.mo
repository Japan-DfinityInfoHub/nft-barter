module {

  public type UserId = Principal;

  public type User = {
    id: UserId;
    var name: Text;
  };

  public type DefiniteUser = {
    id: UserId;
    name: Text;
  };

  public func freeze(user: User) : DefiniteUser {
    return {
      id = user.id;
      name = user.name;
    }
  };
}