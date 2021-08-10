const DBConnection = require('../handlers/dbConnection');

const connection = new DBConnection();

module.exports = class ShopifyWebhookHelper {

    getWebhookResponse(webhook_response){
        var data = JSON.parse(webhook_response);
        var line_items = data.line_items;
        let selling_plan;
        let selling_value;
        line_items.forEach( item => {
            item.properties.forEach(items => {
                selling_plan = items.name;
                selling_value = items.value;
            });
        });
        if(selling_plan && selling_value != undefined){
            this.getOrderData(webhook_response);
        }
    }

    getOrderData(webhook_response){
        var data = JSON.parse(webhook_response);
        const order_array = [];
        data.line_items.forEach(line_item =>{
            line_item.properties.forEach(prop => {
                var order_date = data.created_at;
                let date = new Date(order_date);
                var next_date;
                switch(prop.value){
                    case '1 week':
                        next_date = this.setDateFormat(date,7);
                        break;
                    case '2 week':
                        next_date = this.setDateFormat(date,14);
                        break;
                    case '3 week':
                        next_date = this.setDateFormat(date,21);
                        break;
                    case '4 week':
                        next_date = this.setDateFormat(date,28);
                        break;
                }

                order_array.push({
                    "customer_id" : data.customer.id,
                    "order_id": data.id,
                    "line_items_id": line_item.id,
                    "variant_title": line_item.variant_title,
                    "selling_plan": prop.value,
                    "order_created": data.created_at,
                    "next_order_date": next_date,
                    "variant_id": line_item.variant_id,
                    "quantity": line_item.quantity
            });
            });
        });
        this.insertOrderData(order_array);
    }

    setDateFormat(date,day){
        var temp_date = date.setDate(date.getDate() + day);
        let new_date = new Date(temp_date);
        var custom_date = new_date.getFullYear()+ "-" + new_date.getMonth() +"-"+ new_date.getDate();
        return custom_date;
    }

    insertOrderData(order_array){
        order_array.forEach(item => {
            if(item.customer_id && item.order_id && item.line_items_id){
                const query = `INSERT INTO order_details (order_id,customer_id,line_items_id,variant_title,	selling_plan,order_created,next_order_date,	variant_id,quantity) VALUES (?);`;
                // let values = [item.order_id,item.customer_id, item.line_items_id, item.variant_title,item.selling_plan,item.order_created,item.next_order_date,item.variant_id,item.quantity];
                
                // connection.query(query,[values], 
                //     (err, rows) => {
                //     if (err) throw err;
                //     console.log("Row inserted with id = "+ rows.insertId);});
            }
        });
    }
}