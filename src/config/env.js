const API_BASE_URL =
  window.APP_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
const AUTH_TOKEN =
  window.APP_CONFIG?.AUTH_TOKEN || import.meta.env.VITE_AUTH_TOKEN;
const NEW_TOKEN =
  window.APP_CONFIG?.NEW_TOKEN || import.meta.env.VITE_NEW_TOKEN;

export { API_BASE_URL, AUTH_TOKEN, NEW_TOKEN };
