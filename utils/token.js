const jwt = require("jsonwebtoken");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const getJwtSecret = () => process.env.JWT_SECRET || "evopulse_dev_jwt_secret_change_me";

const generateAuthToken = (user) => {
  return jwt.sign(
    {
      sub: String(user?._id || user?.id || ""),
      email: user?.email || "",
      role: user?.role || "user"
    },
    getJwtSecret(),
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
};

const verifyAuthToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  generateAuthToken,
  verifyAuthToken
};
