import { get, post, put, destroy, patch } from './helpers/ApiRequestsHelper'
// solution: añadimos el import de patch
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
function updateStatus (id) {
  return patch(`restaurants/${id}/status`)
}

// solution: añadimos a los import updateStatus
export { getAll, getDetail, getRestaurantCategories, create, update, remove, updateStatus }
