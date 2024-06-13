import { RestaurantCategory } from '../../models/models.js'
import { check } from 'express-validator'

// SOLUCIÓN  -->  Clase creada especificamente para la solución, necesitamos los validations del create

// SOLUCIÓN -->  Comprobar si ya existe esa categoría
const checkNotExistRestaurantCategory = async (value, { req }) => {
  try {
    const restaurantCategory = await RestaurantCategory.findOne({ where: { name: value } })
    if (restaurantCategory === null) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error(`The category ${value} already exists.`))
    }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}
const create = [
  // La longitud máxima del nombre es 50
  check('name').exists().isString().isLength({ min: 1, max: 50 }).trim(),
  check('name').custom(checkNotExistRestaurantCategory)
]

export { create }
