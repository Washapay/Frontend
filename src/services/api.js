const PROXY_URL = window.API_URL;

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${PROXY_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensaje = data?.message || data?.error || "Error en la petición";
    throw new Error(mensaje);
  }

  return data;
}
