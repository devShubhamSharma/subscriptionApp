const DBConnection = require('../handlers/dbConnection');
const connection = new DBConnection();

exports.cancelSubscription = (req,res,next) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
    });
    var orderArr = [];
    const selectQuery = 'SELECT  * FROM order_details where customer_id='+req.params.id;
    connection.query(selectQuery, (err, rows) => {
        if (err) {
            res.send("No Data Found");
        } else {
            rows.forEach((item,index) =>
                orderArr.push({
                    "OrderId": item.order_id, 
                    "ProductTitle": item.Product_Title,
                    "SellingPlan": item.selling_plan,
                    "Quantity": item.quantity,
                    "NextOrderDate": item.next_order_date
                })

            );
        }
        return res.json(orderArr);
    });
}