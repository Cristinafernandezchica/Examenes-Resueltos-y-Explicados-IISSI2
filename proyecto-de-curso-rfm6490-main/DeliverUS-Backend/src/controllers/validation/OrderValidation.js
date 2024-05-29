import { check } from 'express-validator'
import { Product, Restaurant, Order } from '../../models/models.js'

// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
const checkRestaurantExists = async (value, { req }) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (restaurant !== null) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('Resturant does not exists'))
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

// 3. Check that products are available
const checkAvailabilityOfP = async (value, { req }) => {
  try {
    const products = req.body.products
    const productsIds = products.map(product => product.productId) // obtengo los ids de los productos
    const productsInDb = await Product.findAll( // obtengo los productos que estén disponibles
      {
        where: {
          id: productsIds,
          availability: true
        }
      })
    if (productsInDb.length !== req.body.products.length) { // si no son los mismos lanzo error
      return Promise.reject(new Error('Some products are not available'))
    } else {
      return Promise.resolve()
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

// 4. Check that all the products belong to the same restaurant
const checkAllPSameRestaurant = async (value, { req }) => {
  try {
    const orderRestaurantId = parseInt(req.body.restaurantId)
    const products = await Product.findAll({
      where: {
        id: req.body.products.map(x => x.productId)
      },
      attributes: ['restaurantId']
    })
    if (products.some(x => x.restaurantId !== orderRestaurantId)) {
      return Promise.reject(new Error('Products do not belong to the same restaurant'))
    } else {
      return Promise.resolve()
    }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited. (UPDATE)
const checkOriginalRestaurant = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const products = req.body.products
    const productsIds = products.map(product => product.productId)
    const productsDb = await Product.findAll({
      where: {
        id: productsIds
      },
      attributes: ['restaurantId']
    })
    if (productsDb.some(x => x.restaurantId !== order.restaurantId)) {
      return Promise.reject(new Error('Products do not belong to the same restaurant as before'))
    } else {
      return Promise.resolve()
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

// 5. Check that the order is in the 'pending' state.
const checkIfPending = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order.status === 'pending') {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('Order is not in pending state'))
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

const create = [
  check('restaurantId').exists().isInt().toInt(), //  1. Check that restaurantId is present in the body
  check('restaurantId').custom(checkRestaurantExists), // and corresponds to an existing restaurant
  check('address').exists().isString(),
  check('products').exists().isArray({ min: 1 }).toArray(), // 2. Check that products is a non-empty array composed of objects
  check('products.*.quantity').isInt({ min: 1 }).toInt(), // with quantity
  check('products.*.productId').exists().isInt().toInt(), // and productId greater than 0
  check('products').custom(checkAvailabilityOfP), // 3. Check that products are available
  check('products').custom(checkAllPSameRestaurant) // 4. Check that all the products belong to the same restaurant
]

// DONE: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.

const update = [
  check('restaurantId').not().exists(), // 1. Check that restaurantId is NOT present in the body.
  check('address').exists().isString(),
  check('products').exists().isArray({ min: 1 }), // 2. Check that products is a non-empty array composed of objects
  check('products.*.productId').exists().isInt({ min: 1 }).toInt(), // with productId
  check('products.*.quantity').exists().isInt({ min: 1 }).toInt(), // and quantity greater than 0
  check('products').exists().custom(checkAvailabilityOfP), // 3. Check that products are available
  check('products').exists().custom(checkOriginalRestaurant), // 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
  check('orderId').exists().custom(checkIfPending) // 5. Check that the order is in the 'pending' state.
]

export { create, update }
