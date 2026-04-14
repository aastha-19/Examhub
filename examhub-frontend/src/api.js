const API_BASE = 'http://localhost:8080';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
      if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
      }
      let errMessage = 'API Request Failed';
      try {
          const text = await response.text();
          try {
              const errData = JSON.parse(text);
              errMessage = errData.message || errMessage;
          } catch (e) {
              errMessage = text || errMessage;
          }
      } catch (e) {
          console.error("Failed to read error response", e);
      }
      throw new Error(errMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
  } else {
      return response.text();
  }
};
