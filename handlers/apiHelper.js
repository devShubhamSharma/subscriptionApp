const request = require("request-promise");

var endpoint;
var method;
var headers;
var body;

module.exports = class APIHelper{

    constructor(shop_data){
       endpoint = shop_data.url;
       method = shop_data.method;
       headers = shop_data.headers;
    }

    callShopifyAPI(){
        var shop_creden;
        if(body!= undefined){
            shop_creden = {
                method,
                endpoint,
                headers,
                body
            };
        }else{
            shop_creden = {
                method,
                endpoint,
                headers,
            };
        }
        return new Promise((resolve,reject)=>{
            request.post(shop_creden, (err,res,body) => {
              if (err) reject(err)
              resolve(body);
            });
        });
    }

}