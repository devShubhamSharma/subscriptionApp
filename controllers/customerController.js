const DBConnection = require('../handlers/dbConnection');
const connection = new DBConnection();

// const createOrders = new CreateOrders();

exports.cancel = (req,res,next)=>{
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
    });
    var sql = 'UPDATE order_details SET subscription_status = 1 where order_id='+req.params.id;
    console.log(sql);
    var response;
    connection.query(sql, (err, rows) => {
        if (err) {
            response = "No Subscription"
        } else {
            response = "Subscription Canceled"
        }
        return res.json(response);
    });
}

exports.createOrder = (req,res,next)=>{
    var date = new Date();
    var dateFormat = date.getFullYear()+'-'+ (date.getMonth() + 1) +'-'+date.getDate();
    var orderArray = [];
    const sql = "SELECT * FROM order_details WHERE next_order_date=" + connection.escape(dateFormat) + " AND subscription_status = 1"; 
    connection.query(sql, function(error, result, fields){
            if(error) return callback(error);
            else{
                result.forEach((item,index) => {
                    orderArray.push({
                        "order": {
                            "line_items": [{
                                "variant_id": item.variant_id,
                                "quantity": item.quantity
                            }],
                            "customer": {
                                "id": item.customer_id
                            }
                        }
                    });
                });
            }
        });
}