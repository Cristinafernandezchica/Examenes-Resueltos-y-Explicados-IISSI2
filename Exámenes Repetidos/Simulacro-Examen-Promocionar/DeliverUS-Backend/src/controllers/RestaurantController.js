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
        // solution ['promoted', 'DESC']
        order: [['prmoted', 'DESC'], [{ model: RestaurantCategory, as: 'restaurantCategory' }, 'name', 'ASC']]
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
        // solution
        order: [['promoted', 'DESC']],
        //
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

// solution: lógica para promocionar un restaurante desde la ventana de edición (actualización del restaurante)
const promote = async function (req, res) {
  const trans = await sequelizeSession.transaction()
  try {
    const promotedRestaurant = await Restaurant.findOne({ where: { userId: req.user.id, promoted: true } })
    // si hay un restaurante promocionado
    if (promotedRestaurant) {
      // despromocionamos ese restaurante
      await Restaurant.update(
        { promoted: false },
        { where: { id: promotedRestaurant.id } },
        { transaction: trans }
      )
    }
    // promocionamos el restaurante que solicita el dueño
    await Restaurant.update(
      { promoted: true },
      { where: { id: req.params.restaurantId } },
      { transaction: trans }
    )
    await trans.commit()
    const updatedRestaurants = await Restaurant.findByPk(req.params.restaurantId)
    res.json(updatedRestaurants)
  } catch (error) {
    await trans.rollback()
    res.status(500).send(error)
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
  promote
}
export default RestaurantController
