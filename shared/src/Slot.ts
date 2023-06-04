import { Timestamp } from '@zettelooo/commons'

export interface Slot {
  readonly fromTimestamp: Timestamp
  readonly toTimestamp: Timestamp
}
