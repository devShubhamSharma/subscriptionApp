const express = require('express');
const siteController = require('../controllers/siteController');

const router = express.Router();
router.get('/site',siteController.appInstall);

module.exports = router;