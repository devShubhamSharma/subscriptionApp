const request = require('request-promise');
const DBConnection = require('../handlers/dbConnection');

const connection = new DBConnection();

module.exports = class ShopifyClient{
     getToken(accessTokenRequestUrl, accessTokenPayload){
      return new Promise((resolve,reject)=>{
        request.post(accessTokenRequestUrl, {json: accessTokenPayload}, (err,res,body)=>{
          if (err) reject(err)
          resolve(body);
        });
      });
    }

    saveToken(token, shop){
      connection.connect((err) => {
        const shop_credentials = { 
          shop_name: shop, 
          access_token: token,
          installed : 1
        };
        /*if token are alredy in db and same match from current_token*/
        connection.query('SELECT access_token, shop_name FROM subscription_client WHERE shop_name = "'+shop_credentials.shop_name+'"', (err,rows,field) => {
          if(err) throw err;
          if(rows[0] != undefined)
          {
            if(shop_credentials.shop_name  === rows[0].shop_name && rows[0].access_token === shop_credentials.access_token){
              var client_shop_token = rows[0].access_token;
            }
            else if(rows[0].shop_name === shop_credentials.shop_name && rows[0].access_token != shop_credentials.access_token){
              connection.query(
                'UPDATE subscription_client SET access_token = ? Where shop_name = ?',
                [shop, shop_credentials.access_token],
                (err, result) => {
                  if (err) throw err;
                  var client_shop_token = rows[0].access_token;
                }
              );
            }
          }
          else{
            connection.query('INSERT INTO subscription_client SET ?', shop_credentials, 
              (err, res) => {
                if(err) throw err;
                var client_shop_token = res.access_token;
            });
          }
        });
      });
    }

    getSubscribedOrders(){
      switch (item.selling_plan){
          case "7":
          let date = new Date();
          next_order_date   = setDateFormat(date,14);
          update_query = `UPDATE order_details SET subscribed_orders_count = "${item.subscribed_orders_count-1}", next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
          break;
          case "14":
          let date1 = new Date();
          next_order_date   = setDateFormat(date1,14);
          update_query = `UPDATE order_details SET subscribed_orders_count = "${item.subscribed_orders_count-1}", next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
          break;
          case "21":
          let date2 = new Date();
          next_order_date   = setDateFormat(date2,21);
          update_query = `UPDATE order_details SET subscribed_orders_count = "${item.subscribed_orders_count-1}", next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
          break;
          case "28":
          let date3 = new Date();
          next_order_date   = setDateFormat(date3,28);
          update_query = `UPDATE order_details SET subscribed_orders_count = "${item.subscribed_orders_count-1}", next_order_date = "${next_order_date}" WHERE order_number="${item.order_number}"`;
          break;
      }
    }
}