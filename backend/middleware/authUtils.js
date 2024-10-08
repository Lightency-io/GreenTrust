const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Function to verify and decode the JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify and decode
    console.log("test", decoded)
    req.user = decoded.user; // Attach decoded user to request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if the user is authorized for the certificate
const checkUserAuthorization = (user, certificate) => {
  // Only Issuer, Auditor, or Demander of the certificate can access
  console.log("hi",user)
  return (
    user.role === 'issuer' ||
    user.role === 'auditor' ||
    user.email === certificate.demanderEmail
  );
};

module.exports = {
  verifyToken,
  checkUserAuthorization,
};
