import { Slot } from './Slot'

export type CardExtensionData =
  | undefined
  | {
      readonly processed: true
      readonly accepted: false
    }
  | ({
      readonly processed: true
      readonly accepted: true
      readonly reservedBy?: {
        readonly name: string
        readonly email: string
      }
    } & Slot)

export namespace CardExtensionData {
  export function equals(first: CardExtensionData, second: CardExtensionData): boolean {
    return Boolean(
      first === second ||
        (first?.processed === second?.processed &&
          first?.accepted === second?.accepted &&
          ((!first?.accepted && !second?.accepted) ||
            (first?.accepted &&
              second?.accepted &&
              first.fromTimestamp === second.fromTimestamp &&
              first.toTimestamp === second.toTimestamp &&
              ((!first.reservedBy && !second.reservedBy) ||
                (first.reservedBy &&
                  second.reservedBy &&
                  first.reservedBy.name === second.reservedBy.name &&
                  first.reservedBy.email === second.reservedBy.email)))))
    )
  }
}
