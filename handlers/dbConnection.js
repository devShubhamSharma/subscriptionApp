var mysql = require('mysql');
module.exports = class DBConnection{
constructor(){
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: '',
        database: 'Subscription_Client'
      });
      return connection;
}
}