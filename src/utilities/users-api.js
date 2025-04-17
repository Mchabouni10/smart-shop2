//user-api.js in utilities


import sendRequest from './send-request';

const BASE_URL = '/api/users';

export function signUp(userData) {
  return sendRequest(BASE_URL, 'POST', userData);
}

export function login(credentials) {
  return sendRequest(`${BASE_URL}/login`, 'POST', credentials);
}

export function getProfile() {
  return sendRequest(`${BASE_URL}/profile`, 'GET');
}

export function refreshToken(refreshToken) {
  return sendRequest(`${BASE_URL}/refresh-token`, 'POST', { refreshToken });
}