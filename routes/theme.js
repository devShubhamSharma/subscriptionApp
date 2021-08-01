const express = require('express');
const siteController = require('../controllers/siteController');

const router = express.Router();
router.post('/install/assets',siteController.getThemes);

module.exports = router;