import { get, post, put, destroy, patch } from './helpers/ApiRequestsHelper'
// solution: añadimos a los imports patch
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

// solution: añadimos el endpoint de la nueva ruta creada
function updateSort (id) {
  return patch(`/restaurants/${id}/sort`)
}

// solution: añadimos updateSort
export { getAll, getDetail, getRestaurantCategories, create, update, remove, updateSort }
