// server/routes/userRoutes.js
const express = require('express')
const router = express.Router()
const { protect, role } = require('../middlewares/auth')
const { getUsers, getUserById } = require('../controllers/userController')

router.get('/', protect, role(['admin']), getUsers)
router.get('/:id', protect, role(['admin']), getUserById)

module.exports = router