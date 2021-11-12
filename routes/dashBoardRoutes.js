const express = require('express');
const router = express.Router();

const orderController = require('../controllers/appDashBoardController');

router.get('/subscribed/orders', orderController.subscribedOrders);
router.post('/view/orders', orderController.viewOrders);
router.get('/subscribed/customers', orderController.subscribedCustomers);

module.exports = router;