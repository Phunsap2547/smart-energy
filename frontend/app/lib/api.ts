// //lib/api.ts
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// export async function apiFetch(path: string, options: RequestInit = {}) {
//   const token = localStorage.getItem('admin_token'); // ปรับ key ให้ตรงกับที่ใช้จริง

//   const res = await fetch(`${API_BASE_URL}${path}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...options.headers,
//     },
//   });

//   if (res.status === 401 || res.status === 403) {
//     localStorage.removeItem('admin_token');
//     window.location.href = '/admin/login';
//     throw new Error('Unauthorized');
//   }

//   if (!res.ok) {
//     const body = await res.json().catch(() => ({}));
//     throw new Error(body.message || `Request failed: ${res.status}`);
//   }

//   return res.json();
// }


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const TOKEN_KEY = 'adminToken';
export const LOGIN_PATH = '/admin/login';

export const getToken = () =>
  typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);

export const clearToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
};

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = LOGIN_PATH;
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}