import { Slot } from './Slot'

export namespace ExtractAvailabilities {
  export interface Input {
    readonly description: string
    readonly now: string
  }

  export type Output =
    | {
        readonly accepted: false
      }
    | {
        readonly accepted: true
        readonly availableSlots: readonly Slot.Unparsed[]
      }
}
