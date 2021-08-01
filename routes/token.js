const express = require('express');
const siteController = require('../controllers/siteController');

const router = express.Router();
router.get('/site/callback',siteController.getToken);

module.exports = router;