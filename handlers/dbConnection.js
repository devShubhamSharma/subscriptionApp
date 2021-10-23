var mysql = require('mysql');

module.exports = class DBConnection{
constructor(){
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: '',
        database: 'SubscriptionClient'
      });
      return connection;
}
}