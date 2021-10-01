const request = require('request-promise');
const DBConnection = require('../handlers/dbConnection');
const connection = new DBConnection();

function setDateFormat(date,day){
    if(date != undefined){
      var temp_date = date.setDate(date.getDate() + day);
      let new_date = new Date(temp_date);
      var dateFormat = new_date.getFullYear()+'-'+ (new_date.getMonth() + 1) +'-'+new_date.getDate();
      return dateFormat;
    }
}

module.exports = class ShopifyOrders{
    
    createOrders(){
        var date = new Date();
        var dateFormat = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        const arr_temp = [];
        var sql = "SELECT * FROM order_details WHERE next_order_date="+connection.escape(dateFormat)+"AND subscription_status = 1";    
        var update_query,next_order_date, order_update;
        connection.query(sql, function (error, result) {
            if (error) {
                return error;
            }
            else {
            result.forEach((item, index) => {
                if (!arr_temp[item.order_number]) {
                switch (item.selling_plan){
                    case "7":
                    let date = new Date();
                    next_order_date   = setDateFormat(date,14);
                    update_query = `UPDATE order_details SET subscribed_orders_count = 1, next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
                    break;
                    case "14":
                    let date1 = new Date();
                    next_order_date   = setDateFormat(date1,14);
                    update_query = `UPDATE order_details SET subscribed_orders_count = 1, next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
                    break;
                    case "21":
                    let date2 = new Date();
                    next_order_date   = setDateFormat(date2,21);
                    update_query = `UPDATE order_details SET subscribed_orders_count = 1, next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
                    break;
                    case "28":
                    let date3 = new Date();
                    next_order_date   = setDateFormat(date3,28);
                    update_query = `UPDATE order_details SET subscribed_orders_count = 1, next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
                    break;
                }

                arr_temp[item.order_number] = {};
                arr_temp[item.order_number]["customer"] = {
                    id: item.customer_id,
                };
                arr_temp[item.order_number]["line_items"] = [];
                arr_temp[item.order_number]["line_items"].push({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                });
                } 
                else {
                    switch (item.selling_plan){
                        case "7":
                        let date = new Date();
                        next_order_date   = setDateFormat(date,14);
                        update_query = `UPDATE order_details SET subscribed_orders_count = 1, next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
                        break;
                        case "14":
                        let date1 = new Date();
                        next_order_date   = setDateFormat(date1,14);
                        update_query = `UPDATE order_details SET subscribed_orders_count = 1, next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
                        break;
                        case "21":
                        let date2 = new Date();
                        next_order_date   = setDateFormat(date2,21);
                        update_query = `UPDATE order_details SET subscribed_orders_count = 1, next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
                        break;
                        case "28":
                        let date3 = new Date();
                        next_order_date   = setDateFormat(date3,28);
                        update_query = `UPDATE order_details SET subscribed_orders_count = 1, next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
                        break;
                    }
                    arr_temp[item.order_number]["line_items"].push({
                        variant_id: item.variant_id,
                        quantity: item.quantity,
                    });
                }
            });
            for (let [key, value] of Object.entries(arr_temp)) {
                function update_order_details(){
                connection.query(update_query, function (error, result) {
                    if (error) return callback(error);
                    else {
                        console.log("Count Updated");
                    }
                    });
                }
                const asset_credentials = {
                method: "POST",
                url: "https://marvalmix.myshopify.com/admin/api/2021-07/orders.json",
                headers: {
                    "X-Shopify-Access-Token": "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",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order: value,
                })
                };
                console.log(update_query);

                //order_update();
                // request(asset_credentials, function (error, response) {
                //   if (error) throw new Error(error);
                //   else {
                //     console.log("order created");
                //     update_order_details();
                //   }
                // });
            }
            
            }
        });
    }
}