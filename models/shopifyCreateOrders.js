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

function prepareNextOrderDate(key,plans){
    var selling_plan = plans.selling_plan;
    //console.log(key+"  "+selling_plan);
    var update_query,next_order_date;
    switch (selling_plan){
        case "7":
        let date = new Date();
        next_order_date   = setDateFormat(date,7);
        break;
        case "14":
        let date1 = new Date();
        next_order_date   = setDateFormat(date1,14);
        break;
        case "21":
        let date2 = new Date();
        next_order_date   = setDateFormat(date2,21);
        break;
        case "28":
        let date3 = new Date();
        next_order_date   = setDateFormat(date3,28);
        break;
    }
    update_query = `UPDATE order_details SET next_order_date = "${next_order_date}" WHERE order_number="${key}"`;
    return update_query;
}

function prepareUpdateQuery(arr_temp){
    for (let [key, value] of Object.entries(arr_temp)) {
        var plans = value.update_plan;
        delete (value.update_plan);    
        var asset_credentials = {
        method: "POST",
        url: "https://laurens-fam.myshopify.com/admin/api/2021-10/orders.json",
        headers: {
            "X-Shopify-Access-Token": "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",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            order: value,
        })
        };
       
        try{
             var updateQuery = prepareNextOrderDate(key,plans);
             callShopifyOrderAPI(asset_credentials,updateQuery);
             
        }catch(Exception){
            var message = Exception;
        }
    }
    return true;
}

 function callShopifyOrderAPI(asset_credentials,updateQuery){
    request(asset_credentials, function (error, response) {
        if (error) throw new Error("API Limit Exceeded");
        else {
            if(response.statusCode === 201){
                connection.query(updateQuery, function (error, result) {
                    if (error) {
                        return error;
                    } 
                    else {
                       return result;
                    }
                });
            }
        }
    });
 }

var createOrders = function() {
    var response; 
    var date = new Date();
    var dateFormat = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    const arr_temp = [];
    var sql = "SELECT * FROM order_details WHERE next_order_date="+connection.escape(dateFormat)+"AND subscription_status = 1";    
    //const distinctQuery = "SELECT DISTINCT order_number FROM order_details WHERE next_order_date="+connection.escape(dateFormat)+"AND subscription_status = 1 AND subscribed_orders_count >= 1";
    return new Promise(function(resolve,reject){
        connection.query(sql, function (error, result) {
            if (error) {
                console.log(error);
                return error;
            }
            else {
            var updateQuery;
            result.forEach((item, index) => {
                if (!arr_temp[item.order_number]){
                    // updateQuery = prepareNextOrderDate(item);
                    arr_temp[item.order_number] = {};
                    arr_temp[item.order_number]["customer"] = {
                        id: item.customer_id,
                    };
                    //arr_temp[item.order_number]["count"] = item.subscribed_orders_count;
                    arr_temp[item.order_number]["update_plan"] = {
                        "selling_plan" : item.selling_plan
                    };
                    arr_temp[item.order_number]["line_items"] = [];
                    arr_temp[item.order_number]["line_items"].push({
                        variant_id: item.variant_id,
                        quantity: item.quantity,
                    });
                } 
                else {
                    // updateQuery = prepareNextOrderDate(item);
                    arr_temp[item.order_number]["selling_plan"] = item.selling_plan;
                    arr_temp[item.order_number]["line_items"].push({
                        variant_id: item.variant_id,
                        quantity: item.quantity
                    });
                }
            });
            response = prepareUpdateQuery(arr_temp),2000;
            resolve(response);
            }
        });
    });
}

module.exports = {
    CreateSubscibedOrders : createOrders
}
