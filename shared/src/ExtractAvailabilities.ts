import { Timestamp } from '@zettelooo/commons'
import { Slot } from './Slot'

export namespace ExtractAvailabilities {
  export interface Input {
    readonly description: string
    /** The same as `Date.prototype.toString()` */
    readonly currentTimestampStringified: string
  }

  export type Output =
    | {
        readonly accepted: false
      }
    | {
        readonly accepted: true
        readonly availableSlots: readonly Slot[]
      }
}
