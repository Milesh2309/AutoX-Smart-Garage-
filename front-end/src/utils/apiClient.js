const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const AUTH_TOKEN_STORAGE_KEY = 'authToken';

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
  const { auth = true, headers, ...restOptions } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...restOptions,
    headers: buildHeaders(headers, auth),
  });

  return parseResponse(response);
};

export const apiGet = (path, options = {}) => apiRequest(path, { ...options, method: 'GET' });
export const apiPost = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const apiPut = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: 'PUT', body: JSON.stringify(body || {}) });
export const apiPatch = (path, body, options = {}) =>
  apiRequest(path, { ...options, method: 'PATCH', body: JSON.stringify(body || {}) });
export const apiDelete = (path, options = {}) => apiRequest(path, { ...options, method: 'DELETE' });
