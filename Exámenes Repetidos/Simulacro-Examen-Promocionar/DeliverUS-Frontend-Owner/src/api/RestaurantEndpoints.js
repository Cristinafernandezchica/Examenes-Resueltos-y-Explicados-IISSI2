import { get, post, put, destroy, patch } from './helpers/ApiRequestsHelper'
// solution: añadimos patch a los imports

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

function remove (id) {
  return destroy(`restaurants/${id}`)
}

// solution: añadimos el endpoint de la nueva ruta
function promote (id) {
  return patch(`restaurants/${id}/promote`)
}

// solution: añadimos promote
export { getAll, getDetail, getRestaurantCategories, create, update, remove, promote }
