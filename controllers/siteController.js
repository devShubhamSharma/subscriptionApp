const dotenv = require("dotenv");
const nonce = require("nonce")();
const request = require("request-promise");
var express = require('express');

var app = express();
const DBConnection = require("../handlers/dbConnection");
const connection = new DBConnection();

dotenv.config();

const ShopifyClient = require("../models/shopifyClient");
const ShopifyOrders = require("../models/shopifyCreateOrders");


const API_KEY = process.env.SHOPIFY_API_KEY;
const API_SECRET_KEY = process.env.SHOPIFY_API_SECRET;
const SCOPES = process.env.SCOPES.split(",");
const HOST_NAME = process.env.HOST;

/*controller action for install the app on the client store*/
exports.appInstall = (req, res) => {
  const shop_name = req.query.shop;
  const shopState = nonce();
  if (shop_name) {
    const install_url = "https://" + shop_name + "/admin/oauth/authorize?client_id=" + API_KEY + "&scope=" + SCOPES + "&redirect_uri=" + HOST_NAME + "/site/callback" + "&state=" + shopState;
    res.redirect(install_url);
  }else {
     res.render('shop/modal',{
        message: "something went wrong"
     });
  }
};
/*controller action for install the app on the client store*/

/* function for getting shop token*/
exports.getToken = (req, respond) => {
  const { shop, code } = req.query;
  const accessTokenRequestUrl = "https://" + shop + "/admin/oauth/access_token";
  const accessTokenPayload = {
    client_id: API_KEY,
    client_secret: API_SECRET_KEY,
    code: code,
  };
  
  const clientHelper = new ShopifyClient();
  clientHelper
  .getToken(accessTokenRequestUrl, accessTokenPayload)
  .then((res) => {
    clientHelper.saveToken(res.access_token, shop);
    if (res.access_token) {
      // order create webhook block
      const getWebhook_url = `https://${shop}/admin/api/2021-10/webhooks.json`;
      const postWebhook_url = `${HOST_NAME}/admin/api/2021-10/webhooks.json`;
      console.log(getWebhook_url);
      console.log(postWebhook_url);
      const get_webhook = {
        method: "GET",
        url: getWebhook_url,
        headers: {
          "X-Shopify-Access-Token": res.access_token,
          "Content-Type": "application/json",
        }
      }
      request(get_webhook, (error, response) => {
        if (error) throw new Error(error);
        var api_respond = JSON.parse(response.body);
        console.log(api_respond);
        if(api_respond.webhooks==''){
          const webhook_data = {
            method: "POST",
            url: getWebhook_url,
            headers: {
              "X-Shopify-Access-Token": res.access_token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              "webhook": {
                "topic": "orders/create",
                "address": HOST_NAME+"/orders/webhook",
                "format": "json"
              }
            })
          };
          request(webhook_data, (error, response) => {
            if (error) throw new Error(error);
            var api_respond = response.body;
            console.log(api_respond)
          });
        }else{
          return false;
        }
      });
      
      const nextSkip = typeof req.query.nextdata == "undefined" ? 0 : req.query.nextdata;
      const limit = 8;
      var orderArr = [];
      var arr_temp = [];
      var pageCount;
      var totalCount = 0;
      //const selectQuery = "SELECT COUNT(id) AS id_count FROM order_details";
      const sql = "SELECT * FROM `order_details`";
      const distinctQuery = "SELECT DISTINCT order_number,total_price,customer_fullname,selling_plan,order_created,next_order_date,subscription_status FROM order_details";
      // connection.query(selectQuery, (err, rows) => {
      //   if (err) {
      //     throw err;
      //   } else {
      //     totalCount = rows;
      //   }
      // });
      connection.query(distinctQuery, (err, rows) => {
        if (err) {
          throw err;
        } else {
          if (rows.length != 0) {
            rows.forEach((item) => {
              var weekDays;
              switch (item.selling_plan) {
                case "7":
                weekDays = "1 Week";
                break;
                case "14":
                weekDays = "2 Week";
                break;
                case "21":
                weekDays = "3 Week";
                break;
                case "28":
                weekDays = "4 Week";
                break;
              }
              var subscription_status = item.subscription_status == 1 ? "Active" : "Inactive";
              var cancel_btn = item.subscription_status == 1 ? "Cancel" : "Canceled";
              let temp_date = new Date(item.order_created);
              let order_date = temp_date.toString().split("GMT")[0];
              let temp_next_date = new Date(item.next_order_date);
              let next_date = temp_next_date.toString().split("GMT")[0];
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
            //pageCount = Math.ceil(totalCount[0].id_count / limit);
          } else {
            orderArr = "No Subscription Found";
          }
        }
      //   orderArr.forEach((item, index) => {
      //     if (!arr_temp[item.OrderNumber]) {
      //         arr_temp[item.OrderNumber] = {};
      //         arr_temp[item.OrderNumber]["customer"] = {
      //             name: item.Customer,
      //         };
      //         arr_temp[item.OrderNumber]["line_items"] = [];
      //         arr_temp[item.OrderNumber]["line_items"].push({
      //             selling_plan : item.SellingPlan,
      //             date: item.Date,
      //             nextDate:  item.NextDate,
      //             quantity: item.Items,
      //             status : item.Status
      //         });
      //     } 
      //     else {
      //         arr_temp[item.OrderNumber]["line_items"].push({
      //           selling_plan : item.SellingPlan,
      //           date: item.Date,
      //           nextDate:  item.NextDate,
      //           quantity: item.Items,
      //           status : item.Status
      //         });
      //     }
      // });
        respond.render("shop/subscribedOrders", {
          OrderData: orderArr,
          pageCount: pageCount
        });
      });
    }
  });
};

/* function for getting shop token*/
exports.createOrder = (req, res, next) => {
  ShopifyOrders.CreateSubscibedOrders()
  .then(response => {
    if(response == true){
      res.send("Order successfully created");
    }else{
      res.send("Something went wrong");
    }
  });
}
