import { get, post, put, destroy, patch } from './helpers/ApiRequestsHelper'
function getAll () {
  return get('users/myrestaurants')
}

function getDetail (id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories () {
  return get('restaurantCategories')
}

function create (data) {
  return post('restaurants', data)
}

function update (id, data) {
  return put(`restaurants/${id}`, data)
}

// SOLUCIÓN  -->  Es patch porque en el routes hemos utilizado patch
function promote (id) {
  return patch(`restaurants/${id}/promote`)
}

function remove (id) {
  return destroy(`restaurants/${id}`)
}

export { getAll, getDetail, getRestaurantCategories, create, update, promote, remove }
