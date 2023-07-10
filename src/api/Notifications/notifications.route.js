const express = require('express');
const validate = require('../../middlewares/validate');
const notificationsValidation = require('./notifications.validation');
const notificationsController = require('./notifications.controller');
const upload = require('../../config/multer');
const router = express.Router();
const auth = require('../../middlewares/auth');

router.get('/', auth('notifications'), validate(notificationsValidation.getNotifications), notificationsController.getNotifications);

module.exports = router;
