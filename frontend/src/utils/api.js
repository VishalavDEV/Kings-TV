const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';

export const fetchApi = async (endpoint, options = {}) => {
  const session = JSON.parse(localStorage.getItem('king24x7_session') || 'null');
  const headers = {
    'Content-Type': 'application/json',
    ...(session && session.token ? { 'Authorization': `Bearer ${session.token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};
