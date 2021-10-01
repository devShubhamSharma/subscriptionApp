const express = require('express');
const siteController = require('../controllers/siteController');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

router.get('/site',siteController.appInstall);

router.get('/site/callback',siteController.getToken);

// router.post('/install/assets',siteController.getThemes);

router.get('/create/orders', siteController.createOrder);

router.post('/orders/webhook',webhookController.webhookResponse);

module.exports = router;