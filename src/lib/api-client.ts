const ADMIN_KEY = 'convivio_admin_token'

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_KEY)
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(ADMIN_KEY, token)
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_KEY)
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options?: { admin?: boolean },
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (options?.admin) {
    const token = getAdminToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(path, { ...init, headers })
  const text = await response.text()
  const data = text ? (JSON.parse(text) as unknown) : null

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: string }).error)
        : response.statusText
    throw new ApiError(message, response.status, data)
  }

  return data as T
}