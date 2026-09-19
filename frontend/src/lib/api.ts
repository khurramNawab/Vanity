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
      let errorMsg = data.message;
      
      if (!errorMsg && data.errors) {
        if (typeof data.errors === 'object') {
          errorMsg = Object.values(data.errors).flat().join(', ');
        } else if (typeof data.errors === 'string') {
          errorMsg = data.errors;
        }
      }

      if (!errorMsg) {
        if (response.status === 409) {
          errorMsg = 'This email address is already registered. Please sign in instead.';
        } else if (response.status === 422) {
          errorMsg = 'Validation error. Please check the entered details.';
        } else if (response.status === 401) {
          errorMsg = 'Invalid email or password. Please try again.';
        } else if (response.status === 403) {
          errorMsg = 'Access denied. You do not have permission to perform this action.';
        } else if (response.status === 429) {
          errorMsg = 'Too many requests. Please wait a moment and try again.';
        } else if (response.status === 500) {
          errorMsg = 'Internal server error. Please try again later.';
        } else {
          errorMsg = `Server error (${response.status}). Please try again.`;
        }
      }

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
