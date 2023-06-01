import { Slot } from 'shared'
import { SERVER_BASE_URL } from '../constants'

export async function sendAvailabilities(
  pageId: string,
  devidedAvailableSlots: readonly Slot[],
  durationMinutes: number
): Promise<void> {
  await fetch(`${SERVER_BASE_URL}/page/${pageId}/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ devidedAvailableSlots, durationMinutes }),
  })
}
