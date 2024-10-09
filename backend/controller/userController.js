const bcrypt = require('bcryptjs');
const { getGreenTrustUserModel } = require('../db.js');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

async function SignUp(req, res) {
  const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const User = getGreenTrustUserModel();
  console.log(User);
  
  try {
    // Get User Input
    const {
      email,
      password,
      role,
      organization,
      companyName,
      licence,
      walletAddress,
    } = req.body;

    // Validate required user inputs
    if (!(email && password && role)) {
      return res.status(400).send('All fields are required');
    }

    if (!walletAddress) {
      return res.status(400).send('Wallet Connection Required');
    }

    // Validate email format
    if (!emailValid.test(email)) {
      return res.status(400).send('Invalid email format');
    }

    // Validate role and role-specific fields
    if (!['auditor', 'issuer', 'demander'].includes(role)) {
      return res.status(400).send('Invalid role selected');
    }

    // Role-based validation
    if (role === 'auditor') {
      if (!companyName || !licence) {
        return res.status(400).send('Company Name and Licence are required for auditors');
      }
    } else if (role === 'demander' || role === 'issuer') {
      if (!organization) {
        return res.status(400).send('Organization is required for demanders or issuers');
      }
    }

    // Check if user already exists
    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(403).send({
        message: 'User already exists!',
      });
    }

    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await User.create({
      email: email.toLowerCase(),
      password: encryptedPassword,
      role,
      organization: role === 'demander' || role === 'issuer' ? organization : "Nexus", // Set organization if applicable
      companyName: role === 'auditor' ? companyName : null, // Set companyName if applicable
      licence: role === 'auditor' ? licence : null, // Set licence if applicable
      walletAddress: walletAddress
    });

    // Generate a JWT token for the new user
    const token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h', // Set expiration time for the token
    });

    // Send success response with the token
    return res.status(201).send({
      message: "User account created!",
      token,  // Return the token to the frontend
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: "An error occurred while creating the user account.",
    });
  }
}


async function SignIn(req, res) {
  const User = getGreenTrustUserModel();
  console.log(User);
  
  try {
    const { email, password, walletAddress } = req.body;

    // Validate required input
    if (!(email && password)) {
      return res.status(400).send('Email and Password are required');
    }

    if (!walletAddress) {
      return res.status(400).send('Wallet Connection Required');
    }

    // Find user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const existingWalletAddress = user.walletAddress;

    // Check if the user exists, password matches, and wallet address matches
    if (user && (await bcrypt.compare(password, user.password)) && existingWalletAddress === walletAddress) {
      
      // Generate a JWT token with an expiration time (1 hour in this case)
      const token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { 
        expiresIn: '1h',  // Token expires in 1 hour
      });

      // Send success response with the token
      return res.status(203).json({ 
        message: 'Login successful', 
        token: token, 
        role: user.role 
      });

    } else {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


// Function to fetch all certificates with status
const fetchUserWithEmail = async (email) => {
  const GreenTrustModel = getGreenTrustUserModel();
const Data = GreenTrustModel
  try {
    // Find all documents where the status is as the parameter
    const user = await Data.find({ email: email });

    if (!user.length) {
      throw new Error(`No certificates found with status ${email}`);
    }
    console.log(user)
    // Return the list of certificates
    return user;
  } catch (error) {
    throw new Error(error.message || 'Server error');
  }
};


module.exports = {
    SignUp,
    SignIn,
    fetchUserWithEmail
  };