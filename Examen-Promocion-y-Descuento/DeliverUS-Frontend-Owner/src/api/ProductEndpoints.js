import { get, post, put, destroy, patch } from './helpers/ApiRequestsHelper'

function getDetail (id) {
  return get(`products/${id}`)
}

function getProductCategories () {
  return get('productCategories')
}

function create (data) {
  return post('/products/', data)
}

function update (id, data) {
  return put(`products/${id}`, data)
}

// SOLUTION: Creamos un nuevo endpoint para el método promote
function promote (id) {
  return patch(`products/${id}/promote`)
}

function remove (id) {
  return destroy(`products/${id}`)
}

export { getDetail, getProductCategories, create, update, remove, promote }
