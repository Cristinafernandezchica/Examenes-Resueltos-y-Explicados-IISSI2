import { get, post, destroy, put } from './helpers/ApiRequestsHelper'

function getOrders () {
  return get('orders')
}

function getOrderDetail (id) {
  return get(`orders/${id}`)
}

function create (data) {
  return post('orders', data)
}

function remove (id) {
  return destroy(`orders/${id}`)
}

function update (id, data) {
  return put(`orders/${id}`, data)
}
export { getOrders, getOrderDetail, create, remove, update }
