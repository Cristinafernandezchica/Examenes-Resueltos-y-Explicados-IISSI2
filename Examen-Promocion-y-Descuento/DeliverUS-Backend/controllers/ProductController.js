'use strict'
const models = require('../models')
const Product = models.Product
const Order = models.Order
const Restaurant = models.Restaurant
const RestaurantCategory = models.RestaurantCategory
const ProductCategory = models.ProductCategory
// const sequelizeSession = models.sequelizeSession

const Sequelize = require('sequelize')

exports.indexRestaurant = async function (req, res) {
  try {
    const products = await Product.findAll({
      where: {
        restaurantId: req.params.restaurantId
      }
    })
    res.json(products)
  } catch (err) {
    res.status(500).send(err)
  }
}

exports.show = async function (req, res) {
  // Only returns PUBLIC information of products
  try {
    const product = await Product.findByPk(req.params.productId, {
      include: [
        {
          model: ProductCategory,
          as: 'productCategory'
        }]
    }
    )
    res.json(product)
  } catch (err) {
    res.status(500).send(err)
  }
}

exports.create = async function (req, res) {
  let newProduct = Product.build(req.body)
  if (typeof req.file !== 'undefined') {
    newProduct.image = req.file.destination + '/' + req.file.filename
  }
  try {
    newProduct = await newProduct.save()
    res.json(newProduct)
  } catch (err) {
    res.status(500).send(err)
  }
}

exports.update = async function (req, res) {
  if (typeof req.file !== 'undefined') {
    req.body.image = req.file.destination + '/' + req.file.filename
  }
  try {
    await Product.update(req.body, { where: { id: req.params.productId } })
    const updatedProduct = await Product.findByPk(req.params.productId)
    res.json(updatedProduct)
  } catch (err) {
    res.status(500).send(err)
  }
}

/*
// SOLUTION: Promocionar un producto (CON TRANSACCIÓN)
const { sequelize } = require('../models') // Asegúrate de importar la instancia de sequelize

exports.promote = async function (req, res) {
  const t = await sequelize.transaction(); // Inicia la transacción
  try {
    // Busca el producto en la BD
    const product = await Product.findOne({ where: { id: req.params.productId }, transaction: t })
    // Si existe el producto
    if (product !== null) {
      // Si está promocionado
      if (product.promote === 'promote') {
        // Le quitamos la promoción
        product.promote = 'demote'
      // Si no esta promocionado
      } else {
        // Lo promocionamos
        product.promote = 'promote'
      }
      // Guardamos los cambios
      await product.save({ transaction: t })
      await t.commit(); // Si todo es correcto, hacemos commit de la transacción
      res.json(product)
    } else {
      await t.rollback(); // Si no se encuentra el producto, hacemos rollback
      res.status(404).send('No se ha encontrado el producto')
    }
  } catch (error) {
    await t.rollback(); // En caso de error, hacemos rollback
    res.status(500).send(error.message)
  }
}

*/

// SOLUTION: Promocionar un producto
exports.promote = async function (req, res) {
  try {
    // Busca el producto en la BD
    const product = await Product.findOne({ where: { id: req.params.productId } })
    // Si existe el producto
    if (product !== null) {
      // Si está promocionado
      if (product.promote) {
        // Le quitamos la promoción
        product.promote = false
      // Si no esta promocionado
      } else {
        // Lo promocionamos
        product.promote = true
      }
      // Guardamos los cambios
      await product.save()
      res.json(product)
    } else {
      res.status(404).send('No se ha encontrado el producto')
    }
  } catch (error) {
    // await t.rollback()
    res.status(500).send(error)
  }
}

exports.destroy = async function (req, res) {
  try {
    const result = await Product.destroy({ where: { id: req.params.productId } })
    let message = ''
    if (result === 1) {
      message = 'Sucessfuly deleted product id.' + req.params.productId
    } else {
      message = 'Could not delete product.'
    }
    res.json(message)
  } catch (err) {
    res.status(500).send(err)
  }
}

exports.popular = async function (req, res) {
  try {
    const topProducts = await Product.findAll(
      {
        include: [{
          model: Order,
          as: 'orders',
          attributes: []
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId'],
          include:
        {
          model: RestaurantCategory,
          as: 'restaurantCategory'
        }
        }
        ],
        attributes: {
          include: [
            [Sequelize.fn('SUM', Sequelize.col('orders.OrderProducts.quantity')), 'soldProductCount']
          ],
          separate: true
        },
        group: ['orders.OrderProducts.productId'],
        order: [[Sequelize.col('soldProductCount'), 'DESC']]
      // limit: 3 //this is not supported when M:N associations are involved
      })
    res.json(topProducts.slice(0, 3))
  } catch (err) {
    res.status(500).send(err)
  }
}
