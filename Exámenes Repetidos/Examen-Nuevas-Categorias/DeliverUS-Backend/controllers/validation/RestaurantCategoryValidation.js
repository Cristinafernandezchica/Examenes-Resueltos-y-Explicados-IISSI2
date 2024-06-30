// solution: archivo creado específicamente para comprobar la restricción de longitud del nombre y que no exista
const { check } = require('express-validator')
// solution
const { RestaurantCategory } = require('../../models')

// solution: check para comprobar que no existe la categoría que vamos a crear
const checkRestaurantCategoryNotExists = async (value, { req }) => {
  try {
    const restaurantCategory = await RestaurantCategory.findOne({ where: { name: value } })
    if (restaurantCategory !== null) {
      return Promise.reject(new Error(`The restaurnat category ${req.body.name} already exist.`))
    } else {
      return Promise.resolve()
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

module.exports = {
  create: [
    check('name').exists().isString().isLength({ min: 1, max: 50 }).trim(),
    check('name').custom(checkRestaurantCategoryNotExists)
  ]

}
