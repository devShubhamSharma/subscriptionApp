const file = require("fs");
const rawbody = require('raw-body');
const path = require('path');
var rootDir = require('../utils/path');

const ShopifyWebHookHelper = require('../models/shopifyWebhookHelper');

const webhook_path = path.join(
    rootDir,
    "order_logs",
    "log.json"
    );


exports.webhookResponse = async (req, res, next) => {
    const body = await rawbody(req);
    const jsonObj = body.toString();
    const webhookHelper = new ShopifyWebHookHelper();
   
    try{
        // file.appendFileSync(webhook_path, jsonObj);
        // console.log('log created'+"\n");
        webhookHelper.getWebhookResponse(jsonObj);
        return res.end('{"success"}');
    }catch (err) {
        console.error(err);
    }
}
