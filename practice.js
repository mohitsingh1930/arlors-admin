const mysql = require('mysql')

const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'ODBC',
  password: '',
  database: 'testdb'
})


function ObjToString(object) {

  var string = "";

  for(let i in object) {
    string +=  (typeof object[i] == 'string')?`'${object[i]}'`:object[i];
    string +=  ', '
  }

  return string.slice(0, string.length-2);

}


function contactDatabase() {
  new Promise((resolve, reject) => {
    dbConnection.query(`select * from practice limit 1`,
      (err,result) => {
        if(err) {
          console.log(err);
          resolve(-1)
        } else {
          return(result);
          var date = new Date(result[0].noupdate)
          console.log(date);
        }
    })
  })
}

var obj = [{name: 'mohit', age: 19}, {name: 'rohit', age:24}]

// for(let prop of obj) {
//   console.log(prop)
// }

function act(callback) {
  callback();
}

function main(details) {
  var sendString = ""
  for(let detail in details) {
    sendString += `${detail}=${details[`${detail}`]}&`
  }
  console.log(sendString.substr(0, sendString.length-1))
}

main({id: '1', status:'pending'})