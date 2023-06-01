import { SERVER_BASE_URL } from '../constants'

export async function sendReservationRequest(
  cardId: string,
  email: string,
  name: string
): Promise<{ emailSuccess: boolean }> {
  const response = await fetch(`${SERVER_BASE_URL}/card/${cardId}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  })
  const { emailSuccess } = await response.json()

  return {
    emailSuccess,
  }
}
