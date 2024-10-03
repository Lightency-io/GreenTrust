const bcrypt = require('bcryptjs');
const { getGreenTrustUserModel } = require('../db.js');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

async function SignUp(req, res) {
  const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const User = getGreenTrustUserModel();
  console.log(User)
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
    if (
      !(
        email &&
        password &&
        role
      )
    ) {
      return res.status(400).send('All fields are required');
    }

    if (!walletAddress){
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

    // Send success response
    return res.status(201).send({
      message: "User account created!",
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
  console.log(User)
    try {
        let token = ""
        const { email, password, walletAddress } = req.body
        if (!(email && password)) {
          res.status(400).send('Required Input')
        }

        if(!walletAddress){
          res.status(400).send('Wallet Connection Required')
        }
        const user = await User.findOne({ email: email })
        const existingWalletAddress = user.walletAddress
        if (user && (await bcrypt.compare(password, user.password)) && existingWalletAddress === walletAddress) {
          dotenv.config()
          token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { 
          })
          res.status(203).json({ message: 'login success', token: token , role : user.role })
        } else {
          res.status(400).json({ erreur: 'wrong credentials' })
        }
      } catch (err) {
        res.status(400).json({ json: err })
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