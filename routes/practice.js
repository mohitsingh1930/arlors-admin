var express = require('express');
var router = express.Router();

const mysql = require('mysql')

const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'ODBC',
  password: '',
  database: 'testdb'
})

/* GET home page. */
router.get('/', function(req, res, next) {
  
  dbConnection.query(`select * from practice limit 1`,
  (err,result) => {
    if(err) {
      console.log(err);
    } else {
      console.log(result);
      
    }
  })

});


module.exports = router;
