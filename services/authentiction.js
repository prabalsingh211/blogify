const jwt = require("jsonwebtoken");

const secret = "$uperMan@123";

function createTokenForUser(user) {
  const payLoad = {
    _id: user._id,
    email: user.email,
    profileImageURL: user.profileImageURL,
    role: user.role,
  };

  const token = jwt.sign(payLoad, secret);

  return token;
}

function validateToken(token) {
  const payload = jwt.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenForUser,
  validateToken,
};
