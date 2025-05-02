// users-service.js
import * as usersAPI from './users-api';
import { jwtDecode } from 'jwt-decode';

// Token management constants
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Token refresh synchronization
let refreshPromise = null;

export async function signUp(userData) {
  try {
    const response = await usersAPI.signUp(userData);
    validateAndStoreTokens(response);
    return getUser();
  } catch (error) {
    console.error('SignUp error:', {
      message: error.message,
      stack: error.stack,
      userData: { ...userData, password: '[REDACTED]' }
    });
    throw new Error('Registration failed. Please try again.');
  }
}

export async function login(credentials) {
  try {
    console.debug('Attempting login with email:', credentials.email);
    const response = await usersAPI.login(credentials);
    validateAndStoreTokens(response);
    
    const user = getUser();
    console.debug('Login successful for user:', user);
    return user;
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      email: credentials.email
    });
    throw new Error('Login failed. Please check your credentials.');
  }
}

export async function getProfile() {
  try {
    const profile = await usersAPI.getProfile();
    console.debug('Profile retrieved successfully');
    return profile;
  } catch (error) {
    console.error('GetProfile error:', error.message);
    throw new Error('Failed to load profile. Please try again.');
  }
}

export async function refreshToken() {
  // If refresh is already in progress, return the existing promise
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshTokenValue) {
    console.warn('No refresh token available');
    throw new Error('Session expired. Please login again.');
  }

  try {
    refreshPromise = usersAPI.refreshToken(refreshTokenValue);
    const response = await refreshPromise;

    if (!response?.accessToken) {
      throw new Error('Invalid token response from server');
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    
    // Only update refresh token if a new one was provided
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      console.debug('Refresh token updated');
    }

    console.debug('Token refresh successful');
    return getUser();
  } catch (error) {
    console.error('RefreshToken error:', {
      message: error.message,
      stack: error.stack
    });

    // Clear tokens if refresh failed due to invalid token
    if (error.message.includes('Unauthorized') || 
        error.message.includes('Invalid') || 
        error.message.includes('expired')) {
      logOut();
    }

    throw new Error('Session refresh failed. Please login again.');
  } finally {
    refreshPromise = null;
  }
}

export function getUser() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;

  try {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
      throw new Error('Invalid token payload');
    }
    
    // Check token expiration
    if (payload.exp * 1000 < Date.now()) {
      console.debug('Token expired');
      return null;
    }

    return payload.user || null;
  } catch (error) {
    console.error('GetUser error:', error.message);
    return null;
  }
}

export function logOut() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  console.debug('User logged out');
}

export async function checkToken() {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return false;

    const payload = parseJwt(token);
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      console.debug('Token expired, attempting refresh');
      const user = await refreshToken();
      return !!user;
    }
    
    return true;
  } catch (error) {
    console.error('CheckToken error:', error.message);
    return false;
  }
}

export async function getToken() {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;

    const payload = parseJwt(token);
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      console.debug('Token expired, refreshing...');
      await refreshToken();
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    return token;
  } catch (error) {
    console.error('GetToken error:', error.message);
    return null;
  }
}

// ---------- Utility Functions ----------

function validateAndStoreTokens({ accessToken, refreshToken }) {
  if (!accessToken) {
    throw new Error('Missing access token');
  }

  // Refresh token is optional in case the server doesn't return a new one
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  console.debug('Tokens stored successfully');
}

function parseJwt(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token format');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT structure');
  }

  try {
    // Prefer jwt-decode library for proper decoding
    return jwtDecode(token);
  } catch (decodeError) {
    console.warn('jwt-decode failed, falling back to manual parsing:', decodeError);
    
    try {
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (parseError) {
      throw new Error('Failed to parse JWT payload');
    }
  }
}

