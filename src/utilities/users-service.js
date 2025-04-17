// users-service.js in utilities 
import * as usersAPI from './users-api';

export async function signUp(userData) {
  try {
    const response = await usersAPI.signUp(userData);
    if (!response.accessToken || !response.refreshToken) {
      throw new Error('Invalid signup response: Missing accessToken or refreshToken');
    }
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    console.log('Tokens stored (signup):', {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
    return getUser();
  } catch (e) {
    console.error('SignUp error:', e.message);
    return null;
  }
}

export async function login(credentials) {
  try {
    const response = await usersAPI.login(credentials);
    if (!response.accessToken || !response.refreshToken) {
      throw new Error('Invalid login response: Missing accessToken or refreshToken');
    }
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    console.log('Tokens stored (login):', {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
    return getUser();
  } catch (e) {
    console.error('Login error:', e.message);
    return null;
  }
}

export async function getProfile() {
  try {
    return await usersAPI.getProfile();
  } catch (e) {
    console.error('GetProfile error:', e.message);
    return null;
  }
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.warn('No refresh token found');
    return null;
  }
  try {
    const response = await usersAPI.refreshToken(refreshToken);
    if (!response.accessToken) {
      throw new Error('Invalid refresh token response: Missing accessToken');
    }
    localStorage.setItem('accessToken', response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
      console.log('New refresh token stored:', response.refreshToken);
    }
    return getUser();
  } catch (e) {
    console.error('RefreshToken error:', e.message);
    if (e.message.includes('Unauthorized') || e.message.includes('Invalid refresh token')) {
      logOut();
    }
    return null;
  }
}

export async function getToken() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.warn('No access token found');
    return null;
  }
  try {
    if (!token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)) {
      throw new Error('Invalid token format');
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Date.now() / 1000) {
      return await refreshToken();
    }
    return token;
  } catch (e) {
    console.error('GetToken error:', e.message);
    return null;
  }
}

export function getUser() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }
  try {
    if (!token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)) {
      throw new Error('Invalid token format in getUser');
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user || null;
  } catch (e) {
    console.error('GetUser error:', e.message);
    return null;
  }
}

export function logOut() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export async function checkToken() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return false;
  }
  try {
    if (!token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)) {
      throw new Error('Invalid token format in checkToken');
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiration = payload.exp * 1000;
    if (expiration < Date.now()) {
      const user = await refreshToken();
      return !!user;
    }
    return true;
  } catch (e) {
    console.error('CheckToken error:', e.message);
    return false;
  }
}