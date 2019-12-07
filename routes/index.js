var express = require('express');
var router = express.Router();
var db = require('../db Functions/admin/admin')
var dateFns = require('date-fns')

/* GET home page. */
router.get('/', async function(req, res, next) {

  //getting pending orders
  var pending_orders = await db.getOrders('pending');

  //getting completed orders
  var completed_orders = await db.getOrders('completed')

  //getting delievered orders 
  var delievered_orders = await db.getOrders('delievered')

  
  //setting orders cart and date time
  for(let order of pending_orders) {
    order.cart = await db.getCart(order.id)
    order.date = dateFns.format(new Date(order.start_date), 'do, MMM')
    order.time = dateFns.format(new Date(order.start_date), 'h:mm a')
  }
  for(let order of completed_orders) {
    order.cart = await db.getCart(order.id)
    order.date = dateFns.format(new Date(order.start_date), 'do, MMM')
    order.time = dateFns.format(new Date(order.start_date), 'h:mm a')
  }
  for(let order of delievered_orders) {
    order.cart = await db.getCart(order.id)
    order.date = dateFns.format(new Date(order.start_date), 'do, MMM')
    order.time = dateFns.format(new Date(order.start_date), 'h:mm a')
  }


  console.log(pending_orders)
  // for(let item of pending_orders[0].cart) {
  //   console.log(item)
  // }

  res.render('admin', { 
    pending_orders: pending_orders, 
    completed_orders: completed_orders,
    delievered_orders: delievered_orders
  });
});


router.post('/newOrder', async (req, res) => {

  var order_details = {}

  //orderID as: date + order number in list
  console.log(await db.getTotalOrders())
  order_details.id = dateFns.format(new Date(), 'yyyyMMdd') + `${((await db.getTotalOrders())[0].total + 1)}`


  order_details.customer_name = req.body.name;
  order_details.customer_contact = req.body.contact;
  order_details.customer_address = req.body.address;
  order_details.products = req.body.products;
  order_details.quantity = req.body.quantity;
  order_details.tailors = req.body.tailors;
  
  
  //making products object and setting all id keys to 0.
  var products = {};
  for(let i=0; i<order_details.products.length; i++) {
    
    if(typeof products[`${order_details.products[i]}`] == 'undefined') {
      console.log('id= ', order_details.products[i])
      products[`${order_details.products[i]}`] = 0
    } else {
      console.log(typeof products[`${order_details.products[i]}`] == 'undefined')
    }
  }

  //order status at start
  order_details.status = 'pending'
  

  order_details.original_price = 0;
  order_details.discounted_price = 0;
  for(let i=0; i<order_details.quantity.length; i++) {
    
    //seperately pushing in orders cart
    for(let j=0; j<order_details.quantity[i]; j++) {
      
      products[`${order_details.products[i]}`] += 1
      
      console.log("sequence number of", order_details.products[i], "is", products[`${order_details.products[i]}`])
      
      var pushed = await db.pushInOrders_cart({
        order_id: order_details.id, 
        product_id: order_details.products[i], 
        product_seq: products[`${order_details.products[i]}`],
        tailor_id: order_details.tailors[i],
        status: 'processing'
      })
      
      // console.log("ispushed=", pushed)
    }
    
    //calculating pricing
    var prices = await db.getPriceOf(order_details.products[i])
    prices = prices[0]
    // console.log(prices)
    order_details.original_price += (prices.original_price)*Number(order_details.quantity[i])
    order_details.discounted_price += (prices.discounted_price)*Number(order_details.quantity[i])
    // console.log(`price of product:${order_details.products[i]} X${order_details.quantity[i]} = ${prices.discounted_price}`)
    // console.log(order_details.discounted_price)
    
  }


  //assigning promotor shares
  order_details.promotor_ref = (typeof req.body.promotor == 'undefined')?'SELF':req.body.promotor;
  
  if(order_details.promotor_ref != 'SELF') {
    order_details.promotor_share = 10;
  } else {
    order_details.promotor_share = 0;
  }
  order_details.promotor_amount = order_details.discounted_price*order_details.promotor_share/100;
  

  //deleting body unneccesary properties
  delete order_details.products;
  delete order_details.quantity;
  delete order_details.tailors;


  console.log("order details:", order_details);


  var pushed = await db.pushInOrders(order_details)

  console.log('pushed in orders:', pushed)
  
  
  
  res.status(200).send("hurray!")
  
})


router.post('/changeStatus', async (req, res) => {

  var {id, status} = req.body;

  var changed = await db.changeOrderStatus(id, status)

  console.log("changed:", changed)

  if(changed != 0 && changed != -1) {
    res.send("1")
  }
})




//ajax req/res routes

router.post('/products', async (req, res) => {

  var products = await db.getProductsList();
  // console.log('Products:', products==-1?"ERROR":products)

  if(products == -1 || products == 0) {
    res.send('-1')
  } else {
    res.send(products)
  }

})

router.post('/tailors', async (req, res) => {
  var tailors = await db.getTailorsList();

  
  for(let tailor of tailors) {
    // console.log(tailor)
    var pending = await db.getTailorPendingOrders(tailor.id)
    var processing = await db.getTailorProcessingOrders(tailor.id)

    console.log(`tailor(${tailor.id}) pending=${pending[0].pending}, processing=${processing[0].processing}`)

    tailor.pending = pending[0].pending;
    tailor.processing = processing[0].processing;
  }
  // console.log('Products:', tailors==-1?"Error":tailors)

  if(tailors == -1 || tailors == 0) {
    res.send('-1')
  } else {
    res.send(tailors)
  }
})


module.exports = router;
