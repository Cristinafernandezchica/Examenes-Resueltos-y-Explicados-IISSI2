import { Restaurant, Product, RestaurantCategory, ProductCategory, sequelizeSession } from '../models/models.js'

const index = async function (req, res) {
  try {
    const restaurants = await Restaurant.findAll(
      {
        attributes: { exclude: ['userId'] },
        include:
      {
        model: RestaurantCategory,
        as: 'restaurantCategory'
      },
        order: [[{ model: RestaurantCategory, as: 'restaurantCategory' }, 'name', 'ASC']]
      }
    )
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}

const indexOwner = async function (req, res) {
  try {
    const restaurants = await Restaurant.findAll(
      {
        attributes: { exclude: ['userId'] },
        where: { userId: req.user.id },
        include: [{
          model: RestaurantCategory,
          as: 'restaurantCategory'
        }]
      })
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}

const create = async function (req, res) {
  const newRestaurant = Restaurant.build(req.body)
  newRestaurant.userId = req.user.id // usuario actualmente autenticado
  try {
    const restaurant = await newRestaurant.save()
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}
/*
const show = async function (req, res) {
  // Only returns PUBLIC information of restaurants
  try {
    // const orderBy = req.params.orderByPrice ? 'price' : 'order' // solution: para saber por lo uqe debemos ordenar
    const restaurant = await Restaurant.findByPk(req.params.restaurantId, {
      attributes: { exclude: ['userId'] },
      include: [{
        model: Product,
        as: 'products',
        include: { model: ProductCategory, as: 'productCategory' }
      },
      {
        model: RestaurantCategory,
        as: 'restaurantCategory'
      }],
      order: [[{ model: Product, as: 'products' }, req.params.orderByPrice ? 'price' : 'order', 'ASC']] // solution: ponemos el orderBy calculado como parámetro de ordenación
    }
    )
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}
  */

const show = async function (req, res) {
  // Only returns PUBLIC information of restaurants
  try {
    let restaurant = await Restaurant.findByPk(req.params.restaurantId) // Obtenemos el restaurante
    // Variable que nos indicará la forma de ordenar los productos en función del atributo sortByPrice
    const orderBy = restaurant.orderByPrice
      ? [[{ model: Product, as: 'products' }, 'price', 'ASC']] // Por precio
      : [[{ model: Product, as: 'products' }, 'order', 'ASC']] // Por defecto (order)
    restaurant = await Restaurant.findByPk(req.params.restaurantId, {
      attributes: { exclude: ['userId'] },
      include: [{
        model: Product,
        as: 'products',
        include: { model: ProductCategory, as: 'productCategory' }
      },
      {
        model: RestaurantCategory,
        as: 'restaurantCategory'
      }],
      order: orderBy // Utilizamos la constante creada
    }
    )
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const update = async function (req, res) {
  try {
    await Restaurant.update(req.body, { where: { id: req.params.restaurantId } })
    const updatedRestaurant = await Restaurant.findByPk(req.params.restaurantId)
    res.json(updatedRestaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

// solution: método para cambiar el modo de ordenamiento (precio o por defecto (order))
const updateSort = async function (req, res) {
  const trans = await sequelizeSession.transaction()
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (restaurant.orderByPrice === false || restaurant.orderByPrice === true) {
      const newOrder = !restaurant.orderByPrice
      await Restaurant.update(
        { orderByPrice: newOrder },
        { where: { id: req.params.restaurantId } },
        { transaction: trans }
      )
    }
    await trans.commit()
    const updatedRestaurant = Restaurant.findByPk(req.params.restaurantId)
    res.json(updatedRestaurant)
  } catch (error) {
    await trans.rollback()
    res.status(500).send(error)
  }
}

const destroy = async function (req, res) {
  try {
    const result = await Restaurant.destroy({ where: { id: req.params.restaurantId } })
    let message = ''
    if (result === 1) {
      message = 'Sucessfuly deleted restaurant id.' + req.params.restaurantId
    } else {
      message = 'Could not delete restaurant.'
    }
    res.json(message)
  } catch (err) {
    res.status(500).send(err)
  }
}

const RestaurantController = {
  index,
  indexOwner,
  create,
  show,
  update,
  destroy,
  // solution
  updateSort
}
export default RestaurantController
