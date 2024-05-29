import { Order, Product, Restaurant, User, sequelizeSession } from '../models/models.js'
import moment from 'moment'
import { Op } from 'sequelize'
const generateFilterWhereClauses = function (req) {
  const filterWhereClauses = []
  if (req.query.status) {
    switch (req.query.status) {
      case 'pending':
        filterWhereClauses.push({
          startedAt: null
        })
        break
      case 'in process':
        filterWhereClauses.push({
          [Op.and]: [
            {
              startedAt: {
                [Op.ne]: null
              }
            },
            { sentAt: null },
            { deliveredAt: null }
          ]
        })
        break
      case 'sent':
        filterWhereClauses.push({
          [Op.and]: [
            {
              sentAt: {
                [Op.ne]: null
              }
            },
            { deliveredAt: null }
          ]
        })
        break
      case 'delivered':
        filterWhereClauses.push({
          sentAt: {
            [Op.ne]: null
          }
        })
        break
    }
  }
  if (req.query.from) {
    const date = moment(req.query.from, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.gte]: date
      }
    })
  }
  if (req.query.to) {
    const date = moment(req.query.to, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.lte]: date.add(1, 'days')
      }
    })
  }
  return filterWhereClauses
}

// Returns :restaurantId orders
const indexRestaurant = async function (req, res) {
  const whereClauses = generateFilterWhereClauses(req)
  whereClauses.push({
    restaurantId: req.params.restaurantId
  })
  try {
    const orders = await Order.findAll({
      where: whereClauses,
      include: {
        model: Product,
        as: 'products'
      }
    })
    res.json(orders)
  } catch (err) {
    res.status(500).send(err)
  }
}

// DONE: Implement the indexCustomer function that queries orders from current logged-in customer and send them back.
// Orders have to include products that belongs to each order and restaurant details sort them by createdAt date, desc.
const indexCustomer = async function (req, res) {
  try {
    const orders = await Order.findAll({
      where: {
        userId: req.user.id
      },
      include: [{ model: Product, as: 'products' }, {
        model: Restaurant, as: 'restaurant'
      }],
      order: [['createdAt', 'DESC']]
    })
    res.json(orders)
  } catch (err) {
    res.status(500).send('Error initializing the requests')
  }
}

// DONE: Implement the create function that receives a new order and stores it in the database.
// Take into account that:
// 1. If price is greater than 10€, shipping costs have to be 0.
// 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
// 3. In order to save the order and related products, start a transaction, store the order, store each product linea and commit the transaction
// 4. If an exception is raised, catch it and rollback the transaction

const create = async function (req, res) {
  const tr = await sequelizeSession.transaction() // start the transaction
  try {
    // 1. If price is greater than 10€, shipping costs have to be 0.
    // 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
    let pedidoCreado = Order.build(req.body)
    let precio = 0
    for (const pr of req.body.products) {
      const datoProducto = await Product.findByPk(pr.productId)
      precio += pr.quantity * datoProducto.price
    }
    let shippingCosts = 0
    if (precio > 10) {
      shippingCosts = 0
    } else {
      const restaurant = await Restaurant.findByPk(req.body.restaurantId)
      shippingCosts = restaurant.shippingCosts
    }

    const finalPrice = precio + shippingCosts

    pedidoCreado.createdAt = new Date()
    pedidoCreado.userId = req.user.id
    pedidoCreado.price = finalPrice
    pedidoCreado.shippingCosts = shippingCosts
    pedidoCreado = await pedidoCreado.save({ tr })

    // 3. In order to save the order and related products, start a transaction, store the order, store each product linea and commit the transaction
    for (const pr of req.body.products) {
      const databaseProducto = await Product.findByPk(pr.productId)
      await pedidoCreado.addProduct(databaseProducto, { through: { quantity: pr.quantity, unityPrice: databaseProducto.price }, tr })
    }
    await tr.commit()
    const pedidoFinal = await Order.findByPk(pedidoCreado.id, { include: [{ model: Product, as: 'products' }] })
    res.json(pedidoFinal)
  } catch (error) {
    // 4. If an exception is raised, catch it and rollback the transaction
    await tr.rollback()
    res.status(500).send('An error has occurred!')
  }
}

