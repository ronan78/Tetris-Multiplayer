var express = require('express');
const ws = require('ws');
var app = express();
var bodyP = require('body-parser');
var session = require('express-session');
const http = require('http');
const Session = require('./session');
const Client = require('./client');
const User = require('./user');
const Lobby = require('./lobby');

app.use('/public', express.static('public'));
app.use(bodyP.urlencoded({ extended: false }));
app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: false,
}));

var nunjucks = require('nunjucks');
nunjucks.configure('views', {
    express: app,
    noCache: true,
});

const connected_users = {};

const users = [];
const lobbies = [];
const users_online = [];

// We attach express and ws to the same HTTP server
const server = http.createServer(app);
const wsserver = new ws.Server({ 
  server: server,
});

const sessions = new Map;

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/userlist');
  } else {
    res.render('login.html');
  }
});

app.post('/', async (req, res) => {
  let user = null;
  let boolean = false;
  let exist = false;
  user = new User(req.body.login, req.body.password);
  for (var u of users) {
    if (u.login == user.login && u.pass == user.pass) {
      boolean = true;
      u.avaible = true;
    }
  }
    if (boolean == true) {
      req.session.name = user.login;
      req.session.user = user;
      boolean = false;
      users_online.push(user);
      console.log("Session : " + req.session.user);
      res.redirect('/userlist');
    }
    else {
    res.render('login.html', { 
      login: req.body.login,
      message: 'Mauvais login ou Mot de Passe',
    });
     
  }
});

app.get('/signin', (req, res) => {
    res.render('signin.html');
});

app.post('/signin', async (req, res) => {
  let utilisateur = null;
  let boolean = false;
  for (var u of users) {
    if (u.login == req.body.login) boolean = true;
  }
  if (req.body.password === '' || req.body.password === ' ') {
    res.render('signin.html', { 
      message: 'Mot de passe vide',
    });
  }
  else if (boolean == false) {
    utilisateur = new User(req.body.login, req.body.password);
    users.push(utilisateur);
    console.log("Ajout Utilisateur :"  + utilisateur.login + utilisateur.pass);
    res.redirect('/');
  }
  else{
    res.render('signin.html', { 
      message: 'Login deja pris',
    });
  }
});

app.get('/userlist', (req, res) => {
  if (req.session.user) {
      res.render('userlist.html',{ 
        users: users_online,
        current: req.session.user,
        name : req.session.name,
      });
  } else {
    res.redirect('/');
  }
});

app.get('/addlobby', (req, res) => {
  if (req.session.user) {
   res.render("addlobby.html"); 
  }
  else res.redirect('/');
});

app.post('/addlobby', async (req, res) => {
  let lobby = null;
  let boolean = false;
  for (var i; i < lobbies.length; i ++) {
    if (lobbies[i].id == req.body.lobby) boolean = true;
  }
  if (req.body.lobby === '' || req.body.lobby === ' ') {
    res.render('addlobby.html', { 
      message: 'Nom vide',
    });
  }
  else if (boolean == false) {
    console.log(req.body.lobby);
    lobby = new Lobby(req.body.lobby);
    req.session.lobby = lobby;
    lobbies.push(lobby);
    console.log("Lobby Créer :"  + lobby.id);
    res.redirect('/tetris#' + lobby.id);
  }
  else{
    res.render('signin.html', { 
      message: 'Login deja pris',
    });
  }
});

app.get('/listelobby', (req, res) => {
  if (req.session.user) {
      res.render('listelobby.html',{ 
        lobbies: lobbies,
        name : req.session.name,
      });
  } else {
    res.redirect('/');
  }
});

app.get('/exitlobby', (req, res) => {
  for (var i = 0; i < lobbies.length; i ++) {
      lobbies[i].remove(req.session.user);
      console.log("Nom lobby : "+ lobbies[i].id + " taille : " + lobbies[i].users.length);
     if (lobbies[i].lobbyVide() == true) lobbies.splice(i, 1);
  }
  res.redirect('/userlist');
});

app.get('/fin', (req, res) => {
  console.log("Test");
  for (var i = 0; i < lobbies.length; i ++) {
      lobbies[i].remove(req.session.user);
     if (lobbies[i].lobbyVide() == true) lobbies.splice(i, 1); 
  }
    for (var u of users) {
     if (req.session.user.login == u.login) {
        console.log("Nom : " + u.login); 
       u.lose = u.lose + 1; 
       console.log("lose : " + u .lose);
     }
    }
  for (var u of users_online) {
     if (req.session.user.login == u.login) {
        console.log("Nom : " + u.login); 
       u.lose = u.lose + 1; 
       console.log("lose : " + u .lose);
     }
    }
    res.redirect('/userlist');
});

app.get('/tetris', (req, res) => {
  //On considère que l'utilisateur ne peut être que dans un lobby à la fois
  console.log("Ajout de l'utilisateur : " + req.session.name);
  for (var i = 0; i < lobbies.length; i ++) {
      lobbies[i].add(req.session.user);
  }
  
  if (req.session.user) {
    res.render('index.html');
  
  } else {
      res.redirect('/userlist');
  }
});

app.get('/logout', (req, res) => {
  users_online.splice(users_online.indexOf(req.session.user), 1);
  req.session.user = null;
  res.redirect('/');
});



function createId(len = 6, chars = 'abcdefghjkmnopqrftwxyz0123456789') {
   let id = ''; 
  while (len --) {
    id += chars[Math.random()*chars.length | 0];
  }
  
  return id;
}


function createSession(id = createId()) {
    if (sessions.has(id)) {
        throw new Error(`Session ${id} already exists`);
    }

    const session = new Session(id);
    console.log('Creating session', session);

    sessions.set(id, session);

    return session;
}

function getSession(id) {
    return sessions.get(id);
}

function createClient(conn, id = createId()) {
    return new Client(conn, id);
}

function broadcastSession(session) {
    const clients = [...session.clients];
    clients.forEach(client => {
        client.send({
            type: 'session-broadcast',
            peers: {
                you: client.id,
                clients: clients.map(client => {
                    return {
                        id: client.id,
                        state: client.state,
                    }
                }),
            },
        });
    });
}

// Function to broadcast the list of conneted users
// We define the WebSocket logic
wsserver.on('connection', conn => {
    console.log('Connection établie');
  const client = createClient(conn);

    conn.on('message', msg => {
      console.log('Message reçu', msg);
      const data = JSON.parse(msg);
      if (data.type === 'Connection established') {
        client.send({
          type : 'userlist',
          users: users,
        });
      }
      else if (data.type === 'create-session') {
            const session = createSession();
            session.join(client);
            client.state = data.state;
            client.send({
                type: 'session-created',
                id: session.id,
            });
        } else if (data.type === 'join-session') {
            const session = getSession(data.id) || createSession(data.id);
            session.join(client);
            client.state = data.state;
            broadcastSession(session);
        }else if (data.type === 'state-update') {
          const [key, value] = data.state;
            client.state[data.fragment][key] = value;
            client.broadcast(data);
        }
    });


    conn.on('close', () => {
      console.log('Connection ferme');
      const session = client.session;
      if (session) {
        session.leave(client);
      if(session.clients.size == 0) {
        sessions.delete(session.id);
         } 
      }
      
      broadcastSession(session);
    });
});

// Watch out for this: app.listen would break ws!
server.listen(process.env.PORT);
