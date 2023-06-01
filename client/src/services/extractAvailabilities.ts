import { ExtractAvailabilities } from 'shared'
import { SERVER_BASE_URL } from '../constants'

export async function extractAvailabilities(input: ExtractAvailabilities.Input): Promise<ExtractAvailabilities.Output> {
  const response = await fetch(`${SERVER_BASE_URL}/extract-availabilities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  })
  const { output } = await response.json()

  return output
}
