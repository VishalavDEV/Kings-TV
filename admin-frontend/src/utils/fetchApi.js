import api from './axios';

export const fetchApi = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  
  // Format target URL to match backend routing mappings
  let formattedUrl = endpoint;
  if (endpoint.startsWith('/public/')) {
    formattedUrl = `/api${endpoint}`;
  } else if (endpoint.startsWith('/api/')) {
    formattedUrl = endpoint;
  } else {
    formattedUrl = `/api/v1${endpoint}`;
  }

  const config = {
    method,
    url: formattedUrl,
    headers: options.headers || {},
  };

  if (options.body) {
    if (options.body instanceof FormData) {
      config.data = options.body;
    } else {
      try {
        config.data = JSON.parse(options.body);
      } catch (e) {
        config.data = options.body;
      }
    }
  }

  const response = await api(config);
  return response.data;
};
