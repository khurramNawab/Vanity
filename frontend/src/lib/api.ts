const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vanity_token') : null;

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If it's a FormData request, let the browser set boundary headers automatically
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : `Server returned ${response.status}`);
      
      // If 401 Unauthorized, log warning
      if (response.status === 401 && typeof window !== 'undefined') {
        console.warn(`Authentication required for ${endpoint}`);
      }

      return {
        success: false,
        message: errorMsg,
        status: response.status,
        ...data,
      };
    }

    if (data && typeof data === 'object' && data.success === undefined) {
      data.success = true;
    }

    return data;
  } catch (err: any) {
    console.error(`Network error on ${endpoint}:`, err);
    return {
      success: false,
      message: err.message || 'Network connection failed. Please check backend server.',
      status: 0,
    };
  }
}
