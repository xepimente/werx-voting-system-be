const { sign, verify } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const secret = "ssddxxx2020";
const moment = require("moment");


/**
 * Creates both an access token and a refresh token for the given user.
 * @param {object} user - User object containing information to be included in the tokens.
 * @returns {string} accessToken - Signed access token.
 * @returns {string} refreshToken - Signed refresh token.
 */
const createToken = (user) => {
  // Access Token with short expiration time

  const accessToken = sign(
    {
      role: user.role,
      email: user.email,
      id: user._id,
    },
    secret,
    { expiresIn: '1d' } // 1d
  );

  // Return both tokens
  return { accessToken };
};


/**
 * Middleware to validate the access token in the request.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const validateToken = async (req, res, next) => {
  // let accessToken = req.cookies["auth"];
  let accessToken = req.headers["auth"]

  if (!accessToken) {
      return res.status(400).json({ error: "Invalid access token" });
    }


  try {
    // Verify the access token
    const validToken = verify(accessToken, secret);

    // If verification is successful, set authentication flag and continue
    if (validToken) {
      req.authenticated = true;
      next();
    } else {
      return res.status(400).json({ error: "Invalid access token" });
    }
  } catch (error) {
    // Handle verification error
    console.error(error);
    // return res.status(500).json({ error: "Verification failed" });
  }
};


const validateVoterToken = async (req, res, next) => {
  // let accessToken = req.cookies["voter"];
  let accessToken = req.headers["voter"];

  if (!accessToken) {
      return res.status(400).json({ error: "Invalid access token" });
    }


  try {
    // Verify the access token
    const validToken = verify(accessToken, secret);

    // If verification is successful, set authentication flag and continue
    if (validToken) {
      req.authenticated = true;
      next();
    } else {
      return res.status(400).json({ error: "Invalid access token" });
    }
  } catch (error) {
    // Handle verification error
    console.error(error);
    // return res.status(500).json({ error: "Verification failed" });
  }
};

const decode = (token) => {
  if (typeof token !== "undefined") {
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      // Log the error message and return null if decoding fails
      return null;
    }
  } else {
    // Return null if the token is undefined
    return null;
  }
};

module.exports = {
  createToken,
  validateToken,
  decode,
  validateVoterToken
};