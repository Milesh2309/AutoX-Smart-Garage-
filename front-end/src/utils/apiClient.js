const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export const AUTH_TOKEN_STORAGE_KEY = 'authToken';
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';

export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch (_error) {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }
  } catch (_error) {
    // ignore storage errors
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch (_error) {
    // ignore storage errors
  }
};

export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch (_error) {
    return null;
  }
};

export const setRefreshToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    }
  } catch (_error) {
    // ignore storage errors
  }
};

export const clearRefreshToken = () => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch (_error) {
    // ignore storage errors
  }
};

let refreshPromise = null;

const shouldTryRefresh = (error) => {
  if (error?.status !== 401) return false;
  const message = String(error?.message || '').toLowerCase();
  return message.includes('token expired') || message.includes('invalid token') || message.includes('access denied');
};

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Refresh token not available');
  }

  refreshPromise = (async () => {
    const tryRefresh = async (path) => {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      return parseResponse(response);
    };

    try {
      let payload;
      try {
        payload = await tryRefresh('/auth/refresh-token');
      } catch (_primaryError) {
        payload = await tryRefresh('/refresh-token');
      }

      const nextToken = payload?.accessToken || payload?.token;
      if (!nextToken) {
        throw new Error('Unable to refresh access token');
      }

      setAuthToken(nextToken);
      return nextToken;
    } catch (error) {
      clearAuthToken();
      clearRefreshToken();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const buildHeaders = (headers = {}, auth = true) => {
  const token = getAuthToken();
  const baseHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth && token) {
    baseHeaders.Authorization = `Bearer ${token}`;
  }

  return baseHeaders;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const apiRequest = async (path, options = {}) => {
  const { auth = true, headers, _retried = false, ...restOptions } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: buildHeaders(headers, auth),
    });

    return await parseResponse(response);
  } catch (error) {
    if (auth && !_retried && shouldTryRefresh(error)) {
      await refreshAccessToken();
      return apiRequest(path, { ...options, _retried: true });
    }
    throw error;
  }
};

export const apiGet = (path, options = {}) => apiRequest(path, { ...options, method: 'GET' });
export const apiPost = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const apiPut = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: 'PUT', body: JSON.stringify(body || {}) });
export const apiPatch = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: 'PATCH', body: JSON.stringify(body || {}) });
export const apiDelete = (path, options = {}) => apiRequest(path, { ...options, method: 'DELETE' });
