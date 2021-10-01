const dotenv = require("dotenv");
const nonce = require("nonce")();
const request = require("request-promise");

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

exports.appInstall = (req, res, next) => {
  const shop_name = req.query.shop;
  const shopState = nonce();
  if (shop_name) {
    const install_url = "https://" + shop_name + "/admin/oauth/authorize?client_id=" + API_KEY + "&scope=" + SCOPES + "&redirect_uri=" + HOST_NAME + "/site/callback" + "&state=" + shopState;
    res.redirect(install_url);
  }else {
    console.log("Something went Wrong");
  }
};

exports.getToken = (req, response, next) => {
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
          const webhook_url = "https://"+shop+"/admin/api/2021-07/webhooks.json";
          const get_webhook = {
            method: "GET",
            url: webhook_url,
            headers: {
              "X-Shopify-Access-Token": res.access_token,
              "Content-Type": "application/json",
            }
          }
          request(get_webhook, (error, response) => {
            if (error) throw new Error(error);
            var api_respond = JSON.parse(response.body);
            if(api_respond.webhooks==''){
              const webhook_data = {
                method: "POST",
                url: webhook_url,
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
              });
            }else{
              return false;
            }
          });

        const nextSkip = typeof req.query.nextdata == "undefined" ? 0 : req.query.nextdata;
        const limit = 4;
        var orderArr = [];
        var pageCount;
        var totalCount = 0;
        const selectQuery = "SELECT COUNT(id) AS id_count FROM order_details";
        const sql =
          "SELECT * FROM `order_details` WHERE `id` >" +
          nextSkip +
          " LIMIT " +
          limit;
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
                var subscription_status =
                  item.subscription_status == 1 ? "Active" : "Inactive";
                let temp_date = new Date(item.order_created);
                let order_date = temp_date.toString().split("GMT")[0];
                let temp_next_date = new Date(item.next_order_date);
                let next_date = temp_next_date.toString().split("GMT")[0];
                orderArr.push({
                  id: item.id,
                  OrderNumber: item.order_number,
                  Date: order_date,
                  Customer: item.customer_fullname,
                  Total: item.total_price,
                  SellingPlan: weekDays,
                  Items: item.quantity,
                  NextDate: next_date,
                  Status: subscription_status,
                });
              });
              pageCount = Math.ceil(totalCount[0].id_count / limit);
            } else {
              orderArr = "No Subscription Found";
            }
          }
          response.render("shop/subscribedOrders", {
            OrderData: orderArr,
            pageCount: pageCount,
          });
        });
      }
    });
};

exports.createOrder = (req, res, next) => {  
  const createShopifyOrders = new ShopifyOrders();
  createShopifyOrders.createOrders();
  return true;  
}
