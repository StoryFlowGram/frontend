import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './client'

describe('getErrorMessage', () => {
  it('Повертає detail з відповіді API', () => {
    const error = { response: { data: { detail: 'Помилка API ' } } }
    expect(getErrorMessage(error, 'Резервне повідомлення')).toBe('Помилка API')
  })

  it('Повертає локалізоване повідомлення для мережевої помилки', () => {
    const error = { message: 'Network Error' }
    expect(getErrorMessage(error, 'Резервне повідомлення')).toBe(
      "Не вдалося з'єднатися з сервером. Перевірте підключення до інтернету."
    )
  })

  it('Повертає повідомлення за HTTP-статусом', () => {
    const error = { response: { status: 404, data: {} } }
    expect(getErrorMessage(error, 'Резервне повідомлення')).toBe('Ресурс не знайдено.')
  })

  it('Повертає fallback при порожньому форматі помилки', () => {
    expect(getErrorMessage({}, 'Резервне повідомлення')).toBe('Резервне повідомлення')
  })
})
