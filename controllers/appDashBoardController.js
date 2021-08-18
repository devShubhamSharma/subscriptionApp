const DBConnection = require('../handlers/dbConnection');

const connection = new DBConnection();

exports.subscribedOrders = (req, res, next) => {
    var orderArr = [];
    const selectQuery = 'SELECT * FROM order_details';
    connection.query(selectQuery, (err, rows) => {
        if (err) {
            throw err;
        } else {
            rows.forEach((item) =>
                orderArr.push({
                    "CustomerId": item.customer_id, 
                    "ProductTitle": item.Product_Title,
                    "SellingPlan": item.selling_plan,
                    "Quantity": item.quantity,
                    "NextOrderDate": item.next_order_date
                })
            );
        }
        res.render('shop/subscribedOrders',{
            OrderData : orderArr
        });
    });
};


exports.subscribedCustomers = (req, res, next) => {
    var customerArr = [];
    const selectQuery = 'SELECT * FROM customer_details';
    connection.query(selectQuery, (err, rows) => {
        if (err) {
            throw err;
        } else {
            rows.forEach((item) =>
            customerArr.push({
                    "CustomerId": item.customer_id,
                    "FirstName": item.first_name,
                    "LastName": item.last_name, 
                    "CustomerEmail": item.customer_email,
                    "CustomerPhone": item.customer_phone
                })
            );
        }
        res.render('shop/subscribedCustomers',{
            CustomerData : customerArr
        });
    });
};