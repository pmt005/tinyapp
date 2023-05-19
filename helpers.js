const { users, characters, urlDatabase } = require("./database");


const generateString = function(length) {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const findUserByEmail = function(userEmail) {
  for (let user in users) {
    if (users[user]['email'] === userEmail) {
      return users[user];
    }
  }

  return null;
};

const urlsForUser = function(userID) {
  const currentUrls = {};
  for (let element in urlDatabase) {
    if (urlDatabase[element].userID === userID) {
      currentUrls[element] = urlDatabase[element];
    }
  }
  return currentUrls;
};


module.exports = { generateString, findUserByEmail, urlsForUser };