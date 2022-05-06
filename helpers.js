const getUserByEmail = (email, users) => {
  for(let userId in users){
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
};

//function to generate 6 character long unique renadom string
const generateRandomString = function () {
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

const urlsForUser = function(id, urlDB){
  const result = {};
  for(let key in urlDB){
    if(urlDB[key].userID === id){
      result[key] = {
        longURL: urlDB[key].longURL,
        userID: urlDB[key].userID
      }
    }
  }
  return result;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser};