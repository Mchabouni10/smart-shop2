// send-request.js in utilities 

import { getToken } from './users-service';

export default async function sendRequest(url, method = 'GET', payload = null) {
  const options = { method };
  if (payload) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(payload);
  }
  const token = await getToken();
  if (token) {
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Sending request:', { url, method, headers: options.headers });
  const res = await fetch(url, options);
  if (res.ok) return res.json();
  if (res.status === 401) {
    throw new Error('Unauthorized: Invalid or missing token');
  }
  if (res.status === 400) {
    throw new Error('Bad Request: Invalid request data');
  }
  const errorText = await res.text();
  throw new Error(`Request failed with status ${res.status}: ${errorText}`);
}