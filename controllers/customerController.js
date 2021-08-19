const DBConnection = require('../handlers/dbConnection');
const connection = new DBConnection();

exports.cancel = (req,res,next)=>{
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
    });
    var sql = 'UPDATE order_details SET subscription_status = 1 where order_id='+req.params.id;
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