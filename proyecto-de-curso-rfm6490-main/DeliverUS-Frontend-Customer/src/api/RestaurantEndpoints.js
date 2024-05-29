import { get } from './helpers/ApiRequestsHelper'
function getAll () {
  return get('users/myrestaurants')
}

function getAll2 () {
  return get('/restaurants')
}

function getDetail (id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories () {
  return get('restaurantCategories')
}

export { getAll, getAll2, getDetail, getRestaurantCategories }
