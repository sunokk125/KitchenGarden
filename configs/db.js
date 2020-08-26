require('dotenv').config();
var pgp = require('pg-promise')({});

var cn ={
  host:process.env.DB_HOST,
  port: process.env.PG_PORT,
  database: process.env.DB_NAME,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD
}

var db = pgp(cn);

module.exports = db;