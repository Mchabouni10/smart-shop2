//user-api.js in utilities
import sendRequest from './send-request';

const BASE_URL = '/api/users';

export function signUp(userData) {
  return sendRequest(BASE_URL, 'POST', {
    ...userData,
    // Consider adding client-side validation here
  });
}

export function login(credentials) {
  return sendRequest(`${BASE_URL}/login`, 'POST', {
    email: credentials.email,
    password: credentials.password
    // Explicitly sending only needed fields
  });
}

export function getProfile() {
  return sendRequest(`${BASE_URL}/profile`);
  // GET method is default, no need to specify
}

export function refreshToken() {
  // Removed refreshToken parameter since we're using HTTP-only cookies
  return sendRequest(`${BASE_URL}/refresh-token`, 'POST');
  // Note: The refresh token should come from HTTP-only cookies
}

// Optional: Add token verification endpoint
export function verifyToken() {
  return sendRequest(`${BASE_URL}/verify-token`);
}