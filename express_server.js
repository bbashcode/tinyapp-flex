const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080


//middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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