const DBConnection = require('../handlers/dbConnection');

const connection = new DBConnection();

exports.subscribedOrders = (req, res, next) => {
    const nextSkip = (typeof req.query.nextdata == 'undefined') ? 0 : req.query.nextdata;
    const limit = 4;
    var orderArr = [];
    var pageCount;
    var totalCount = 0;
    const distinctQuery = "SELECT DISTINCT order_number,total_price,customer_fullname,selling_plan,order_created,next_order_date,subscription_status FROM order_details";
    //const selectQuery = 'SELECT COUNT(id) AS id_count FROM order_details';
    //const sql = 'SELECT * FROM `order_details` WHERE `id` >'+ nextSkip + ' LIMIT '+ limit;
    // connection.query(selectQuery, (err, rows) => {
    //     if (err) {
    //         throw err;
    //     } else {
    //         totalCount = rows;
    //     }
    // });
    connection.query(distinctQuery, (err, rows) => {
        if (err) {
            throw err;
        } else {
            if(rows.length != 0){
            rows.forEach((item,index) =>{
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
            var subscription_status = item.subscription_status == 1 ? "Active" : "Inactive";
            var cancel_btn = item.subscription_status == 1 ? "Cancel" : "Canceled";
            let temp_date = new Date(item.order_created);
            let order_date = temp_date.toString().split("GMT")[0];
            let temp_next_date = new Date(item.next_order_date);
            let next_date = temp_next_date.toString().split("GMT")[0];
                //const arr_length = orderArr.length;\
                orderArr.push({
                    id: item.id,
                    OrderNumber: item.order_number,
                    Date: order_date,
                    Total: item.total_price,
                    Customer: item.customer_fullname,
                    SellingPlan: weekDays,
                    NextDate: next_date,
                    Status: subscription_status,
                    cancel:  cancel_btn
                  });
            });
            //pageCount = Math.ceil((totalCount[0].id_count)/limit);
        }else{
            orderArr = "No Subscription Found";
        }
        //console.log(orderArr);
            //var arr_length = orderArr.length;
        }
        res.render('shop/subscribedOrders',{
            OrderData : orderArr
           // pageCount:pageCount
            
        });
    });
};

exports.viewOrders = (req,res) => {
    console.log(res.query);
    return res.send('{"success"}');
};


exports.subscribedCustomers = (req, res, next) => {
    var customerArr = [];
    const selectQuery = 'SELECT * FROM customer_details';
    connection.query(selectQuery, (err, rows) => {
        if (err) {
            throw err;
        } else {
            if(rows.length != 0){
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
            else{
                customerArr = "No Customer Found";
            }
        }
        res.render('shop/subscribedCustomers',{
            CustomerData : customerArr
        });
    });
};