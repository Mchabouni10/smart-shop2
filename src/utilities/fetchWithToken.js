// utilities/fetchWithToken.js

import { refreshToken } from './users-service';

export async function fetchWithToken(url, options = {}) {
  // Get current access token
  let token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No access token available');
  }

  // Prepare fetch options with authorization header
  const fetchOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      // Only set Content-Type for requests with body
      ...(options.body && { 'Content-Type': 'application/json' }),
    },
    credentials: 'include', // Include cookies for refresh token
  };

  // First attempt
  let res = await fetch(url, fetchOptions);

  // If unauthorized, try refreshing token
  if (res.status === 401) {
    console.log('Access token expired, attempting refresh...');
    
    try {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (!refreshed) {
        throw new Error('Token refresh failed');
      }

      // Get new token and update headers
      token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No new access token after refresh');
      }

      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`
      };

      // Clone the original request with new token
      res = await fetch(url, fetchOptions);

      // If still unauthorized after refresh
      if (res.status === 401) {
        throw new Error('Still unauthorized after token refresh');
      }
    } catch (refreshError) {
      console.error('Token refresh error:', refreshError);
      throw new Error(`Request failed: ${refreshError.message}`);
    }
  }

  // Handle other error statuses
  if (!res.ok) {
    // Clone response before reading to avoid consumption issues
    const errorRes = res.clone();
    let errorData;
    try {
      errorData = await errorRes.json();
    } catch (e) {
      errorData = { message: await errorRes.text() };
    }
    console.error('Request failed:', {
      url,
      status: res.status,
      error: errorData
    });
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  return res;
}
