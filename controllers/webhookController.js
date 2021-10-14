const rawbody = require('raw-body');

const ShopifyWebHookHelper = require('../models/shopifyWebhookHelper');

exports.webhookResponse = async (req, res, next) => {
    const body = await rawbody(req);
    const jsonObj = body.toString();
    const webhookHelper = new ShopifyWebHookHelper();
   
    try{
        webhookHelper.getWebhookResponse(jsonObj);
        return res.end('{"success"}');
    }catch (err) {
        return res.end('{"error"}');
    }
}
