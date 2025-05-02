// send-request.js
import { getToken, refreshToken } from './users-service';

// Flag to prevent multiple simultaneous token refreshes
let isRefreshing = false;

export default async function sendRequest(url, method = 'GET', payload = null) {
  // Initialize request options
  const options = {
    method,
    credentials: 'include', // Always include credentials for cookies
    headers: {}
  };

  // Set Content-Type and body for payload-carrying requests
  if (payload) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(payload);
  } else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    // Explicitly set Content-Type for these methods even without payload
    options.headers['Content-Type'] = 'application/json';
  }

  // Skip auth for specific routes
  const skipAuthRoutes = [
    '/api/users/login',
    '/api/users',
    '/api/users/refresh-token'
  ];

  // Add authorization header for routes that need it
  if (!skipAuthRoutes.some(route => url.includes(route))) {
    try {
      const token = await getToken();
      if (!token) throw new Error('No valid token available');
      options.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error('Token retrieval error:', err);
      throw new Error('Authentication required');
    }
  }

  console.debug('Sending request:', { url, method, headers: options.headers });

  // First attempt
  let res = await fetch(url, options);

  // Return successful response immediately
  if (res.ok) {
    try {
      return await res.json();
    } catch (err) {
      console.error('Response parsing error:', err);
      throw new Error('Failed to parse response');
    }
  }

  // Clone response before reading to avoid consumption issues
  const errorResponse = res.clone();
  let errorData;

  try {
    errorData = await errorResponse.json();
  } catch (jsonError) {
    try {
      const errorText = await errorResponse.text();
      errorData = { message: errorText || 'Unknown error' };
    } catch (textError) {
      errorData = { message: 'Unknown error' };
    }
  }

  // Handle 401 Unauthorized responses
  if (res.status === 401) {
    // Avoid multiple simultaneous refresh attempts
    if (isRefreshing) {
      throw new Error('Token refresh already in progress');
    }

    isRefreshing = true;
    console.log('Attempting token refresh...');

    try {
      // Attempt token refresh
      const refreshed = await refreshToken();
      if (!refreshed) {
        throw new Error('Token refresh failed - please login again');
      }

      // Get new token and update headers
      const newToken = await getToken();
      if (!newToken) {
        throw new Error('No new token received after refresh');
      }

      options.headers.Authorization = `Bearer ${newToken}`;
      console.debug('Retrying request with new token');

      // Retry original request
      res = await fetch(url, options);

      // If still unauthorized after refresh
      if (res.status === 401) {
        throw new Error('Still unauthorized after token refresh');
      }

      // Return successful retry response
      if (res.ok) {
        return await res.json();
      }

      // Handle error from retried request
      const retryErrorData = await res.json().catch(() => ({}));
      throw new Error(retryErrorData.message || 'Request failed after token refresh');
    } catch (refreshError) {
      console.error('Token refresh process failed:', refreshError);
      throw new Error(refreshError.message || 'Authentication failed');
    } finally {
      isRefreshing = false;
    }
  }

  // Handle all other error cases
  console.error('Request failed:', {
    url,
    status: res.status,
    error: errorData
  });

  throw new Error(
    errorData.message || 
    errorData.msg || 
    `Request failed with status ${res.status}`
  );
}




