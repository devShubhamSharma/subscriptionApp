const DBConnection = require('../handlers/dbConnection');

const connection = new DBConnection();

exports.subscribedOrders = (req, res, next) => {
    var orderArr = [];
    const selectQuery = 'SELECT * FROM order_details';
    connection.query(selectQuery, (err, rows) => {
        if (err) {
            throw err;
        } else {
            rows.forEach((item) =>{
            var weekDays;        
            switch(item.selling_plan){
                case '7':
                    weekDays = "7 Week";
                    break;
                case '14':
                    weekDays = "14 Week";
                    break;
                case '21':
                    weekDays = "21 Week";
                    break;
                case '28':
                    weekDays = "28 Week";
                    break;
            }
                var subscription_status = (item.subscription_status == 1) ? 'Active' : 'Inactive';
                let temp_date = new Date(item.order_created);
                let order_date = temp_date.toString().split("GMT")[0];
                let temp_next_date = new Date(item.next_order_date);
                let next_date = temp_next_date.toString().split("GMT")[0];
                orderArr.push({
                    "OrderNumber": item.order_number, 
                    "Date": order_date,
                    "Customer": item.customer_fullname,
                    "Total": item.total_price,
                    "SellingPlan": weekDays,
                    "Items": item.quantity,
                    "NextDate" : next_date,
                    "Status": subscription_status

                })
            });
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