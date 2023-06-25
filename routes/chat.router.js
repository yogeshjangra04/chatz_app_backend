const express = require('express')
const { getDirectChat, fetchChats, createGroup, renameGroup, addUserToGroup, removeUserFromGroup } = require('../controllers/chat.controller')
const router = express.Router()

router.route('/').post(getDirectChat).get(fetchChats)

router.route('/group/create').post(createGroup)
router.route('/group/rename').patch(renameGroup)
router.route('/group/addUser').patch(addUserToGroup)
router.route('/group/removeUser').patch(removeUserFromGroup)




module.exports = router
