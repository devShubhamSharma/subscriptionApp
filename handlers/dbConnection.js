var mysql = require('mysql');
module.exports = class DBConnection{
constructor(){
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: 'cedcom@2021$',
        database: 'SubscriptionClient'
      });
      return connection;
}
}