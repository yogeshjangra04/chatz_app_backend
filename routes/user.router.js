const express = require('express')
const { registerUser, loginUser, getAllUsers } = require('../controllers/user.controller')
const authenticateUser = require('../middleware/auth.mw')
const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/list').get(authenticateUser, getAllUsers)

router.get('/', (req, res) => {
       res.send('API is running....');
     });

module.exports = router