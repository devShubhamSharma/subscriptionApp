const dotenv = require('dotenv');
const request = require('request-promise');
const nonce = require('nonce')();
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
        res.send("<h1></h1>");
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
                response.render('dashboard',{
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
    if(req.path === '/uninstall'){
        access_token = req.body.client_shop_token;
        shop_name = req.body.client_shop_name;
        const url = "https://"+shop_name+'/admin/api/2021-07/themes.json';
        
        AssetHelper.getThemes(url,access_token,shop_name);
    }

    

    
    return res.end('{"success" : '+ +', "status" : 200}');
}