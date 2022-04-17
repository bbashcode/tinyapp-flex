const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();
const PORT = 8080;
//middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan("dev"));


const findUserByEmail = (email) => {
  for(let userId in users){
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// TODO: possibly move to data layer
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//TODO: Redirect to res.render(/urls)
app.get("/", (req, res) => {
  res.send("Hello!");
});

//TODO: Remove later - Cleanup
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  if(user_id){
    const user = users[user_id];
    const templateVars = {user};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});


app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user};
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  const {longURL} = req.body;
  const shortURL = generateRandomString();
  urlDatabase = {...urlDatabase, [shortURL]: longURL};
  res.redirect(302, `/urls/${shortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  const {longURL} = req.body;
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.post("/urls/:shortURL", (req, res)=> {
  res.redirect(`/urls/${req.params.shortURL}`)
})


app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {user};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log("email: ", email, "password: ", password);
  if(!email || !password) {
    return res.status(400).send("Email or password cannot be empty!");
  }

  const user = findUserByEmail(email);

  if(!user){
    return res.status(403).send("User cannot be found!");
  }

  if(user.password !== password){
    return res.status(403).send("Password did not match!");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {user};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    return res.status(400).send("Email or password cannot be empty!");
  }

  //find out if email already in use
  const user = findUserByEmail(email);

  if(user){
    return res.status(400).send("Email alreasdy in use!");
  }

  const id = generateRandomString();

  users[id] = {
    id,
    email,
    password
  };

  res.cookie("user_id", id);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// TODO: helper function, possibly move to a different file
//function to generate 6 character long unique renadom string
function generateRandomString() {
  let length = 6;
  let shortURL = "";

  const alphaNumeric =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * alphaNumeric.length);
    shortURL += alphaNumeric.substring(randomIndex, randomIndex + 1);
  }

  return shortURL;
}