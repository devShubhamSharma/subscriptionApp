const request = require("request-promise");
const file = require("fs");

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
          value: `
                <div class="ced_subscription--widget">
                    <input type="radio" id="1week" name="properties[selling_plan]" value="1 week">
                      <label for="1 week">1 Week</label><br>
                    <input type="radio" id="2week" name="properties[selling_plan]" value="2 week">
                      <label for="2 Week">2 Week</label><br>
                    <input type="radio" id="3week" name="properties[selling_plan]" value="3 week">
                      <label for="3 week">3 Week</label><br>
                    <input type="radio" id="4week" name="properties[selling_plan]" value="4 week">
                      <label for="4 week">4 Week</label>   
                </div>
                `,
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
            //console.log(asset.value);
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
                console.log(update_asset);
                request(update_asset, (error, response) => {
                  if (error) throw new Error(error);
                  console.log("Snippet are added");
                  var res = JSON.parse(response.body);
                  console.log(res);
                });
              }
            });
          }
        });
      }
    });
  }
};