// DONE: Implement the update function that receives a modified order and persists it in the database.
// Take into account that:
// 1. If price is greater than 10€, shipping costs have to be 0.
// 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
// 3. In order to save the updated order and updated products, start a transaction, update the order, remove the old related OrderProducts and store the new product lines, and commit the transaction
// 4. If an exception is raised, catch it and rollback the transaction
const update = async function (req, res) {
  const tr = await sequelizeSession.transaction()
  try {
    let precioN = 0
    for (const producto of req.body.products) {
      const productoData = await Product.findByPk(producto.productId)
      precioN += producto.quantity * productoData.price
    }

    // 1. If price is greater than 10€, shipping costs have to be 0.
    // 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
    let shippingCostsN = 0
    const order = await Order.findByPk(req.params.orderId)
    if (precioN <= 10) {
      const restaurant = await Restaurant.findByPk(order.restaurantId)
      shippingCostsN = restaurant.shippingCosts
    }
    // 3. In order to save the updated order and updated products, start a transaction, update the order, remove the old related OrderProducts and store the new product lines, and commit the transaction
    await order.setProducts([])
    for (const producto of req.body.products) {
      const productoData = await Product.findByPk(producto.productId)
      await order.addProduct(productoData, { through: { quantity: producto.quantity, unityPrice: productoData.price }, tr })
    }
    req.body.price = precioN + shippingCostsN
    req.body.shippingCosts = shippingCostsN
    await Order.update(req.body, { where: { id: req.params.orderId }, tr })
    await tr.commit()
    const uOrder = await Order.findByPk(req.params.orderId, { include: [{ model: Product, as: 'products' }] })
    res.json(uOrder)
  } catch (e) {
    // 4. If an exception is raised, catch it and rollback the transaction
    await tr.rollback()
    res.status(500).send(e)
  }
}

// DONE: Implement the destroy function that receives an orderId as path param and removes the associated order from the database.
// Take into account that:
// 1. The migration include the "ON DELETE CASCADE" directive so OrderProducts related to this order will be automatically removed.
const destroy = async function (req, res) {
  try {
    const deletedOrderId = await Order.destroy({ where: { id: req.params.orderId } })
    let message = 'Order could not be found!'
    if (deletedOrderId > 0) {
      message = 'Order deleted successfully!'
    }
    res.json(message)
  } catch (error) {
    res.status(500).send('Error initializing the requests')
  }
}

const confirm = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.startedAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const send = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.sentAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const deliver = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.deliveredAt = new Date()
    const updatedOrder = await order.save()
    const restaurant = await Restaurant.findByPk(order.restaurantId)
    const averageServiceTime = await restaurant.getAverageServiceTime()
    await Restaurant.update({ averageServiceMinutes: averageServiceTime }, { where: { id: order.restaurantId } })
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const show = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId']
      },
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'email', 'avatar', 'userType']
      },
      {
        model: Product,
        as: 'products'
      }]
    })
    res.json(order)
  } catch (err) {
    res.status(500).send(err)
  }
}

const analytics = async function (req, res) {
  const yesterdayZeroHours = moment().subtract(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const todayZeroHours = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  try {
    const numYesterdayOrders = await Order.count({
      where:
      {
        createdAt: {
          [Op.lt]: todayZeroHours,
          [Op.gte]: yesterdayZeroHours
        },
        restaurantId: req.params.restaurantId
      }
    })
    const numPendingOrders = await Order.count({
      where:
      {
        startedAt: null,
        restaurantId: req.params.restaurantId
      }
    })
    const numDeliveredTodayOrders = await Order.count({
      where:
      {
        deliveredAt: { [Op.gte]: todayZeroHours },
        restaurantId: req.params.restaurantId
      }
    })

    const invoicedToday = await Order.sum(
      'price',
      {
        where:
        {
          createdAt: { [Op.gte]: todayZeroHours },
          restaurantId: req.params.restaurantId
        }
      })
    res.json({
      restaurantId: req.params.restaurantId,
      numYesterdayOrders,
      numPendingOrders,
      numDeliveredTodayOrders,
      invoicedToday
    })
  } catch (err) {
    res.status(500).send(err)
  }
}

const OrderController = {
  indexRestaurant,
  indexCustomer,
  create,
  update,
  destroy,
  confirm,
  send,
  deliver,
  show,
  analytics
}
export default OrderController
