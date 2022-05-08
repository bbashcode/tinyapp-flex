const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers");

const app = express();
const PORT = 8080;



//middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["Simple-is-better-than-complex"],
  maxAge: 24 * 60 * 60 * 1000 // indicates how long the cookie will remain valid i.e. 24 hours in this case
}));
app.use(morgan("dev"));


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("funk", 10)
  }
};

//this object is taken from compass
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

// GET calls
app.get("/", (req, res) => {
  if(req.session.user_id){
    res.redirect("/urls");
  }

  res.redirect("/login")
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];

  if(!user){
    return res.status(401).send("Please login or register first!");
  }
  const templateVars = {urls: urlDatabase[user], user};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  //only registered users can access this route to create new url
  const user_id = req.session["user_id"];
  const user = users[user_id];
  if(user){
    const user = users[user_id];
    const templateVars = {urls: urlDatabase,user};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  
  //check if user is logged in first
  if(!user){
    return res.render("errorAccess", {user:users[req.session.user_id]});
  }

  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user};

  const userID = templateVars.user.id;
  if(urlDatabase[req.params.shortURL].userID !== userID){
    return res.render("errorAccess", {user:users[req.session.user_id]});
  }


  if(!urlDatabase[req.params.shortURL].longURL){
    return res.status(404).send("Error! Page not found!");
  }

  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {

  if (!req.session.user_id){
    res.status(401).send("Please login to access your URLs!");
  }

  if(!urlDatabase[req.params.shortURL]){
    res.status(404).send("Error! Page not found!")
  }


  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get("/login", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];

  if(user_id){
    return res.redirect("/urls");
  }
  const templateVars = {user};
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  if(user_id){
    res.redirect("/urls");
  }
  const templateVars = {user};
  res.render("register", templateVars);
});


// Post calls
app.post("/urls", (req, res) => {
  //if user not logged in show an error
  if (!req.session.user_id){
    return res.status(401).send("Please login to access your URLs!");
  }

  const {longURL} = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID: users[req.session.user_id]};
  res.redirect(302, `/urls/${shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  //if user not logged in show an error
  if(!req.session.user_id){
    res.status(401).render("errorAccess", {user: users[req.session.user_id]}).redirect();
  }

  const templateVars = { shortURL: req.params.shortURL, user: users[req.session.user_id]};
  const userID = templateVars.user.id;

  if(urlDatabase[req.params.shortURL].userID !== userID){
    res.status(401).render("errorAccess", {user: users[req.session.user_id]});
  }

  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id].id
  }

  res.redirect("/urls");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  //if user not logged in show an error
  if(!req.session.user_id){
    res.status(401).render("errorAccess", {user: users[req.session.user_id]});
  }

  const templateVars = { shortURL: req.params.shortURL, user: users[req.session.user_id]};
  const userID = templateVars.user.id;

  if(urlDatabase[req.params.shortURL].userID !== userID){
    res.status(401).render("errorAccess", {user: users[req.session.user_id]});
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // console.log("email: ", email, "password: ", password);
  if(!email || !password) {
    return res.status(400).send("Email or password cannot be empty!");
  }

  const user = getUserByEmail(email);

  if(!user){
    return res.status(403).send("User cannot be found!");
  }

  if(bcrypt.compareSync(user.password, password)){
    return res.status(403).send("Password did not match!");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    return res.status(400).send("Email or password cannot be empty!");
  }

  //find out if email already in use
  const user = getUserByEmail(email);

  if(user){
    return res.status(400).send("Email alreasdy in use!");
  }

  const id = generateRandomString();

  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };

  req.session.user_id = id;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


