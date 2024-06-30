import { get, post, put, destroy } from './helpers/ApiRequestsHelper'
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

// solution: nuevo endpoint para la ruta de creación de nueva categoría de restaurnate
function createCategory (data) {
  return post('restaurantCategories', data)
}

// solution: añadimos createCategory
export { getAll, getDetail, getRestaurantCategories, create, update, remove, createCategory }
