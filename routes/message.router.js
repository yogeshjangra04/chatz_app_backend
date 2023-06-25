const express = require('express')
const { sendMessage, getAllMessages } = require('../controllers/message.controller')
const router = express.Router()

router.route('/').post(sendMessage)
router.route('/:chatId').get(getAllMessages)


module.exports = router