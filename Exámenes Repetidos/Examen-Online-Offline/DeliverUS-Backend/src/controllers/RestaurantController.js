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
        // solution: ordenar los restaurantetes DEL PROPIETARIO en función de online-offline y a igualdad por nombre
        order: [['status', 'ASC'], ['name', 'ASC']],
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

const show = async function (req, res) {
  // Only returns PUBLIC information of restaurants
  try {
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
      order: [[{ model: Product, as: 'products' }, 'order', 'ASC']]
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

// solution: método para cambiar el estado
const updateStatus = async function (req, res) {
  const trans = await sequelizeSession.transaction()
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)

    // para comprobar si hay ordenes ¡¡pendientes de entregar (deliveredAt: null)
    const orders = await restaurant.getOrders()
    const undeliveredOrders = orders.filter(o => o.deliveredAt === null)
    const hasUndeliveredOrders = undeliveredOrders.length > 0

    // si el estado no es null, ni 'closed', ni 'temporarily closed' y si el restaurante no tiene pedidos sin entregar
    if (restaurant.status !== null && restaurant.status !== 'closed' && restaurant.status !== 'temporarily closed' && !hasUndeliveredOrders) {
      if (restaurant.status === 'online' || restaurant.status === 'offline') {
        const newStatus = restaurant.status === 'online' ? 'offline' : 'online'
        await Restaurant.update(
          { status: newStatus },
          { where: { id: req.params.restaurantId } },
          { transaction: trans }
        )
      }
    }
    await trans.commit()
    const updatedRestaurant = await Restaurant.findByPk(req.params.restaurantId)
    res.json(updatedRestaurant)
  } catch (error) {
    await trans.rollback()
    res.status(500).send(error)
  }
}

/*
const updateStatus = async function (req, res) {
  const trans = await sequelizeSession.transaction()
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)

    const orders = await restaurant.getOrders()
    const undeliveredOrders = orders.filter(o => o.deliveredAt === null)
    const hasUndeliveredOrders = undeliveredOrders.length > 0

    if (restaurant.status !== 'closed' && restaurant.status !== 'temporarily closed' && restaurant.status !== null && !hasUndeliveredOrders) {
      restaurant.status = restaurant.status === 'online' ? 'offline' : 'online'
      await restaurant.save()
    }

    await trans.commit()
    const updatedRestaurant = await Restaurant.findByPk(req.params.restaurantId)
    res.json(updatedRestaurant)
  } catch (error) {
    await trans.rollback()
    res.status(500).send(error.message)
  }
}
*/
const RestaurantController = {
  index,
  indexOwner,
  create,
  show,
  update,
  destroy,
  // solution
  updateStatus
}
export default RestaurantController
