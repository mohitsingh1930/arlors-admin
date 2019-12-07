const mysql = require('mysql')

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE
})


function queryProcessSchemaGet(query) {
  return new Promise((resolve, reject) => {
    db.query(query, (err, result) =>{
      if(err) {
        console.log(err);
        resolve(-1)
      }
      // else if(result.length == 0) {
      //   resolve(0);
      // }
      else resolve(result);
    })
  })
}

function queryProcessSchemaPut(query) {
  return new Promise((resolve, reject) => {
    db.query(query, (err, result) =>{
      if(err) {
        console.log(err);
        resolve(-1)
      }
      else resolve({status: 1, result: result});
    })
  })
}

function ObjToString(object) {

  var string = "";

  for(let i in object) {
    string += `'${object[i]}'` + ', '
  }

  return string.slice(0, string.length-2);

}


module.exports.findUser = async (number) => {

  return await queryProcessSchema(`select id from users where number='${number}`, resolve, reject);

}


module.exports.pushInOrders = async (details) => {

  return await queryProcessSchemaPut(`insert into orders (id, customer_name, customer_contact, customer_address, status, original_price, discounted_price, promotor_ref, promotor_ref_share, promotor_ref_amount) 
  values(${ObjToString(details)})`)

} 


module.exports.getOrders = async (status) => {

  return await queryProcessSchemaGet(`select * from orders where status='${status}'`)

}


module.exports.changeOrderStatus = async (id, status) => {

  return await queryProcessSchemaPut(`update orders set status='${status}', ${status}_date=CURRENT_TIMESTAMP where id='${id}'`)
}


module.exports.pushInOrders_cart = async (details) => {
  
  return await queryProcessSchemaPut(`insert into orders_cart (order_id, product_id, product_seq, tailor_id, status) values(${ObjToString(details)})`)
}


module.exports.getCart = async (id) => {

  return await queryProcessSchemaGet(`select t1.*, products.name as product_name from (select cart.*, tailors.name as tailor_name from orders_cart cart, tailors where tailors.id=cart.tailor_id and cart.order_id='${id}') t1, products where t1.product_id=products.id order by product_id asc, product_seq asc`)
}


module.exports.getProductsList = async () => {
  return await queryProcessSchemaGet(`select * from products`);
}



module.exports.getTailorsList = async () => {
  return await queryProcessSchemaGet(`select id, name from tailors`)
}


module.exports.getTotalOrders = async () => {
  return await queryProcessSchemaGet(`select count(*) as total from orders`)
}


module.exports.getTailorPendingOrders = async (id) => {
  return await queryProcessSchemaGet(`select count(*) as pending from orders_cart where tailor_id=${id} and status='pending'`);
}

module.exports.getTailorProcessingOrders = async (id) => {
  return await queryProcessSchemaGet(`select count(*) as processing from orders_cart where tailor_id=${id} and status='processing'`)
}


module.exports.getPriceOf = async (id) => {
  return await queryProcessSchemaGet(`select original_price, discounted_price from products where id=${id}`)
}