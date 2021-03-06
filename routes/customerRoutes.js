const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customerController');

/*router.get('/customer/:id/subscription', customerController.cancelSubscription);*/
router.get('/cancel/:id/subscription', customerController.cancel);
router.get('/cancel/orders', customerController.orderCancel);

module.exports = router;