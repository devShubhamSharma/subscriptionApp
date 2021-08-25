const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
    database: 'SubscriptionClient'
});
var date = new Date();
var dateFormat = date.getFullYear()+'-'+ (date.getMonth() + 1) +'-'+date.getDate();
const orderArray = [];

var getOrderFromDb = {
    getInfoFromDB: function () {
        const sql = "SELECT * FROM order_details WHERE next_order_date=" + connection.escape(dateFormat) + " AND subscription_status = 1";
        connection.query(sql, function(error, result, fields){
            if(error) return callback(error);
            else{
                orderArray.push(result);
            }
            getOrderFromDb.allOrdersFromDB(orderArray);
        });
    },
    allOrdersFromDB: function(orderArray) {
      return orderArray;
    }
  };

module.exports = getOrderFromDb;


// module.exports = class CreateOrders{

//     getInfoFromDB(callback){
//         const sql = "SELECT * FROM order_details WHERE next_order_date=" + connection.escape(dateFormat) + " AND subscription_status = 1";
//         console.log(sql);
//         connection.query(sql, function(error, result, fields){
//             if(error) return callback(error);
//             else{
//                 orderArray.push(result);
//             }
//             this.allOrdersFromDB(orderArray);
//         });
//     }

//     allOrdersFromDB(orderArray){
//         console.log(orderArray);
//         // const sql = "SELECT * FROM order_details WHERE next_order_date=" + connection.escape(dateFormat) + " AND subscription_status = 1";
//         // const orderArray = [];
//         // connection.query(sql,[result], (err, rows) => {
//         //     if (err) {
//         //         throw err;
//         //     } else {
//         //         rows.forEach((item) =>{
//         //             orderArray.push({
//         //                 "order":{
//         //                     "line_items":[
//         //                         {
//         //                             "variant_id" : item.variant_id,
//         //                             "quantity" : item.quantity
//         //                         }
//         //                     ],
//         //                     "customer": {
//         //                         "id": item.customer_id
//         //                     }
//         //                 }
//         //             });
//         //         });
//         //     }
//         //     return orderArray;
//         // });
//     }

// }