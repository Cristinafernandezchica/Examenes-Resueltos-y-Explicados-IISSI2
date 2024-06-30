'use strict'
const models = require('../models')
const RestaurantCategory = models.RestaurantCategory

exports.indexRestaurantCategory = async function (req, res) {
  try {
    const restaurantCategories = await RestaurantCategory.findAll()
    res.json(restaurantCategories)
  } catch (err) {
    res.status(500).send(err)
  }
}

// solution: método para crear categroías de restaurantes
exports.create = async function (req, res) {
  const newRestaurantCategory = RestaurantCategory.build(req.body)
  try {
    const newRestCat = await newRestaurantCategory.save()
    res.json(newRestCat)
  } catch (err) {
    res.status(500).send(err)
  }
}
