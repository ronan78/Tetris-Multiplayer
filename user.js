class User {
  
  constructor (login, pass) {
    this.login = login;
    this.pass = pass;

    this.win = 0;
    this.lose = 0;
    this.avaible = false;
  }
  
}

module.exports = User;