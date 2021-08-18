const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customerController');

router.get('/customer/:id/subscription', customerController.cancelSubscription);

module.exports = router;