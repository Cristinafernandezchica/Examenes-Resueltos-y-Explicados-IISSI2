import { get, post, put, destroy, patch } from './helpers/ApiRequestsHelper'
// solution: añadimos patch a los imports

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

function remove (id) {
  return destroy(`products/${id}`)
}

// solution: endopoint de la nueva ruta creada para promocionar/despromocionar
function promote (id) {
  return patch(`products/${id}/promote`)
}

// solution: añadimos promote
export { getDetail, getProductCategories, create, update, remove, promote }
