const mysql = require("mysql");
const chalk = require('chalk');
require('dotenv').config();

const connection = mysql.createConnection(
  {
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password:  process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  }
);

//Show DB connection status
connection.connect((err) => {
    if (err) {
        console.log(chalk.white.bgRed(err));
        return;
    }
    // console.log(chalk.green(`\nConnected to db. ThreadID: ${connection.threadId}`));
})

module.exports = connection;
