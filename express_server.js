const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// program to generate random strings

// declare all characters
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//this function was found @programiz.com
const generateString = function(length) {
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id;
  const longUrl = urlDatabase[shortUrl];
  if (!urlDatabase[shortUrl]) {
    res.send("shortUrl not found!");
  }
  res.redirect(longUrl);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let longUrl = req.body.longURL;
  const shortUrl = generateString(6);
  if (longUrl.slice(0,6).join !== "http://") {
    longUrl = "http://" + longUrl;
  }
  urlDatabase[shortUrl] = longUrl;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const templateVars = { id: shortUrl, longUrl: urlDatabase[shortUrl] };

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});