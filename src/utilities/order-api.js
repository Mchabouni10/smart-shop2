//src/utilities/order-api.js

import sendRequest from './send-request';

const BASE_URL = '/api/orders';

export function getCart() {
  return sendRequest(`${BASE_URL}/cart`);
}

export function addItemToCart(itemId) {
  return sendRequest(`${BASE_URL}/cart/items/${itemId}`, 'POST');
}

export function setItemQtyInCart(itemId, newQty) {
  return sendRequest(`${BASE_URL}/cart/qty`, 'PUT', { itemId, newQty });
}

export function checkout() {
  return sendRequest(`${BASE_URL}/cart/checkout`, 'POST');
}

export function getOrderHistory() {
  return sendRequest(`${BASE_URL}/history`);
}

export function deleteOrder(orderId) {
  return sendRequest(`${BASE_URL}/${orderId}`, 'DELETE');
}

export function editOrder(orderId, orderData) {
  return sendRequest(`${BASE_URL}/${orderId}`, 'PUT', orderData);
}


  