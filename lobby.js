class Lobby {
    constructor (id) {
      
      this.id = id;
      this.url = '/tetris#' + id;
      
      this.users = [];
    }
  
  add(user) {
     this.users.push(user); 
  }
  
  remove(user) {
    console.log("taille users : " + this.users.length + "Indice user: " + this.users.indexOf(user));
     this.users.splice( this.users.indexOf(user), 1);
  }
  
  lobbyVide() {
     if (this.users.length == 0) return true;
    else return false;
  }
}

module.exports = Lobby;