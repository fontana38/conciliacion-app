import { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY } from './config'

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

function buildUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }
  return url.toString()
}

async function request(path, { method = 'GET', body, isFormData = false, params } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (networkErr) {
    // eslint-disable-next-line no-console
    console.error('[api] fetch falló de verdad (red/CORS):', networkErr)
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisá tu conexión o que el backend esté disponible.',
      0,
      null
    )
  }

  // No confiamos ciegamente en el header content-type: en respuestas cross-origin
  // el navegador puede no exponerlo, y nos quedaríamos leyendo texto crudo por error.
  // Probamos JSON primero (clonando la respuesta para poder hacer fallback a texto
  // sin "gastar" el body original).
  let payload = null
  try {
    payload = await response.clone().json()
  } catch (jsonErr) {
    try {
      payload = await response.text()
    } catch (textErr) {
      payload = null
    }
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.message || payload.error)) ||
      `Error ${response.status} al comunicarse con el servidor.`
    throw new ApiError(message, response.status, payload)
  }

  return payload
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body, params) => request(path, { method: 'POST', body, params }),
  postFile: (path, file, { fieldName = 'file', params } = {}) => {
    const formData = new FormData()
    formData.append(fieldName, file)
    return request(path, { method: 'POST', body: formData, isFormData: true, params })
  },
}

export { ApiError }
