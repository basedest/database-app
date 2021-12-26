var mysql = require('mysql');
//connecting to database
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password'
});
module.exports = con;
