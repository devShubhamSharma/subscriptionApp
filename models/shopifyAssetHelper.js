const request = require("request-promise");
const file = require("fs");

const ShopifyAPIHelper = require('../handlers/apiHelper');

module.exports = class ShopifyAssetHelper {
  
  getshopThemes(url, access_token, shop_name) {
    const shop_creden = {
      method: "GET",
      url: url,
      headers: {
        "X-Shopify-Access-Token": access_token,
      },
    };
    request(shop_creden, (error, response) => {
      if (error) throw new Error(error);
      var api_respond = response.body;
      this.getThemeIDHelpers(api_respond, access_token, shop_name);
    });
  }

  getThemeIDHelpers(api_respond, access_token, shop_name) {
    var theme_data = JSON.parse(api_respond).themes;
    theme_data.forEach((theme) => {
      if (theme.role === "main") {
        const theme_id = theme.id;
        this.snippetInjectionBlock(theme_id, access_token, shop_name);
      }
    });
  }

  snippetInjectionBlock(theme_id, access_token, shop_name) {
    const url ="https://" +shop_name +"/admin/api/2021-04/themes/" +theme_id +"/assets.json";
    const html = `<div class="ced_subscription--widget">
                    <label for="1week" class="ced_subscription_option">
                      <input type="radio" id="1week" name="properties[selling_plan]" value="1 week">
                      <span>1 Week</span>
                    </label>
                    <label for="2week" class="ced_subscription_option">
                    <input type="radio" id="2week" name="properties[selling_plan]" value="2 week">
                      <span >2 Week</span>
                    </label>
                    <label for="3week" class="ced_subscription_option">
                    <input type="radio" id="3week" name="properties[selling_plan]" value="3 week">
                      <span>3 Week</span>
                    </label>
                    <label for="4week" class="ced_subscription_option">
                      <input type="radio" id="4week" name="properties[selling_plan]" value="4 week">
                      <span>4 Week</span>  
                    </label> 
                  </div>
                  <style>
                        label.ced_subscription_option {
                          display: flex;
                          align-items: center;
                          position: relative;
                          border: 1px solid #ddd;
                          margin-bottom: 10px;
                          padding-left: 10px;
                          transition: 100ms all linear;
                        }
                        label.ced_subscription_option:hover {
                          background-color: rgb(218 255 219);
                        }
                        label.ced_subscription_option input {
                          opacity: 0;
                          visibility: hidden;
                          height: 0;
                          width: 0;
                        }
                        .ced_subscription_option span {
                          display: inline-block;
                          }
                          label.ced_subscription_option input + span:after {
                            content: "";
                            position: absolute;
                            right: 10px;
                            height: 20px;
                            width: 20px;
                            background-color: rgb(20 154 20);
                            border-radius: 50px;
                            opacity: 0;
                            visibility: hidden;
                            top: 12px;
                        }
                        label.ced_subscription_option input:checked + span:after {
                          opacity:1;
                          visibility:visible;
                        }
                  </style>`;
    const asset_credentials = {
      method: "PUT",
      url: url,
      headers: {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset: {
          key: "snippets/test-api.liquid",
          value: html
        },
      }),
    };
    request(asset_credentials, function (error, response) {
      if (error) throw new Error(error);
      else {
        const url =
          "https://"+shop_name+"/admin/api/2021-04/themes/"+theme_id+
          "/assets.json?asset[key]=sections/product-template.liquid";
        const asset_credentials = {
          method: "GET",
          url: url,
          headers: {
            "X-Shopify-Access-Token": access_token,
            "Content-Type": "application/json",
          },
        };
        request(asset_credentials, function (error, response) {
          if (error) throw new Error(error);
          else {
            var response = JSON.parse(response.body);
            var asset = response.asset;
            file.writeFile("product1.liquid", asset.value, function (err) {
              if (err) {
                return console.log(err);
              } else {
                console.log("Product Liquid Added");
                var productData;
                try {
                    productData = file.readFileSync("product.liquid", "utf8");
                    //console.log(productData);
                } catch (err) {
                  console.error(err);
                }
                const endpoint = "https://"+shop_name+"/admin/api/2021-04/themes/"+theme_id+"/assets.json";
                const update_asset = {
                  method: "PUT",
                  url: endpoint,
                  headers: {
                    "X-Shopify-Access-Token": access_token,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    asset: {
                      key: "sections/product-template.liquid",
                      value: productData
                    },
                  })
                };
                request(update_asset, (error, response) => {
                  if (error) throw new Error(error);
                  else{
                    // order create webhook block
                    const webhook_url = "https://"+shop_name+"/admin/api/2021-07/webhooks.json";
                    const webhook_data = {
                      method: "POST",
                      url: webhook_url,
                      headers: {
                        "X-Shopify-Access-Token": access_token,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                          "webhook": {
                            "topic": "orders/create",
                            "address": "https://d573221ad530.ngrok.io/orders/webhook",
                            "format": "json"
                          }
                      })
                    };
                    request(webhook_data, (error, response) => {
                      if (error) throw new Error(error);
                      var api_respond = response.body;
                      console.log(JSON.parse(api_respond));
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
};
