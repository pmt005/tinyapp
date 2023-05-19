const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateString, findUserByEmail, urlsForUser } = require("./helpers");
const { users, urlDatabase, characters } = require("./database");
const app = express();
const PORT = 8080; // default port 8080

//CONFIGURATION
app.set("view engine", "ejs");

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'tinyapp',
  keys: ['asdfsadfsdf'],
}));





//DATA BELOW

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
  const userID = req.session.user_id;

  if (!userID) { // FILTER OUT USERS THAT ARE NOT SIGNED IN
    return res.send("<html><body>You must be logged in to use this feature</b></body></html>");
  }

  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: users[userID]
  };
  
  res.render("urls_index", templateVars);
});

//send htlm hello message for /hello path
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//display the urls_new page if put into the path
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  
  if (!userID) { // FILTER OUT USERS THAT ARE NOT SIGNED IN
    return res.redirect("/login");
  }
  
  res.render("urls_new", templateVars);
  
});

/*
Catch all path after u/ where it will take either a shortUrl from the DB
and redirect to the paired longUrl or send not found notification
 */
app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id;
  
  if (!urlDatabase[shortUrl]) {
    res.send("<html><body>shortUrl not found!</b></body></html>");
  }

  const longUrl = urlDatabase[shortUrl].longURL;
  res.redirect(longUrl);
});

/*
Catch all path after urls/ where if exists you see the url_show page
or send not found notification
*/
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const userID = req.session.user_id;

  if (!userID) { //FILTER NOT LOGGED IN
    return res.send("<html><body>You must be logged in to use this feature</b></body></html>");
  }
  
  if (!urlDatabase[shortUrl]) { //FILTER NOT FOUND SHORT URL
    return res.send("<html><body>shortUrl not found!</b></body></html>");
  }

  const templateVars = { id: shortUrl, longUrl: urlDatabase[shortUrl].longURL, user: users[userID] };
  
  res.render("urls_show", templateVars);
});


// Create a new pair for the db
app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL;
  const shortUrl = generateString(6, characters);
  const userID = req.session.user_id;
  

  if (!userID) {
    return res.send("<html><body>You must be logged in to use this feature</b></body></html>");
  }

  //make sure input has the correct prefix
  if (longUrl.slice(0, 7) !== "http://") {
    if (longUrl.slice(0, 8) !== "https://") {
      longUrl = "https://" + longUrl;
    }
  }
 
  urlDatabase[shortUrl] = {
    longURL: longUrl,
    userID: req.session.user_id,
  };

  res.redirect(`/urls/${shortUrl}`); // redirect to page showing longUrl for input shortUrl
});


//EDIT take a key and change the paired value
app.post('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  const userID = req.session.user_id;
  const currentUserUrls = urlsForUser(userID, urlDatabase);
  
  if (!userID) { //FILTER NOT LOGGED IN
    return res.send("<html><body>You must be logged in to use this feature</b></body></html>");
  }

  if (!urlDatabase[shortUrl]) { //FILTER OUT NOT FOUND
    return res.send("<html><body>short URL does not exist</b></body></html>");
  }

  if (urlDatabase[shortUrl] && !currentUserUrls[shortUrl]) { //FILTER OUT EXISTS BUT NOT OWNED BY USER
    return res.send("<html><body>You do not own this shortURL</b></body></html>");
  }

  currentUserUrls[shortUrl].longURL = req.body.longURL;
  urlDatabase[shortUrl].longURL = req.body.longURL;
  res.redirect('/urls');
});


// Delete a key and paired value from db when button is selected
app.post('/urls/:id/delete', (req, res) => {
  const shortUrl = req.params.id;
  const userID = req.session.user_id;
  const currentUserUrls = urlsForUser(userID, urlDatabase);
  
  
  if (!userID) { //FILTER NOT LOGGED IN
    return res.send("<html><body>You must be logged in to use this feature</b></body></html>");
  }
  

  if (!urlDatabase[shortUrl]) { //FILTER OUT NOT FOUND
    return res.send("<html><body>short URL does not exist</b></body></html>");
  }

  if (urlDatabase[shortUrl] && !currentUserUrls[shortUrl]) { //FILTER OUT EXISTS BUT NOT OWNED BY USER
    return res.send("<html><body>You do not own this shortURL</b></body></html>");
  }

  delete currentUserUrls[shortUrl];
  delete urlDatabase[shortUrl];
  return res.redirect('/urls');
  
});

// render register page
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    return res.render("urls_index", templateVars);
  }
  res.render("urls_register", templateVars);
});

// register new user
app.post("/register", (req, res) => {
  const id = generateString(8, characters);
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  const newHashPass = bcrypt.hashSync(newUserPassword, 10);

  const currentUser = findUserByEmail(newUserEmail, users);

  if (newUserEmail === "" || newUserPassword === "") { // Filter out empty input
    console.log(users);
    return res.status(401).send('Please enter a valid email and password');

  }

  if (currentUser) {
    return res.status(401).send(`User: ${currentUser.id} already exists`);
  }

  users[id] = {
    id: id,
    email: newUserEmail,
    password: newHashPass
  };

  req.session['user_id'] = id;
  res.redirect("/urls");

});

// render login page
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };
  if (templateVars.user) {
    return res.render("urls_index", templateVars);
  }
  res.render("urls_login", templateVars);
});

//login user
app.post('/login', (req, res) => {
  const currentUserEmail = req.body.email;
  const currentUserPassword = req.body.password;

  if (currentUserEmail === "" || currentUserPassword === "") { // Filter out empty input
    console.log(users);
    return res.status(401).send('Please enter a valid email and password');
  }

  const currentUser = findUserByEmail(currentUserEmail, users);
  
  if (currentUser) {
    if (bcrypt.compareSync(currentUserPassword, currentUser.password)) {
      req.session['user_id'] = currentUser.id;
      return res.redirect('/urls');
    }
    return res.status(403).send(`<html><body> Password doesn't match :( </b></body></html> `);
  }
  return res.status(403).send(`<html><body> User Not Found :( </b></body></html>   `);
});

//logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});