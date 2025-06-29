const { validateToken } = require("../services/authentiction");
const User = require("../models/user"); // ✅ Add this

function checkForeAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      const user = await User.findById(userPayload._id);
      req.user = user;
    } catch (error) {
      console.error("Failed to authenticate user:", error.message);
    }

    return next();
  };
}

module.exports = {
  checkForeAuthenticationCookie,
};
