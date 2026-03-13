class UsersStorage {
  constructor() {
    this.storage = {};
    this.id = 0;
  }

  addUser({ firstName, lastName, email, age, bio }) {
    const id = this.id;
    this.storage[id] = { id, firstName, lastName, email, age, bio };
    this.id++;
  }

  getUsers() {
    return Object.values(this.storage);
  }

  getUserIdByLastName(lastName) {
    let users = this.getUsers();
    if (users) {
      return users.find((user) => user.lastName == lastName);
    }
  }

  getUserIdByEmail(email) {
    let users = this.getUsers();
    if (users) {
      return users.find((user) => user.email == email);
    }
  }

  getUser(id) {
    return this.storage[id];
  }

  updateUser(id, { firstName, lastName, email, age, bio }) {
    this.storage[id] = { id, firstName, lastName, email, age, bio };
  }

  deleteUser(id) {
    delete this.storage[id];
  }
}

// This ensures only one instance of this class can exist, also known as the "singleton" pattern.
module.exports = new UsersStorage();
