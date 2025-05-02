//utilities/users-api.js
import sendRequest from './send-request';

const BASE_URL = '/api/users';

export function signUp(userData) {
  return sendRequest(BASE_URL, 'POST', {
    ...userData,
  });
}

export function login(credentials) {
  return sendRequest(`${BASE_URL}/login`, 'POST', {
    email: credentials.email,
    password: credentials.password
  });
}

export function getProfile() {
  return sendRequest(`${BASE_URL}/profile`);
}

export function refreshToken() {
  return sendRequest(`${BASE_URL}/refresh-token`, 'POST');
}

export function requestPasswordReset(email) {
  return sendRequest(`${BASE_URL}/request-password-reset`, 'POST', { email });
}

export function resetPassword(data) {
  return sendRequest(`${BASE_URL}/reset-password`, 'POST', data);
}

export function verifyToken() {
  return sendRequest(`${BASE_URL}/verify-token`);
}