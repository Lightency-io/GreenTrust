const express = require('express')
const UserController = require('../controller/userController.js')
const dotenv = require('dotenv');

const router = express.Router()

router.post('/signUp',UserController.SignUp)
router.post('/signIn',UserController.SignIn)


router.get('/getUserWithEmail/:email', async (req, res) => {
    const {email} = req.params;
    try {
      const user = await UserController.fetchUserWithEmail(email);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


// router.get('/verifyUser', (req, res) => {
//     const token = req.headers.authorization.split(' ')[1];
//     if (!token) return res.status(401).send('Access denied. No token provided.');
  
//     try {
//       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       // Fetch user from database using decoded.userId
//       const user = getUserFromDb(decoded.userId);
//       res.json(user);
//     } catch (ex) {
//       res.status(400).send('Invalid token.');
//     }
//   });


module.exports = router;
