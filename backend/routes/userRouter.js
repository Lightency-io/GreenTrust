const express = require('express')
const UserController = require('../controller/userController.js')

const router = express.Router()

router.post('/signUp',UserController.SignUp)
router.post('/signIn',UserController.SignIn)


module.exports = router;
