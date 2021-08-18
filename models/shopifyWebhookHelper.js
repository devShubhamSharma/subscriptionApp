const file = require("fs");
const path = require('path');
var rootDir = require('../utils/path');

const DBConnection = require('../handlers/dbConnection');

const connection = new DBConnection();

const webhook_path = path.join(
    rootDir,
    "order_logs",
    "log.json"
    );

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
                var date = new Date(order_date);
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
                    "product_title" : line_item.name,
                    "variant_title": line_item.variant_title,
                    "selling_plan": prop.value,
                    "order_created": data.created_at,
                    "next_order_date": next_date,
                    "variant_id": line_item.variant_id,
                    "quantity": line_item.quantity
            });
            });
        });
        console.log(order_array);
        this.prepareCustomerArray(webhook_response);
        this.insertOrderData(order_array);
    }

    setDateFormat(date,day){
        var temp_date = date.setDate(date.getDate() + day);
        let new_date = new Date(temp_date);
        return new_date;
    }

    insertOrderData(order_array){
        order_array.forEach(item => {
            if(item.customer_id && item.order_id){
                const selectQuery = 'SELECT * FROM order_details WHERE line_items_id ='+item.line_items_id + 'AND customer_id =' +item.customer_id;
                const query = `INSERT INTO order_details (order_id,customer_id,line_items_id,product_title,variant_title,	selling_plan,order_created,next_order_date,	variant_id,quantity) VALUES (?);`;
                let values = [item.order_id,item.customer_id, item.line_items_id,item.product_title, item.variant_title,item.selling_plan,item.order_created,item.next_order_date,item.variant_id,item.quantity];
                connection.query(selectQuery, (err, rows) => {
                    if (typeof rows == 'undefined') {
                        connection.query(query, [values], (err, rows) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Order Created with id = " + rows.insertId);
                                //file.appendFileSync(webhook_path, JSON.stringify(order_array));
                                console.log("log created");
                            }
                        });
                    } else {
                        console.log('Already Inerted');
                    }
                });
        }
        });
    }

    prepareCustomerArray(webhook_response){
        console.log(webhook_response);
        var data = JSON.parse(webhook_response);
        const customer_array = [];
        
        customer_array.push({
            'customer_id' : data.customer.id,
            'customer_email' : data.customer.email,
            'first_name' : data.customer.first_name,
            'last_name' : data.customer.last_name,
            'customer_phone' : data.customer.phone
        });
        console.log(customer_array);
        this.saveCustomerData(customer_array);
    }

    saveCustomerData(customer_array){
        customer_array.forEach(item => {
            const selectQuery = 'SELECT * FROM customer_details WHERE customer_id =' +item.customer_id;
            const query = `INSERT INTO customer_details (customer_id,customer_email,customer_phone,	first_name,last_name) VALUES (?);`;
            let values = [item.customer_id,item.customer_email, item.customer_phone, item.first_name,item.last_name];
            connection.query(selectQuery, (err, rows) => {
                if (rows.length == 0 || typeof rows == 'undefined') {
                    connection.query(query, [values], (err, rows) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Customer Created with id = " + rows.insertId);
                        }
                    });
                } else {
                    console.log('Customer Exist');
                }
            });
        });
    }   
}