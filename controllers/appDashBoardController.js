const DBConnection = require('../handlers/dbConnection');

const connection = new DBConnection();

exports.subscribedOrders = (req, res, next) => {
    const nextSkip = (typeof req.query.nextdata == 'undefined') ? 0 : req.query.nextdata;
    const limit = 4;
    var orderArr = [];
    var pageCount;
    var totalCount = 0;
    const selectQuery = 'SELECT COUNT(id) AS id_count FROM order_details';
    const sql = 'SELECT * FROM `order_details` WHERE `id` >'+ nextSkip + ' LIMIT '+ limit;
    connection.query(selectQuery, (err, rows) => {
        if (err) {
            throw err;
        } else {
            totalCount = rows;
        }
    });
    connection.query(sql, (err, rows) => {
        if (err) {
            throw err;
        } else {
            rows.forEach((item) =>{
            var weekDays;        
            switch(item.selling_plan){
                case '7':
                    weekDays = "1 Week";
                    break;
                case '14':
                    weekDays = "2 Week";
                    break;
                case '21':
                    weekDays = "3 Week";
                    break;
                case '28':
                    weekDays = "4 Week";
                    break;
            }
                var subscription_status = (item.subscription_status == 1) ? 'Active' : 'Inactive';
                let temp_date = new Date(item.order_created);
                let order_date = temp_date.toString().split("GMT")[0];
                let temp_next_date = new Date(item.next_order_date);
                let next_date = temp_next_date.toString().split("GMT")[0];
                orderArr.push({
                    "id" : item.id,
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
            //var arr_length = orderArr.length;
            pageCount = Math.ceil((totalCount[0].id_count)/limit);
        }
        res.render('shop/subscribedOrders',{
            OrderData : orderArr,
            pageCount:pageCount
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