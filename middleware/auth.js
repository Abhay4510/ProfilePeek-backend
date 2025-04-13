const jwt = require("jsonwebtoken");
const User = require('../models/User'); 
const secretKey = process.env.JWT_SECRET || "insta-profile-peek-secret";

function generateToken(user) {
  const token = jwt.sign(
    {
      _id: user._id,
      instagramId: user.instagramId,
      username: user.username
    },
    secretKey,
    {
      expiresIn: "30d",
    }
  );

  return token;
}

function extractJWTFromRequest(req) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return token;
  }

  return null;
}

const validateToken = async (req, res, next) => {
  const token = extractJWTFromRequest(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

function extractJWTDetails(jwtToken) {
  try {
    const decoded = jwt.verify(jwtToken, secretKey);
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

module.exports = {
  validateToken,
  extractJWTDetails,
  extractJWTFromRequest,
  generateToken
};