import { getAccessToken } from '@/utils/accessToken'

const baseUrl: string = process.env.NEXT_PUBLIC_REST_URI ?? ''

export default class RulesAPI {
  public static async post<T>(endpoint: string, body: { [key: string]: string | number }): Promise<T> {
    const token = getAccessToken() || null

    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
    if (response.status !== 200) throw response

    return (await response.json()) as T
  }
}
