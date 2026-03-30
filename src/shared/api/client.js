import axios from 'axios'

const rawApiUrl = (import.meta.env.VITE_API_URL ?? '').trim()
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '')

const API_BASE_URL = normalizedApiUrl

const HTTP_STATUS_MESSAGES = {
  400: 'Некоректний запит.',
  401: 'Потрібна авторизація.',
  403: 'Доступ заборонено.',
  404: 'Ресурс не знайдено.',
  409: 'Конфлікт даних. Спробуйте ще раз.',
  422: 'Дані містять помилки.',
  429: 'Забагато запитів. Спробуйте пізніше.',
  500: 'Внутрішня помилка сервера.',
  502: 'Сервіс тимчасово недоступний.',
  503: 'Сервіс тимчасово недоступний.',
  504: 'Сервер не відповідає. Спробуйте пізніше.'
}

const RAW_ERROR_MESSAGE_TRANSLATIONS = {
  'Network Error': "Не вдалося з'єднатися з сервером. Перевірте підключення до інтернету.",
  'Failed to fetch': "Не вдалося з'єднатися з сервером. Перевірте підключення до інтернету.",
  'Load failed': "Не вдалося з'єднатися з сервером. Перевірте підключення до інтернету."
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000
})

const REFRESH_ENDPOINT = '/auth/refresh'
const LOGOUT_ENDPOINT = '/auth/logout'
const RETRY_REQUEST_FLAG = '__isRetryRequest'
const SKIP_AUTH_REFRESH_FLAG = 'skipAuthRefresh'

let refreshSessionPromise = null
let authExpiredHandler = null
let isAuthExpiredHandlerRunning = false

export const getApiBaseUrl = () => API_BASE_URL

export const setAuthExpiredHandler = (handler) => {
  authExpiredHandler = typeof handler === 'function' ? handler : null
}

const normalizeMessage = (value) => (typeof value === 'string' ? value.trim() : '')

const shouldTryRefresh = (error) => {
  const originalRequest = error?.config
  const status = Number(error?.response?.status)
  const requestUrl = normalizeMessage(originalRequest?.url)

  if (status !== 401 || !originalRequest) return false
  if (originalRequest[RETRY_REQUEST_FLAG]) return false
  if (originalRequest[SKIP_AUTH_REFRESH_FLAG]) return false
  if (requestUrl.includes(REFRESH_ENDPOINT) || requestUrl.includes(LOGOUT_ENDPOINT)) return false

  return true
}

const refreshSession = async () => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = refreshClient.post(REFRESH_ENDPOINT, {}).finally(() => {
      refreshSessionPromise = null
    })
  }

  return refreshSessionPromise
}

const notifyAuthExpired = (error) => {
  if (!authExpiredHandler || isAuthExpiredHandlerRunning) return

  isAuthExpiredHandlerRunning = true

  Promise.resolve(authExpiredHandler(error))
    .catch(() => {
      // User-facing handler failures should not break API error flow.
    })
    .finally(() => {
      isAuthExpiredHandlerRunning = false
    })
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!shouldTryRefresh(error)) {
      return Promise.reject(error)
    }

    const originalRequest = error.config
    originalRequest[RETRY_REQUEST_FLAG] = true

    try {
      await refreshSession()
      return api.request(originalRequest)
    } catch (refreshError) {
      notifyAuthExpired(refreshError)
      return Promise.reject(refreshError)
    }
  }
)

const getTransportErrorMessage = (error) => {
  const code = normalizeMessage(error?.code)
  const message = normalizeMessage(error?.message)

  if (code === 'ERR_CANCELED') return 'Запит скасовано.'
  if (code === 'ECONNABORTED' || /timeout/i.test(message)) {
    return 'Час очікування запиту вичерпано. Спробуйте ще раз.'
  }
  if (RAW_ERROR_MESSAGE_TRANSLATIONS[message]) {
    return RAW_ERROR_MESSAGE_TRANSLATIONS[message]
  }
  if (code === 'ERR_NETWORK') {
    return "Не вдалося з'єднатися з сервером. Перевірте підключення до інтернету."
  }

  return ''
}

export const getErrorMessage = (error, fallback = 'Не вдалося виконати запит.') => {
  const detailMessage = normalizeMessage(error?.response?.data?.detail)
  if (detailMessage) return detailMessage

  const apiMessage = normalizeMessage(error?.response?.data?.message)
  if (apiMessage) return apiMessage

  const statusMessage = HTTP_STATUS_MESSAGES[Number(error?.response?.status)]
  if (statusMessage) return statusMessage

  const transportMessage = getTransportErrorMessage(error)
  if (transportMessage) return transportMessage

  const rawMessage = normalizeMessage(error?.message)
  if (rawMessage && !/^Request failed with status code \d+$/i.test(rawMessage)) {
    return rawMessage
  }

  return fallback
}

export default api
