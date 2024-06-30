'use strict'
const RestaurantCategoryController = require('../controllers/RestaurantCategoryController')
// solution
const RestaurantCategoryValidation = require('../controllers/validation/RestaurantCategoryValidation')

module.exports = (options) => {
  const app = options.app
  // solution
  const middlewares = options.middlewares

  app.route('/restaurantCategories')
    .get(RestaurantCategoryController.indexRestaurantCategory)
    // solution: para crear nuevas categorías de restaurantes
    .post(
      middlewares.isLoggedIn,
      middlewares.hasRole('owner'),
      RestaurantCategoryValidation.create,
      middlewares.handleValidation,
      RestaurantCategoryController.create)
}
