import { ExtractDuration } from 'shared'
import { SERVER_BASE_URL } from '../constants'

export async function extractDuration(input: ExtractDuration.Input): Promise<ExtractDuration.Output> {
  const response = await fetch(`${SERVER_BASE_URL}/extract-duration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  })
  const { output } = await response.json()

  return output
}
