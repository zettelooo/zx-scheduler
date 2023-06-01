import { Id } from '@zettelooo/commons'
import { v4 } from 'uuid'

// TODO: This call should be something related to the server-side:
export function generateId(): Id {
  return v4()
}
