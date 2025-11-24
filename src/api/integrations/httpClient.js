function buildHeaders(headers = {}) {
  return {
    'Content-Type': 'application/json',
    ...headers,
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Integration request failed (${response.status}): ${message}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function request({ url, method = 'GET', headers = {}, body }) {
  const response = await fetch(url, {
    method,
    headers: buildHeaders(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse(response);
}

export function buildAuthHeaders(token) {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
