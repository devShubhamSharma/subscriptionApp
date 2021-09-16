const dotenv = require('dotenv');
const nonce = require('nonce')();
const request = require("request-promise");

const DBConnection = require('../handlers/dbConnection');
const connection = new DBConnection();

dotenv.config();

const ShopifyClient = require('../models/shopifyClient');
const ShopifyAssetHelper = require('../models/shopifyAssetHelper');

const API_KEY = process.env.SHOPIFY_API_KEY;
const API_SECRET_KEY = process.env.SHOPIFY_API_SECRET;
const SCOPES = process.env.SCOPES.split(",");
const HOST_NAME = process.env.HOST;
/*controller action for install the app on the client store*/
exports.appInstall = (req, res, next) => {
    const shop_name = req.query.shop;
    const shopState = nonce();    
    if(shop_name){
        const install_url = "https://"+shop_name+
                            "/admin/oauth/authorize?client_id="+API_KEY+
                            "&scope="+SCOPES+"&redirect_uri="+HOST_NAME+"/site/callback"+
                            "&state="+shopState;
        res.redirect(install_url);
    }else{
        console.log("Something went Wrong");
    }
}
exports.getToken = (req,response,next) => {
    const {shop, code} = req.query;
    const accessTokenRequestUrl = 'https://'+shop+'/admin/oauth/access_token';
    const accessTokenPayload = {
        client_id: API_KEY,
        client_secret: API_SECRET_KEY,
        code: code
    };
    const clientHelper = new ShopifyClient();
    clientHelper
    .getToken(accessTokenRequestUrl,accessTokenPayload)
    .then(res => {
        clientHelper.saveToken(res.access_token, shop);
            if(res.access_token){
                response.render('shop/dashboard',{
                    token : res.access_token,
                    shop_name : shop
                });
            }
    });
}

exports.getThemes = (req,res,next) => {
    var access_token;
    var shop_name;
    const AssetHelper = new ShopifyAssetHelper();
    if(req.path === '/install/assets'){
        access_token = req.body.client_shop_token;
        shop_name = req.body.client_shop_name;
        const url = "https://"+shop_name+'/admin/api/2021-07/themes.json';
        AssetHelper.getshopThemes(url,access_token,shop_name);
    }
    return res.json({"success" : AssetHelper, "status" : 200});
}

exports.createOrder = (req,res,next)=>{
    var date = new Date();
    var dateFormat = date.getFullYear()+'-'+ (date.getMonth() + 1) +'-'+date.getDate();
    const arr_temp = [];
    const sql = "SELECT * FROM order_details WHERE next_order_date=" + connection.escape(dateFormat) + " AND subscription_status = 1"; 
    connection.query(sql, function(error, result, fields){
            if(error) return callback(error);
            else{
                result.forEach((item,index) => {
                        if(!arr_temp[item.order_number]){
                            arr_temp[item.order_number]={};
                            arr_temp[item.order_number]['customer']={
                                "id": item.customer_id
                            };
                            arr_temp[item.order_number]["line_items"]=[];
                            arr_temp[item.order_number]["line_items"].push({
                                "variant_id": item.variant_id,
                                "quantity": item.quantity
                           });
                        }else{
                            arr_temp[item.order_number]["line_items"].push({
                                "variant_id": item.variant_id,
                                "quantity": item.quantity
                           });
                        }
                });
                // for (let [key, value] of Object.entries(arr_temp)) { 
                //         const asset_credentials = {
                //             method: "POST",
                //             url: "https://laurens-fam.myshopify.com/admin/api/2021-07/orders.json",
                //             headers: {
                //               "X-Shopify-Access-Token": "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",
                //               "Content-Type": "application/json",
                //             },
                //             body: JSON.stringify({
                //                 "order": value
                //             }),
                //           };
                //           request(asset_credentials, function (error, response) {
                //             if (error) throw new Error(error);
                //             else {
                //                 console.log("order created");
                //             }
                //     });    
                // }
            }
    });
}