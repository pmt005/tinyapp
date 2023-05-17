const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateString } = require("./generateString");
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



//show hello message
app.get("/", (req, res) => {
  res.send("Hello!");
});

//return the json string of the db
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//show a urls_index page containing the info of the db
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//send htlm hello message for /hello path
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//display the urls_new page if put into the path
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//catch all path after u/ where it will take either a shortUrl from the DB
//and redirect to the paired longUrl or send not found notification
app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id;
  const longUrl = urlDatabase[shortUrl];
  if (!urlDatabase[shortUrl]) {
    res.send("shortUrl not found!");
  }
  res.redirect(longUrl);
});

// Create a new pair for the db
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let longUrl = req.body.longURL;
  const shortUrl = generateString(6);
  //make sure input has the correct prefix
  if (longUrl.slice(0,7) !== "http://") {
    console.log(longUrl.slice(0,7));
    if (longUrl.slice(0,8) !== "https://") {
      longUrl = "https://" + longUrl;
    }
    
  }
  urlDatabase[shortUrl] = longUrl;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`); // redirect to page showing longUrl for input shortUrl
});

// Delete a key and paired value from db when button is selected
app.post('/urls/:id/delete', (req, res) => {
  const shortUrl = req.params.id;
  console.log(shortUrl);
  if (urlDatabase[shortUrl]) {
    delete urlDatabase[shortUrl];
    return res.redirect('/urls');
  }
  res.send('The item was already deleted');
});

// page that shows longUrl for input shortUrl
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const templateVars = { id: shortUrl, longUrl: urlDatabase[shortUrl] };

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});